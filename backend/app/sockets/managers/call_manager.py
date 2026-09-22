# app/sockets/managers/call_manager.py
"""
In-memory call state manager.

One active call per user at a time. All state lives in dicts.
Redis-ready: swap the dicts for Redis hashes later without changing the API.
"""

import asyncio
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Literal, Optional
from uuid import uuid4


CallStatus = Literal[
    "ringing", "active", "ended", "rejected", "missed", "cancelled"
]
MediaKind = Literal["audio", "video"]


@dataclass
class Call:
    id: str
    conversation_id: str
    caller_id: str
    callee_id: str
    media: MediaKind
    status: CallStatus = "ringing"
    started_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    answered_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    ended_reason: Optional[str] = None


class CallManager:
    def __init__(self) -> None:
        self._calls: dict[str, Call] = {}
        # user_id -> call_id  (one call per user)
        self._user_call: dict[str, str] = {}
        self._lock = asyncio.Lock()

    # ── lifecycle ────────────────────────────────────────────

    async def create_call(
        self,
        *,
        conversation_id: str,
        caller_id: str,
        callee_id: str,
        media: MediaKind,
    ) -> Call:
        async with self._lock:
            if caller_id in self._user_call:
                raise ValueError("CALLER_BUSY")
            if callee_id in self._user_call:
                raise ValueError("CALLEE_BUSY")

            call = Call(
                id=str(uuid4()),
                conversation_id=str(conversation_id),
                caller_id=str(caller_id),
                callee_id=str(callee_id),
                media=media,
            )
            self._calls[call.id] = call
            self._user_call[call.caller_id] = call.id
            self._user_call[call.callee_id] = call.id
            return call

    async def get(self, call_id: str) -> Optional[Call]:
        return self._calls.get(str(call_id))

    async def get_user_call(self, user_id: str) -> Optional[Call]:
        cid = self._user_call.get(str(user_id))
        return self._calls.get(cid) if cid else None

    async def mark_active(self, call_id: str) -> Optional[Call]:
        async with self._lock:
            call = self._calls.get(str(call_id))
            if not call:
                return None
            call.status = "active"
            call.answered_at = datetime.now(timezone.utc)
            return call

    async def end_call(
        self, call_id: str, *, status: CallStatus, reason: str = ""
    ) -> Optional[Call]:
        async with self._lock:
            call = self._calls.get(str(call_id))
            if not call:
                return None
            call.status = status
            call.ended_at = datetime.now(timezone.utc)
            call.ended_reason = reason
            # Free both users immediately so they can start a new call
            self._user_call.pop(call.caller_id, None)
            self._user_call.pop(call.callee_id, None)
            return call

    async def cleanup(self, call_id: str) -> None:
        async with self._lock:
            self._calls.pop(str(call_id), None)


call_manager = CallManager()