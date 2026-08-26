# API & Schema Contract (locked — Hour 0)

Owner: Person 1 (backend lead). This is the source of truth for schema, endpoints, roles, and integration shapes. No new fields/endpoints without updating this doc first. Frozen for new fields end of Day 2 evening.

---

## 1. Roles

`users.role` is one of:

- `officer`
- `prosecutor`
- `forensic_expert`
- `judge`
- `admin`

---

## 2. Core schema

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

`documents.doc_type` is one of:

- `fir`
- `chargesheet`
- `forensic_report`
- `witness_statement`
- `court_filing`
- `evidence`

`documents.entities` JSON shape:

```json
{
  "case_no": "string",
  "sections": ["string"],
  "names": ["string"],
  "dates": ["string"]
}
```

AI/search consumers must read/write exactly these four keys — no additional keys without updating this contract.

---

## 3. API ownership map

| Endpoint | Owner | Purpose | Consumed by |
|---|---|---|---|
| `POST /auth/login` | Person 1 | Issue JWT with role claim | Everyone (frontend) |
| `POST /cases` | Person 1 | Create case | Person 4, 5 |
| `GET /cases` | Person 1 | List cases | Person 4, 5 |
| `GET /cases/{id}` | Person 1 | Get case detail | Person 4, 5 |
| `POST /cases/{id}/access` | Person 1 | Grant time-bound sharing | Person 5 |
| `POST /cases/{id}/documents` | Person 1 (calls Person 2's `encrypt_and_store()` internally) | Upload → hash + encrypt + store, returns `document_id` | Person 3 (triggers AI processing), Person 4 |
| `GET /documents/{id}` | Person 1 | Fetch document metadata | Person 5 |
| `GET /documents/{id}/versions` | Person 1 | Fetch version history | Person 5 |
| `POST /documents/{id}/verify` | Person 2 | Recompute hash chain, pass/fail | Person 5 |
| `GET /documents/{id}/audit-log` | Person 2 | Chain-of-custody event list | Person 5 |
| `POST /documents/{id}/sign` | Person 2 | Digital signature | Person 4 |
| `POST /documents/{id}/certificate` | Person 2 | Section 63 (BSA) admissibility certificate PDF | Person 5 |
| `GET /documents/{id}/download` | Person 2 | Decrypt + watermark + stream | Person 5 |
| `POST /ai/process/{document_id}` | Person 3 | OCR + classify + extract entities, writes back onto the `documents` row | Triggered internally by Person 1's upload flow (background, async) |
| `GET /search?q=` | Person 3 | Search across `ocr_text` / `entities` | Person 4, 5 |

Auth: all endpoints except `POST /auth/login` require a valid JWT supplied in the `Authorization` header as `Bearer <JWT>`. Role-gating per endpoint (RBAC) is enforced server-side by Person 1 via a `Depends(require_role(...))` dependency; specific per-role permission mapping is not specified beyond the role list in Section 1 and is left to Person 1's implementation. See Section 4's `POST /auth/login` entry for the exact JWT contract and failure status codes.

---

## 4. Request/response contracts

Only shapes explicitly implied by the schema/API map above are specified. Fields not listed here are not part of the locked contract.

### `POST /auth/login`
- Request:
```json
{
  "email": "string",
  "password": "string"
}
```
- Response:
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```
- Authentication scheme: the returned JWT is supplied on all subsequent requests in the `Authorization` header as `Bearer <JWT>`.
- JWT claims — exactly these three, no others (no `email` or any other application-specific claim):
  - `sub`: authenticated user's UUID (`users.id`), as a string
  - `role`: authenticated user's existing `UserRole` value (Section 1)
  - `exp`: token expiration timestamp
- Token expiration: 30 minutes from issuance.
- Failure behavior:
  - Invalid credentials on login: `401`
  - Missing, malformed, invalid, or expired JWT on any protected endpoint: `401`
  - Authenticated user lacking a required role: `403`
- RBAC dependency pattern: `Depends(require_role(...))`, applied per endpoint per Section 3's ownership map.

### `POST /cases`
- Request: fields needed to populate a `cases` row (`case_number`, `title`; `created_by`, `status`, `created_at` are server-set).
- Response: created `cases` row.

### `GET /cases`
- Response: list of `cases` rows.

### `GET /cases/{id}`
- Response: single `cases` row.

### `POST /cases/{id}/access`
- Request: grants time-bound access — populates a `case_access` row (`user_id`, `granted_by`, `expires_at`).
- Response: created `case_access` row.
- UI note: consumers must render an explicit "expired" state once `expires_at` has passed, not a silent access denial.

### `POST /cases/{id}/documents`
- Request: file bytes + metadata needed for a `documents` row (`doc_type`, etc.).
- Server flow: calls Person 2's `encrypt_and_store(plaintext, doc_id)` to populate `storage_path`, `evidentiary_hash`, `wrapped_dek`, `nonce`; writes the `documents` row; triggers `POST /ai/process/{document_id}` asynchronously as a background task (does not block the upload response on OCR completion).
- Response: includes `document_id`.

### `GET /documents/{id}`
- Response: single `documents` row (metadata).

### `GET /documents/{id}/versions`
- Response: list of versions for the document.

### `POST /documents/{id}/verify`
- Server flow: recomputes the `audit_log` hash chain for the document.
- Response: pass/fail result.

### `GET /documents/{id}/audit-log`
- Response: JSON array of chain-of-custody events, each shaped as:
```json
{
  "action": "string",
  "actor": "string",
  "timestamp": "string",
  "event_hash": "string"
}
```
- This shape is locked before Person 5 builds the chain-of-custody visualization against it. `audit_log` rows are appended on every action (upload/view/edit/share), each event hashed to the previous one (`prev_hash` → `event_hash`).

### `POST /documents/{id}/sign`
- Request: signer info for a `signatures` row.
- Response: created `signatures` row (`signature_value`, `signed_at`).

### `POST /documents/{id}/certificate`
- Response: Section 63 (BSA) admissibility certificate PDF, generated from a template pulling the document's hash + metadata.

### `GET /documents/{id}/download`
- Server flow: decrypts in memory, watermarks, streams. Plaintext is never written to disk.
- Response: file stream.

### `POST /ai/process/{document_id}`
- Server flow: runs OCR, then writes `ocr_text`, `classification`, and `entities` back onto the existing `documents` row identified by `document_id`. Does not create a parallel/separate table.
- Triggered internally by the upload flow; not a synchronous part of the upload response.

### `GET /search?q=`
- Request: query string `q`.
- Server flow: searches over `documents.ocr_text` and `documents.entities`.
- Response: matching documents, including `classification` and `entities` fields for tag/result rendering.

---

## 5. Integration points

| From | To | What crosses the wire | Watch out for |
|---|---|---|---|
| Person 1 upload endpoint | Person 2 `encrypt_and_store()` | plaintext bytes + doc_id | Function signature must be agreed before Person 1 codes the endpoint around it. |
| Person 1 upload endpoint | Person 3 `/ai/process` | `document_id` (background trigger) | Must be async — don't block the upload response on OCR finishing. |
| Person 2 audit log | Person 5 chain-of-custody UI | JSON array of `{action, actor, timestamp, event_hash}` | Shape locked on Day 1, before Person 5 builds the visualization against it. |
| Person 3 AI output | Person 4/5 tags & search UI | `classification`, `entities` fields on the same `documents` row | Person 3 writes into Person 1's existing row — no second table requiring a join. |
| Person 1 `case_access` | Person 5 sharing UI | `expires_at` timestamp | UI must show an explicit "expired" state, not just fail silently on a denied request. |
| Everyone | Person 6 demo data | Every field above, populated realistically | Seed data only written once schema is stable — not before the Hour 4 checkpoint. |

---

## 6. Change control

- No new fields, endpoints, or response shapes beyond what's in this document without a team sync.
- API changes freeze at the end of Day 1 evening per Person 1's checklist; feature freeze (demo-blocking fixes only) at end of Day 2 evening.
