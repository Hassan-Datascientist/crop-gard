"""Authentication primitives.

Password hashing intentionally mirrors the mobile client (expo-crypto) so a
password hashed on one side verifies on the other:

    salt    = hex(16 random bytes)   -> 32 hex chars
    hash    = SHA-256(f"{salt}:{password}")

NOTE: SHA-256 is not recommended for password storage in general, but it is
required here for compatibility with the existing on-device users. Upgrade to
a KDF (argon2/bcrypt) as a cross-version migration once client hashes change.
"""
import secrets

from datetime import datetime, timedelta, timezone
from hashlib import sha256

import jwt

from .config import settings

TOKEN_TYPE = "Bearer"


def generate_salt() -> str:
    """Same format as the client: hex of 16 random bytes (32 chars)."""
    return secrets.token_hex(16)


def hash_password(password: str, salt: str) -> str:
    return sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()


def verify_password(password: str, salt: str, expected_hash: str) -> bool:
    return hash_password(password, salt) == expected_hash


def create_access_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(minutes=settings.jwt_expire_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> int:
    """Returns the user id embedded in a valid token, else raises jwt.PyJWTError."""
    payload = jwt.decode(
        token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
    )
    return int(payload["sub"])
