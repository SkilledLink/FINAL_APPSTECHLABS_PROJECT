# app/sockets/events/conversation_events.py
"""
Lets a client force-join a conversation room it's already an active
participant of — e.g. right after accepting a request, or right after
the sender receives `conversation_request_accepted`.
"""

import logging
from uuid import UUID

from sqlmodel import Session

from app.database.session import engine
from app.repositories.conversation_repository import ConversationRepository
from app.sockets.managers.room_manager import conversation_room
from app.sockets.server import sio

logger = logging.getLogger(__name__)


def _is_active_participant(conversation_id: str, user_id: str) -> bool:
    with Session(engine) as session:
        repo = ConversationRepository(session)
        try:
            return repo.is_active_participant(
                UUID(conversation_id), UUID(user_id)
            )
        except (ValueError, TypeError):
            return False


@sio.on("conversation_join")
async def on_conversation_join(sid, data):
    """
    Payload: { conversation_id }
    Ack:     { success: True } | { success: False, error: {...} }
    """
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    conversation_id = (data or {}).get("conversation_id")

    if not user_id or not conversation_id:
        return {
            "success": False,
            "error": {"code": "INVALID_PAYLOAD", "message": "conversation_id required."},
        }

    ok = _is_active_participant(str(conversation_id), str(user_id))
    if not ok:
        return {
            "success": False,
            "error": {
                "code": "NOT_ACTIVE_PARTICIPANT",
                "message": "You are not an active participant of this conversation.",
            },
        }

    await sio.enter_room(sid, conversation_room(str(conversation_id)))
    logger.info(
        "Socket %s joined conversation room %s (user=%s)",
        sid, conversation_id, user_id,
    )
    return {"success": True, "data": {"conversation_id": str(conversation_id)}}