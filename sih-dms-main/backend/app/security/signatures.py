import base64

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from app.core.config import settings


def _private_key() -> Ed25519PrivateKey:
    if not settings.signing_private_key:
        raise RuntimeError("SIGNING_PRIVATE_KEY must be configured before signing documents")
    try:
        pem = base64.urlsafe_b64decode(settings.signing_private_key.encode())
        key = serialization.load_pem_private_key(pem, password=None)
    except (ValueError, TypeError, base64.binascii.Error) as exc:
        raise RuntimeError("SIGNING_PRIVATE_KEY must be base64-encoded Ed25519 PEM") from exc
    if not isinstance(key, Ed25519PrivateKey):
        raise RuntimeError("SIGNING_PRIVATE_KEY must contain an Ed25519 private key")
    return key


def sign_document(document_hash: str) -> str:
    """Return a base64 Ed25519 signature for the stored evidentiary hash."""
    return base64.urlsafe_b64encode(_private_key().sign(document_hash.encode())).decode()