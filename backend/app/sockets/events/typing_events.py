# app/sockets/events/typing_events.py
from app.sockets.managers.room_manager import conversation_room
from app.sockets.server import sio


async def _ensure_member(sid: str, conversation_id: str) -> bool:
    """Check the user's socket is currently in the conversation room."""
    rooms = sio.rooms(sid)
    return conversation_room(conversation_id) in rooms


@sio.on("typing_start")
async def on_typing_start(sid, data):
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    conversation_id = (data or {}).get("conversation_id")
    if not user_id or not conversation_id:
        return {"success": False, "error": {"code": "INVALID", "message": "Missing data."}}
    if not await _ensure_member(sid, str(conversation_id)):
        return {"success": False, "error": {"code": "NOT_A_MEMBER", "message": "Not in this conversation."}}

    await sio.emit(
        "typing_start",
        {"conversation_id": str(conversation_id), "user_id": user_id},
        room=conversation_room(conversation_id),
        skip_sid=sid,
    )
    return {"success": True, "data": None}


@sio.on("typing_stop")
async def on_typing_stop(sid, data):
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    conversation_id = (data or {}).get("conversation_id")
    if not user_id or not conversation_id:
        return {"success": False, "error": {"code": "INVALID", "message": "Missing data."}}
    if not await _ensure_member(sid, str(conversation_id)):
        return {"success": False, "error": {"code": "NOT_A_MEMBER", "message": "Not in this conversation."}}

    await sio.emit(
        "typing_stop",
        {"conversation_id": str(conversation_id), "user_id": user_id},
        room=conversation_room(conversation_id),
        skip_sid=sid,
    )
    return {"success": True, "data": None}