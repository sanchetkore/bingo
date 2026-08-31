import hashlib
import secrets
import string


def sha256_hash(data: str) -> str:
    """Compute SHA-256 hash of UTF-8 encoded string."""
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def generate_secure_id(prefix: str = "") -> str:
    """Generate a cryptographically secure random identifier."""
    rand_hex = secrets.token_hex(8)
    return f"{prefix}_{rand_hex}" if prefix else rand_hex


def generate_session_token() -> str:
    """Generate a cryptographically secure session token for player authentication."""
    return secrets.token_urlsafe(32)


def generate_game_code(length: int = 6) -> str:
    """Generate a human-friendly numeric/alphanumeric game code (digits 0-9)."""
    # Use digits only for ease of typing on mobile devices (e.g. 482913)
    digits = string.digits
    return "".join(secrets.choice(digits) for _ in range(length))


def generate_server_seed() -> str:
    """Generate a 256-bit cryptographically secure server seed."""
    return secrets.token_hex(32)


def generate_nonce() -> str:
    """Generate a cryptographically secure secret nonce."""
    return secrets.token_hex(16)
