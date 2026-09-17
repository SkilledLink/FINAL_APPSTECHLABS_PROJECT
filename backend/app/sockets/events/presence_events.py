# app/sockets/events/presence_events.py
from app.sockets.managers.connection_manager import connection_manager
from app.sockets.server import sio


@sio.on("presence_query")
async def on_presence_query(sid, data):
    """Payload: { user_ids: [uuid, ...] }  ->  { online: { user_id: bool } }"""
    ids = (data or {}).get("user_ids") or []
    return {
        "success": True,
        "data": {uid: connection_manager.is_online(str(uid)) for uid in ids},
    }