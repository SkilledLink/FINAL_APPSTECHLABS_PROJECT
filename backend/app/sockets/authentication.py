# app/sockets/authentication.py
from typing import Any, Optional

from app.core.security import decode_token


def authenticate_socket(auth: Optional[dict[str, Any]]) -> dict[str, Any]:
    """
    Validate the JWT supplied on Socket.IO handshake.
    Returns a dict with {"user_id": str, "token": str}.
    Raises ValueError on any failure.
    """
    if not auth or not isinstance(auth, dict):
        raise ValueError("AUTH_MISSING")

    raw = auth.get("token") or auth.get("access_token")
    if not raw:
        raise ValueError("AUTH_MISSING")

    # Accept "Bearer xxx" or raw token
    token = raw.split(" ", 1)[1] if raw.lower().startswith("bearer ") else raw

    try:
        payload = decode_token(token)
    except ValueError as exc:
        raise ValueError(f"AUTH_INVALID: {exc}") from exc

    user_id = payload.get("sub") or payload.get("user_id")
    if not user_id:
        raise ValueError("AUTH_NO_SUB")

    return {"user_id": str(user_id), "token": token}