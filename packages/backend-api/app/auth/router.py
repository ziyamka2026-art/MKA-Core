"""Auth routes: register, login, refresh, logout, me — implement against Postgres users table."""
from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/v1/auth", tags=["auth"])


# @router.post("/register")
# @router.post("/login")
# @router.post("/refresh")
# @router.post("/logout")
# @router.get("/me")
