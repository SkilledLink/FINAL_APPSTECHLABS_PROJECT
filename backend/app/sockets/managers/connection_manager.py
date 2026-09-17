# app/sockets/managers/connection_manager.py
import asyncio
from typing import Optional


class ConnectionManager:
    """
    Tracks user_id -> set[sid] and sid -> user_id.
    Multiple tabs/devices per user are supported.
    Redis-ready: replace dict storage with an adapter later without changing the API.
    """

    def __init__(self) -> None:
        self._user_sockets: dict[str, set[str]] = {}
        self._socket_users: dict[str, str] = {}
        self._lock = asyncio.Lock()

    async def add(self, user_id: str, sid: str) -> bool:
        """Register sid for user_id. Returns True if this is the user's first connection."""
        async with self._lock:
            became_online = not self._user_sockets.get(user_id)
            self._user_sockets.setdefault(user_id, set()).add(sid)
            self._socket_users[sid] = user_id
            return became_online

    async def remove(self, sid: str) -> Optional[tuple[str, bool]]:
        """Remove sid. Returns (user_id, user_became_offline) or None if unknown sid."""
        async with self._lock:
            user_id = self._socket_users.pop(sid, None)
            if not user_id:
                return None
            sockets = self._user_sockets.get(user_id)
            if sockets is None:
                return user_id, False
            sockets.discard(sid)
            became_offline = not sockets
            if became_offline:
                self._user_sockets.pop(user_id, None)
            return user_id, became_offline

    def get_user_id(self, sid: str) -> Optional[str]:
        return self._socket_users.get(sid)

    def is_online(self, user_id: str) -> bool:
        return bool(self._user_sockets.get(str(user_id)))

    def online_users(self) -> list[str]:
        return list(self._user_sockets.keys())


connection_manager = ConnectionManager()