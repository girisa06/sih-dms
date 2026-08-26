## Security integration

The security handoff is in `app.security.encryption`:

```python
from app.security.encryption import encrypt_and_store

metadata = encrypt_and_store(plaintext, document_id)
```

`plaintext` is `bytes`; `document_id` is a UUID or UUID string. The returned
dictionary contains exactly `storage_path`, `evidentiary_hash`, `wrapped_dek`,
and `nonce`. Set `MASTER_KEK` to a URL-safe base64-encoded 32-byte key before
calling it.

Append an audit event from the owning flow after each upload, edit, or share:

```python
from app.security.ledger import append_audit_event

append_audit_event(db, document_id, actor_id, "upload")
```

The security endpoints are registered under `/documents/{id}` for verification,
audit-log retrieval, signing, certificates, and download. They expect the JWT
middleware to set `request.state.user_id`.

