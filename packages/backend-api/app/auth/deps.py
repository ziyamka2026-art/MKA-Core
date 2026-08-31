"""FastAPI dependencies: get_current_user, require_role."""
from __future__ import annotations

from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

# bearer = HTTPBearer(auto_error=False)

ALLOWED_ROLES = ("taxpayer", "advisor", "admin", "owner")


async def get_current_user(
    # creds: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> dict:
    """Return user dict {id, email, role} or raise 401."""
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")


def require_role(*roles: str) -> Callable:
    async def _inner(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") not in roles and user.get("role") != "owner":
            # owner bypasses most checks except explicit owner-only routes
            if "owner" in roles or user.get("role") == "owner":
                if user.get("role") == "owner":
                    return user
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return user

    return _inner
