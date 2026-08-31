"""Password hashing and JWT helpers — complete with API_SECRET_KEY from env."""
from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

# pip: PyJWT passlib[argon2] or bcrypt
# from jose import jwt
# from passlib.context import CryptContext

ALGORITHM = "HS256"
ACCESS_MINUTES = int(os.getenv("JWT_ACCESS_MINUTES", "30"))
REFRESH_DAYS = int(os.getenv("JWT_REFRESH_DAYS", "14"))


def get_secret() -> str:
    secret = os.getenv("API_SECRET_KEY") or os.getenv("JWT_SECRET")
    if not secret:
        raise RuntimeError("API_SECRET_KEY is required")
    return secret


def hash_password(plain: str) -> str:
    raise NotImplementedError("Wire passlib argon2/bcrypt")


def verify_password(plain: str, hashed: str) -> bool:
    raise NotImplementedError("Wire passlib argon2/bcrypt")


def create_token(subject: str, role: str, token_type: str = "access") -> str:
    raise NotImplementedError("Wire PyJWT with get_secret()")


def decode_token(token: str) -> dict[str, Any]:
    raise NotImplementedError("Wire PyJWT")
