import hashlib
import os


def encrypt_and_store(plaintext: bytes, doc_id: str) -> dict:
    """STUB - real AES-256-GCM envelope encryption not wired in yet.
    Computes a real SHA-256 hash (keep this real, it's demo-critical).
    Writes file as-is to local storage. Fakes wrapped_dek/nonce."""
    evidentiary_hash = hashlib.sha256(plaintext).hexdigest()
    storage_path = f"./storage/{doc_id}"
    os.makedirs("./storage", exist_ok=True)
    with open(storage_path, "wb") as f:
        f.write(plaintext)
    return {
        "storage_path": storage_path,
        "evidentiary_hash": evidentiary_hash,
        "wrapped_dek": "STUB_UNENCRYPTED",
        "nonce": "STUB_UNENCRYPTED",
    }
