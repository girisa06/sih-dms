import base64
import hashlib
import os
from pathlib import Path
from uuid import UUID

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.core.config import settings


def _master_key() -> bytes:
    if not settings.master_kek:
        raise RuntimeError("MASTER_KEK must be configured before encrypting documents")
    try:
        key = base64.urlsafe_b64decode(settings.master_kek.encode())
    except (ValueError, UnicodeError) as exc:
        raise RuntimeError("MASTER_KEK must be URL-safe base64") from exc
    if len(key) != 32:
        raise RuntimeError("MASTER_KEK must decode to exactly 32 bytes")
    return key


def encrypt_and_store(plaintext: bytes, doc_id: UUID | str) -> dict[str, str]:
    """Encrypt one document and return values ready for the documents row."""
    document_id = str(doc_id)
    dek = AESGCM.generate_key(bit_length=256)
    nonce = os.urandom(12)
    ciphertext = AESGCM(dek).encrypt(nonce, plaintext, document_id.encode())
    wrap_nonce = os.urandom(12)
    wrapped_dek = AESGCM(_master_key()).encrypt(
        wrap_nonce, dek, document_id.encode()
    )
    evidentiary_hash = hashlib.sha256(plaintext).hexdigest()

    storage_dir = Path(settings.storage_dir)
    storage_dir.mkdir(parents=True, exist_ok=True)
    storage_path = storage_dir / f"{document_id}.bin"
    storage_path.write_bytes(ciphertext)
    return {
        "storage_path": str(storage_path),
        "evidentiary_hash": evidentiary_hash,
        "wrapped_dek": base64.urlsafe_b64encode(wrap_nonce + wrapped_dek).decode(),
        "nonce": base64.urlsafe_b64encode(nonce).decode(),
        "mime_type": "application/octet-stream",
    }


def decrypt_from_storage(
    storage_path: str, doc_id: UUID | str, wrapped_dek: str, nonce: str
) -> bytes:
    document_id = str(doc_id)
    wrapped = base64.urlsafe_b64decode(wrapped_dek.encode())
    wrap_nonce, encrypted_dek = wrapped[:12], wrapped[12:]
    dek = AESGCM(_master_key()).decrypt(wrap_nonce, encrypted_dek, document_id.encode())
    ciphertext = Path(storage_path).read_bytes()
    return AESGCM(dek).decrypt(
        base64.urlsafe_b64decode(nonce.encode()), ciphertext, document_id.encode()
    )