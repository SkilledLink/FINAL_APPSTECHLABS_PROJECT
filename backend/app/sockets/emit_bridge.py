# app/sockets/emit_bridge.py
"""
Bridge for emitting Socket.IO events from synchronous code
(e.g. FastAPI sync endpoints running in a threadpool).

Socket.IO's AsyncServer is bound to the main asyncio loop.
From a worker thread we must schedule the coroutine on that loop
via `asyncio.run_coroutine_threadsafe`.
"""

import asyncio
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

_main_loop: Optional[asyncio.AbstractEventLoop] = None


def set_main_loop(loop: asyncio.AbstractEventLoop) -> None:
    """Call once at app startup (inside the FastAPI lifespan)."""
    global _main_loop
    _main_loop = loop
    logger.info("Socket emit bridge bound to loop %r", loop)


def emit_to_user_sync(user_id: str, event: str, payload: Any) -> None:
    """Fire-and-forget emit to `user:{user_id}` room. Safe from sync code."""
    if _main_loop is None or _main_loop.is_closed():
        logger.warning(
            "emit_to_user_sync: no main loop bound, dropping %s -> user=%s",
            event,
            user_id,
        )
        return

    try:
        from app.sockets.server import sio
        from app.sockets.managers.room_manager import user_room

        coro = sio.emit(event, payload, room=user_room(str(user_id)))
        asyncio.run_coroutine_threadsafe(coro, _main_loop)
    except Exception:
        logger.exception(
            "emit_to_user_sync failed event=%s user=%s", event, user_id
        )