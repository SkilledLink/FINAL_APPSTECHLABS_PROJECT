# app/sockets/connection.py
import logging

from sqlmodel import Session, select

from app.database.session import engine
from app.models.conversation_participant import ConversationParticipant
from app.sockets.authentication import authenticate_socket
from app.sockets.managers.connection_manager import connection_manager
from app.sockets.managers.room_manager import conversation_room, user_room
from app.sockets.server import sio

logger = logging.getLogger(__name__)


def _load_user_conversation_ids(user_id: str) -> list[str]:
    with Session(engine) as session:
        stmt = select(ConversationParticipant.conversation_id).where(
            ConversationParticipant.user_id == user_id
        )
        return [str(cid) for cid in session.exec(stmt).all()]


def _find_online_peers(my_conv_ids: list[str], exclude_user_id: str) -> list[str]:
    """
    Return the user_ids of everyone currently online who shares at least
    one conversation with the connecting user.
    """
    my_convs = set(my_conv_ids)
    peers: list[str] = []
    for other_uid in connection_manager.online_users():
        if other_uid == exclude_user_id:
            continue
        other_convs = set(_load_user_conversation_ids(other_uid))
        if my_convs & other_convs:
            peers.append(other_uid)
    return peers


@sio.event
async def connect(sid, environ, auth):
    try:
        identity = authenticate_socket(auth)
    except ValueError as exc:
        logger.warning("Socket connect rejected: %s", exc)
        return False

    user_id = identity["user_id"]
    await sio.save_session(sid, {"user_id": user_id})

    await sio.enter_room(sid, user_room(user_id))

    conv_ids = _load_user_conversation_ids(user_id)
    for cid in conv_ids:
        await sio.enter_room(sid, conversation_room(cid))

    became_online = await connection_manager.add(user_id, sid)

    # ✅ FIX: tell the newly connected socket who else is ALREADY online
    # in the conversations they share. Without this, the newest joiner
    # sees everyone else as offline until they reconnect.
    online_peers = _find_online_peers(conv_ids, exclude_user_id=user_id)
    if online_peers:
        await sio.emit(
            "presence_snapshot",
            {"user_ids": online_peers},
            to=sid,
        )

    if became_online:
        for cid in conv_ids:
            await sio.emit(
                "user_online",
                {"user_id": user_id},
                room=conversation_room(cid),
                skip_sid=sid,
            )

    logger.info(
        "Socket connected: user=%s sid=%s rooms=%d online_peers=%d",
        user_id, sid, len(conv_ids), len(online_peers),
    )
    return True


@sio.event
async def disconnect(sid):
    result = await connection_manager.remove(sid)
    if not result:
        return
    user_id, became_offline = result
    if not became_offline:
        return

    conv_ids = _load_user_conversation_ids(user_id)
    for cid in conv_ids:
        await sio.emit(
            "user_offline",
            {"user_id": user_id},
            room=conversation_room(cid),
        )
    logger.info("Socket disconnected: user=%s sid=%s (offline)", user_id, sid)