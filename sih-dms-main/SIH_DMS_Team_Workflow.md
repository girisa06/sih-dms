# Secure digital document management system — team workflow
**SIH 2026 · team of 6 · 2-day build**

## System snapshot

- **What**: a secure DMS for FIRs, chargesheets, forensic reports, and court filings, with role-based access, tamper-evident audit trails, and AI-assisted search.
- **The hero features**: hash-chain chain of custody, envelope-encrypted storage, auto-generated Section 63 (BSA) admissibility certificates, AI-based OCR/classification/search.
- **Rule for this sprint**: nobody invents their own field names or endpoint shapes. Everyone builds against the schema and API map below. This is what stops six people from producing six things that don't fit together.

---

## Hour 0 — lock the contract before anyone writes app code

Whole team, 30–45 minutes. Walk through the schema and API map together, agree on it out loud, then split up. Person 1 drafts it beforehand so this is a review, not a design-from-scratch session.

### Core schema

```
users            id, name, email, password_hash, role, created_at
cases            id, case_number, title, created_by, status, created_at
case_access      case_id, user_id, granted_by, expires_at
documents        id, case_id, doc_type, uploaded_by, version,
                 storage_path, evidentiary_hash, wrapped_dek, nonce,
                 mime_type, ocr_text, classification, entities (json),
                 created_at
audit_log        id, document_id, actor_id, action, prev_hash,
                 event_hash, timestamp
signatures       id, document_id, signer_id, signature_value, signed_at
evidence_assign  id, document_id, forensic_expert_id, assigned_by, status
```

- `users.role` ∈ `officer, prosecutor, forensic_expert, judge, admin`
- `documents.doc_type` ∈ `fir, chargesheet, forensic_report, witness_statement, court_filing, evidence`
- `documents.entities` is a JSON blob: `{"case_no": "...", "sections": [...], "names": [...], "dates": [...]}`

### API ownership map

| Endpoint | Owner | Purpose | Consumed by |
|---|---|---|---|
| `POST /auth/login` | Person 1 | Issue JWT with role claim | Everyone (frontend) |
| `POST /cases`, `GET /cases`, `GET /cases/{id}` | Person 1 | Case CRUD | Person 4, 5 |
| `POST /cases/{id}/access` | Person 1 | Grant time-bound sharing | Person 5 |
| `POST /cases/{id}/documents` | Person 1 (calls Person 2 internally) | Upload → hash + encrypt + store, returns `document_id` | Person 3 (triggers AI), Person 4 |
| `GET /documents/{id}`, `GET /documents/{id}/versions` | Person 1 | Fetch metadata + version history | Person 5 |
| `POST /documents/{id}/verify` | Person 2 | Recompute hash chain, pass/fail | Person 5 |
| `GET /documents/{id}/audit-log` | Person 2 | Chain-of-custody event list | Person 5 |
| `POST /documents/{id}/sign` | Person 2 | Digital signature | Person 4 |
| `POST /documents/{id}/certificate` | Person 2 | Section 63 certificate PDF | Person 5 |
| `GET /documents/{id}/download` | Person 2 | Decrypt + watermark + stream | Person 5 |
| `POST /ai/process/{document_id}` | Person 3 | OCR + classify + extract entities, writes back to `documents` | Triggered by Person 1's upload flow |
| `GET /search?q=` | Person 3 | Search across `ocr_text` / `entities` | Person 4, 5 |

---

## Person 1 — backend lead

**Owns**: auth, RBAC, case & document CRUD, the schema itself. Everyone else's Hour 4 checkpoint depends on this person shipping first.

**Day 1 morning**
- [ ] Finalize and migrate the schema above
- [ ] JWT auth + role middleware (`Depends(require_role(...))` pattern)
- [ ] Case CRUD endpoints
- [ ] Publish OpenAPI docs (FastAPI gives you this for free at `/docs`) — this *is* the hour-4 deliverable

**Day 1 afternoon/evening**
- [ ] Document upload endpoint — calls Person 2's `encrypt_and_store()` function, writes the `documents` row, kicks off Person 3's AI processing as a background task
- [ ] `case_access` sharing endpoint with `expires_at`
- [ ] Sync with Person 4/5: confirm response shapes match what frontend is coding against

**Day 2**
- [ ] Fix integration breaks as Person 2/3's endpoints come online
- [ ] Help Person 6 with demo data seeding (you own the schema, so you can write the seed script fastest)
- [ ] Freeze API changes by evening — no new fields after this

**Hands off to**: Person 2 (upload flow), Person 3 (document_id after upload), Person 4/5 (all API responses)

---

## Person 2 — security engineer

**Owns**: hashing, envelope encryption, hash-chain audit ledger, signatures, tamper verification, the Section 63 certificate.

**Day 1 morning**
- [ ] `encrypt_and_store(plaintext, doc_id)` — SHA-256 hash, AES-256-GCM encrypt with per-file DEK, wrap DEK with master KEK (env var for the demo)
- [ ] Hand this function to Person 1 by midday — their upload endpoint calls it directly

**Day 1 afternoon/evening**
- [ ] `audit_log` append-on-every-action (upload/view/edit/share), each event hashed to the previous one
- [ ] `POST /documents/{id}/verify` — recompute the chain, return pass/fail
- [ ] Agree the exact JSON shape of `GET /documents/{id}/audit-log` with Person 5 *before* they build the chain-of-custody screen against it

**Day 2**
- [ ] Digital signatures on upload/sign actions
- [ ] `GET /documents/{id}/download` — decrypt in memory, watermark, stream (never write plaintext to disk)
- [ ] Section 63 certificate generator (template PDF pulling hash + metadata)
- [ ] Support Person 5 integrating the tamper-check button

**Hands off to**: Person 1 (encryption function), Person 5 (audit log shape, certificate endpoint)

---

## Person 3 — AI/ML engineer

**Owns**: OCR, document auto-classification, entity extraction, search relevance.

**Day 1 morning**
- [ ] Tesseract OCR pipeline on a handful of sample scanned FIRs — get raw text extraction working first, tune later
- [ ] Agree the `entities` JSON shape with Person 1/5 (see schema above) so nobody guesses field names later

**Day 1 afternoon/evening**
- [ ] `POST /ai/process/{document_id}` — runs OCR → writes `ocr_text`, `classification`, `entities` back onto the existing `documents` row (don't create a parallel table, write into Person 1's row)
- [ ] TF-IDF + logistic regression classifier for doc_type (FIR / chargesheet / forensic report / etc.), trained on whatever sample docs you can generate or scrape

**Day 2**
- [ ] Entity extraction (case number, IPC/BNS sections, names, dates) — regex + spaCy NER is enough, don't reach for an LLM under time pressure
- [ ] `GET /search?q=` — keyword search over `ocr_text` + `entities` first; only add semantic/embedding search if this is solid with hours to spare
- [ ] Sit with Person 4/5 to make sure classification tags and search results render correctly

**Hands off to**: reads `document_id` from Person 1's upload, writes into the same `documents` row, Person 4/5 render your output.

---

## Person 4 — frontend lead

**Owns**: app shell, auth flow, role-based dashboards, upload UI.

**Day 1 morning**
- [ ] React project shell, routing, login screen
- [ ] Start against Person 1's OpenAPI docs the moment they're published — don't wait for the whole backend to be "done," mock what isn't ready yet

**Day 1 afternoon/evening**
- [ ] Five role-based dashboard shells: officer, prosecutor, forensic expert, judge/clerk, admin — each with the correct scoped view (see RBAC table from earlier in this build)
- [ ] Upload flow UI with progress state and OCR preview once Person 3's endpoint exists

**Day 2**
- [ ] Wire signature action (Person 2) into the officer/forensic-expert flows
- [ ] Polish: empty states, loading states, error states — these matter more than people think in a live demo
- [ ] Full walkthrough with Person 6 during rehearsal

**Hands off to**: consumes Person 1's auth/case/doc APIs, Person 2's sign endpoint.

---

## Person 5 — frontend, case & audit UI

**Owns**: case detail/timeline, document viewer, chain-of-custody visualization (your single most important screen for judges), sharing UI, version history.

**Day 1 morning**
- [ ] Case detail/timeline layout against Person 1's case endpoints (mock data is fine until real data flows)

**Day 1 afternoon/evening**
- [ ] Document viewer (PDF/image preview)
- [ ] Version history/diff view

**Day 2**
- [ ] Chain-of-custody visualization — render Person 2's `audit-log` response as a visible, timestamped, hash-linked trail. This is the screen you spend the most polish time on.
- [ ] Tamper-check button wired to Person 2's `/verify` endpoint, with a clear pass/fail state
- [ ] Sharing UI (time-bound access, tied to `case_access.expires_at`)
- [ ] Search results UI wired to Person 3's `/search`, showing AI tags/entities on each result

**Hands off to**: consumes Person 1's case/doc APIs, Person 2's audit-log/verify/certificate endpoints, Person 3's search/classification output.

---

## Person 6 — integration, DevOps & pitch

**Owns**: the thing that makes everyone else's work demo-able. This role has the least "own code" and the most "make sure it all runs together."

**Day 1 morning**
- [ ] Docker Compose skeleton (Postgres + backend + frontend) so the team has one command to run everything, even while pieces are half-built
- [ ] Set up the repo structure and branch/merge convention so five people pushing code doesn't turn into merge hell

**Day 1 afternoon/evening**
- [ ] First integration pass once Person 1's login → upload → list flow works end to end
- [ ] Start drafting the pitch deck skeleton (problem → hero features → architecture → demo → impact)

**Day 2**
- [ ] Seed realistic demo data: one full mock case (FIR → investigation → chargesheet → forensic report → court filing) that exercises every feature — this is what you'll actually demo, so build it deliberately, not randomly
- [ ] Continuous integration testing as features land — you're the first to catch when Person 3's field names don't match what Person 5 expects
- [ ] Own the demo script and rehearse the full run-through at least twice
- [ ] Prepare answers for likely judge questions: data privacy/DPDP compliance, how this feeds into ICJS, realistic deployment path

**Hands off to / depends on**: everyone. This role is the integration glue and should be pinging the group chat constantly, not coding in isolation.

---

## Integration points — the ones that actually break things

| From | To | What crosses the wire | Watch out for |
|---|---|---|---|
| Person 1 upload endpoint | Person 2 `encrypt_and_store()` | plaintext bytes + doc_id | function signature must be agreed before Person 1 codes the endpoint around it |
| Person 1 upload endpoint | Person 3 `/ai/process` | `document_id` (background trigger) | make this async — don't block the upload response on OCR finishing |
| Person 2 audit log | Person 5 chain-of-custody UI | JSON array of `{action, actor, timestamp, event_hash}` | lock this shape on Day 1, before Person 5 builds the visualization against it |
| Person 3 AI output | Person 4/5 tags & search UI | `classification`, `entities` fields on the same `documents` row | Person 3 writes into Person 1's existing row — don't create a second table that needs joining |
| Person 1 case_access | Person 5 sharing UI | `expires_at` timestamp | UI must show "expired" state, not just fail silently on a denied request |
| Everyone | Person 6 demo data | every field above, populated realistically | seed data can only be written once the schema is stable — don't seed before Hour 4 |

---

## Sync checkpoints

1. **Kickoff (Hour 0)** — schema and API map locked, whole team.
2. **Midday, Day 1** — Person 1's API contract is live in `/docs`; Person 4/5 stop mocking and start building against real endpoints.
3. **End of Day 1** — login → upload → list works end to end, even if ugly. If this isn't true, that's tonight's fire, not tomorrow's.
4. **Midday, Day 2** — AI processing and hash-chain/audit features are flowing into the main app, not sitting in isolated branches.
5. **Evening, Day 2 — feature freeze** — no new features. Only demo-blocking bug fixes from here.
6. **Final rehearsal** — full run-through of the seeded demo case, twice, with someone playing "skeptical judge."
