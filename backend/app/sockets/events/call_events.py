# app/sockets/events/call_events.py
"""
WebRTC signaling over Socket.IO.

The server never touches media — it only relays SDP offers/answers and
ICE candidates between the two participants. WebRTC negotiates the
actual peer-to-peer audio/video.
"""

import asyncio
import logging
from typing import Any
from uuid import UUID

from sqlmodel import Session

from app.database.session import engine
from app.repositories.conversation_repository import ConversationRepository
from app.sockets.managers.call_manager import call_manager
from app.sockets.managers.connection_manager import connection_manager
from app.sockets.managers.room_manager import user_room
from app.sockets.server import sio

logger = logging.getLogger(__name__)

RING_TIMEOUT_SECONDS = 45
CLEANUP_DELAY_SECONDS = 30.0


# ── helpers ───────────────────────────────────────────────────

def _ok(data: Any = None) -> dict:
    return {"success": True, "data": data}


def _err(code: str, message: str) -> dict:
    return {"success": False, "error": {"code": code, "message": message}}


def _validate_membership(
    conversation_id: UUID, user_id: UUID, other_user_id: UUID
) -> bool:
    with Session(engine) as session:
        repo = ConversationRepository(session)
        return (
            repo.is_participant(conversation_id, user_id)
            and repo.is_participant(conversation_id, other_user_id)
        )


async def _ring_timeout(call_id: str) -> None:
    """Auto-cancel a call if nobody answers within RING_TIMEOUT_SECONDS."""
    await asyncio.sleep(RING_TIMEOUT_SECONDS)
    call = await call_manager.get(call_id)
    if not call or call.status != "ringing":
        return

    ended = await call_manager.end_call(
        call_id, status="missed", reason="RING_TIMEOUT"
    )
    if not ended:
        return

    logger.info("Call %s timed out (missed)", call_id)

    for uid in (ended.caller_id, ended.callee_id):
        await sio.emit(
            "call_missed",
            {"call_id": call_id, "reason": "RING_TIMEOUT"},
            room=user_room(uid),
        )

    asyncio.create_task(_delayed_cleanup(call_id))


async def _delayed_cleanup(
    call_id: str, delay: float = CLEANUP_DELAY_SECONDS
) -> None:
    """Keep ended calls around briefly for late ICE/end events."""
    await asyncio.sleep(delay)
    await call_manager.cleanup(call_id)


# ── 1. Caller initiates ───────────────────────────────────────

@sio.on("call_initiate")
async def on_call_initiate(sid, data):
    """
    Payload: { conversation_id, callee_id, media: 'audio'|'video' }
    Ack:     { success, data: { call_id } }
    """
    session = await sio.get_session(sid)
    caller_id = session.get("user_id")
    if not caller_id:
        return _err("UNAUTHENTICATED", "Socket session is not authenticated.")

    if not isinstance(data, dict):
        return _err("INVALID_PAYLOAD", "Payload must be an object.")

    conversation_id = data.get("conversation_id")
    callee_id = data.get("callee_id")
    media = data.get("media", "audio")

    if not conversation_id or not callee_id:
        return _err(
            "INVALID_PAYLOAD", "conversation_id and callee_id are required."
        )
    if media not in ("audio", "video"):
        return _err("INVALID_PAYLOAD", "media must be 'audio' or 'video'.")
    if str(callee_id) == str(caller_id):
        return _err("SELF_CALL", "Cannot call yourself.")

    if not connection_manager.is_online(str(callee_id)):
        return _err("USER_OFFLINE", "The other user is not online.")

    try:
        ok = await asyncio.to_thread(
            _validate_membership,
            UUID(str(conversation_id)),
            UUID(str(caller_id)),
            UUID(str(callee_id)),
        )
    except Exception:
        logger.exception("call_initiate membership check failed")
        return _err("INTERNAL_ERROR", "Could not verify conversation membership.")

    if not ok:
        return _err(
            "CONVERSATION_ACCESS_DENIED",
            "One of the users is not in this conversation.",
        )

    try:
        call = await call_manager.create_call(
            conversation_id=str(conversation_id),
            caller_id=str(caller_id),
            callee_id=str(callee_id),
            media=media,
        )
    except ValueError as exc:
        if str(exc) == "CALLEE_BUSY":
            return _err("CALLEE_BUSY", "The other user is already in a call.")
        if str(exc) == "CALLER_BUSY":
            return _err("CALLER_BUSY", "You are already in a call.")
        return _err("INTERNAL_ERROR", str(exc))

    # Ring every tab of the callee
    await sio.emit(
        "call_incoming",
        {
            "call_id": call.id,
            "conversation_id": call.conversation_id,
            "caller_id": call.caller_id,
            "media": call.media,
        },
        room=user_room(call.callee_id),
    )

    # Update caller's other tabs
    await sio.emit(
        "call_outgoing",
        {
            "call_id": call.id,
            "conversation_id": call.conversation_id,
            "callee_id": call.callee_id,
            "media": call.media,
        },
        room=user_room(call.caller_id),
        skip_sid=sid,
    )

    asyncio.create_task(_ring_timeout(call.id))

    logger.info(
        "Call %s initiated: %s -> %s (%s)",
        call.id,
        caller_id,
        callee_id,
        media,
    )
    return _ok({"call_id": call.id})


# ── 2. Callee accepts ─────────────────────────────────────────

@sio.on("call_accept")
async def on_call_accept(sid, data):
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    call_id = (data or {}).get("call_id")

    if not user_id or not call_id:
        return _err("INVALID_PAYLOAD", "call_id is required.")

    call = await call_manager.get(str(call_id))
    if not call:
        return _err("CALL_NOT_FOUND", "This call no longer exists.")
    if call.callee_id != str(user_id):
        return _err("NOT_CALLEE", "You are not the callee of this call.")
    if call.status != "ringing":
        return _err("CALL_NOT_RINGING", f"Call is in state '{call.status}'.")

    updated = await call_manager.mark_active(call.id)
    if not updated:
        return _err("CALL_NOT_FOUND", "This call no longer exists.")

    # Tell the caller
    await sio.emit(
        "call_accepted",
        {"call_id": call.id, "callee_id": call.callee_id},
        room=user_room(call.caller_id),
    )
    # Tell the callee's other tabs
    await sio.emit(
        "call_accepted",
        {"call_id": call.id, "callee_id": call.callee_id},
        room=user_room(call.callee_id),
        skip_sid=sid,
    )

    logger.info("Call %s accepted by %s", call.id, user_id)
    return _ok({"call_id": call.id})


# ── 3. Callee rejects ─────────────────────────────────────────

@sio.on("call_reject")
async def on_call_reject(sid, data):
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    call_id = (data or {}).get("call_id")

    if not user_id or not call_id:
        return _err("INVALID_PAYLOAD", "call_id is required.")

    call = await call_manager.get(str(call_id))
    if not call:
        return _err("CALL_NOT_FOUND", "This call no longer exists.")
    if call.callee_id != str(user_id):
        return _err("NOT_CALLEE", "You are not the callee of this call.")

    ended = await call_manager.end_call(
        call.id, status="rejected", reason="USER_REJECTED"
    )
    if ended:
        await sio.emit(
            "call_rejected",
            {"call_id": call.id},
            room=user_room(call.caller_id),
        )
        await sio.emit(
            "call_rejected",
            {"call_id": call.id},
            room=user_room(call.callee_id),
            skip_sid=sid,
        )
        asyncio.create_task(_delayed_cleanup(call.id))

    logger.info("Call %s rejected by %s", call.id, user_id)
    return _ok({"call_id": call.id})


# ── 4. Either side ends ───────────────────────────────────────

@sio.on("call_end")
async def on_call_end(sid, data):
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    call_id = (data or {}).get("call_id")
    reason = (data or {}).get("reason", "HANGUP")

    if not user_id or not call_id:
        return _err("INVALID_PAYLOAD", "call_id is required.")

    call = await call_manager.get(str(call_id))
    if not call:
        return _err("CALL_NOT_FOUND", "This call no longer exists.")
    if str(user_id) not in (call.caller_id, call.callee_id):
        return _err("NOT_A_PARTICIPANT", "You are not part of this call.")

    # Caller hanging up before answer = cancelled; anything else = ended
    if call.status == "ringing" and str(user_id) == call.caller_id:
        status = "cancelled"
    else:
        status = "ended"

    ended = await call_manager.end_call(call.id, status=status, reason=reason)
    if ended:
        other_id = (
            call.callee_id
            if str(user_id) == call.caller_id
            else call.caller_id
        )
        await sio.emit(
            "call_ended",
            {
                "call_id": call.id,
                "ended_by": str(user_id),
                "reason": reason,
            },
            room=user_room(other_id),
        )
        await sio.emit(
            "call_ended",
            {
                "call_id": call.id,
                "ended_by": str(user_id),
                "reason": reason,
            },
            room=user_room(str(user_id)),
            skip_sid=sid,
        )
        asyncio.create_task(_delayed_cleanup(call.id))

    logger.info("Call %s ended by %s (%s)", call.id, user_id, reason)
    return _ok({"call_id": call.id})


# ── 5. WebRTC relay events ────────────────────────────────────

@sio.on("webrtc_offer")
async def on_webrtc_offer(sid, data):
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    call_id = (data or {}).get("call_id")
    sdp = (data or {}).get("sdp")

    if not user_id or not call_id or not sdp:
        return _err("INVALID_PAYLOAD", "call_id and sdp are required.")

    call = await call_manager.get(str(call_id))
    if not call:
        return _err("CALL_NOT_FOUND", "This call no longer exists.")
    if str(user_id) != call.caller_id:
        return _err("NOT_CALLER", "Only the caller can send an offer.")

    await sio.emit(
        "webrtc_offer",
        {"call_id": call.id, "sdp": sdp, "from": str(user_id)},
        room=user_room(call.callee_id),
    )
    return _ok()


@sio.on("webrtc_answer")
async def on_webrtc_answer(sid, data):
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    call_id = (data or {}).get("call_id")
    sdp = (data or {}).get("sdp")

    if not user_id or not call_id or not sdp:
        return _err("INVALID_PAYLOAD", "call_id and sdp are required.")

    call = await call_manager.get(str(call_id))
    if not call:
        return _err("CALL_NOT_FOUND", "This call no longer exists.")
    if str(user_id) != call.callee_id:
        return _err("NOT_CALLEE", "Only the callee can send an answer.")

    await sio.emit(
        "webrtc_answer",
        {"call_id": call.id, "sdp": sdp, "from": str(user_id)},
        room=user_room(call.caller_id),
    )
    return _ok()


@sio.on("webrtc_ice_candidate")
async def on_webrtc_ice_candidate(sid, data):
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    call_id = (data or {}).get("call_id")
    candidate = (data or {}).get("candidate")

    if not user_id or not call_id or not candidate:
        return _err("INVALID_PAYLOAD", "call_id and candidate are required.")

    call = await call_manager.get(str(call_id))
    if not call:
        return _err("CALL_NOT_FOUND", "This call no longer exists.")
    if str(user_id) not in (call.caller_id, call.callee_id):
        return _err("NOT_A_PARTICIPANT", "You are not part of this call.")

    other_id = (
        call.callee_id if str(user_id) == call.caller_id else call.caller_id
    )
    await sio.emit(
        "webrtc_ice_candidate",
        {"call_id": call.id, "candidate": candidate, "from": str(user_id)},
        room=user_room(other_id),
    )
    return _ok()