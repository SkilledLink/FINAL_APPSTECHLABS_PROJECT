# app/sockets/events/message_events.py
import asyncio
import logging
from typing import Any
from uuid import UUID

from sqlmodel import Session

from app.database.session import engine
from app.models.notification import Notification
from app.repositories.conversation_repository import ConversationRepository
from app.schemas.message import MessageCreate, MessageResponse
from app.services.message_service import MessageService
from app.sockets.managers.connection_manager import connection_manager
from app.sockets.managers.room_manager import conversation_room, user_room
from app.sockets.server import sio

logger = logging.getLogger(__name__)


def _ok(data: Any) -> dict:
    return {"success": True, "data": data}


def _err(code: str, message: str) -> dict:
    return {"success": False, "error": {"code": code, "message": message}}


def _build_message_notification(
    session: Session,
    *,
    recipient_id: UUID,
    sender_id: UUID,
    conversation_id: UUID,
    message_id: UUID,
    preview: str,
) -> Notification:
    """
    Create a message notification using the existing Notification model.
    ⚠️ If your Notification model uses different column names, adjust here only.
    """
    notification = Notification(
        user_id=recipient_id,
        type="message",
        title="New message",
        body=preview[:140] if preview else "Sent an attachment",
        data={
            "conversation_id": str(conversation_id),
            "message_id": str(message_id),
            "sender_id": str(sender_id),
        },
    )
    session.add(notification)
    return notification


def _persist_message(
    sender_id_str: str,
    conversation_id_str: str,
    payload: dict,
) -> dict:
    """
    Runs in a worker thread. Full send lifecycle:
      validate membership -> persist message -> persist notifications -> return data.
    """
    sender_id = UUID(sender_id_str)
    conversation_id = UUID(conversation_id_str)

    with Session(engine) as session:
        conv_repo = ConversationRepository(session)

        # ── NEW: block sending to pending / rejected conversations ──
        conv = conv_repo.get_by_id(conversation_id)
        if conv is None:
            raise PermissionError("CONVERSATION_NOT_FOUND")
        if conv.status != "active":
            raise PermissionError("CONVERSATION_NOT_ACTIVE")
        if not conv_repo.is_participant(conversation_id, sender_id):
            raise PermissionError("CONVERSATION_ACCESS_DENIED")

        # Validate payload via Pydantic (raises on bad content)
        data = MessageCreate.model_validate(payload)

        msg_service = MessageService(session)
        message = msg_service.create_message(conversation_id, sender_id, data)

        # Build notifications for every other participant
        participants = conv_repo.get_participants(conversation_id)
        preview = message.content or ""
        notifications: list[dict] = []
        recipient_ids: list[str] = []

        for p in participants:
            if p.user_id == sender_id:
                continue
            recipient_ids.append(str(p.user_id))
            n = _build_message_notification(
                session,
                recipient_id=p.user_id,
                sender_id=sender_id,
                conversation_id=conversation_id,
                message_id=message.id,
                preview=preview,
            )
            session.add(n)

        session.commit()

        # Serialize before session closes
        msg_payload = MessageResponse.model_validate(message).model_dump(
            mode="json"
        )

        # Re-fetch notifications to get IDs (simplest reliable way)
        from sqlmodel import select

        notification_payloads: list[dict] = []
        for rid in recipient_ids:
            stmt = (
                select(Notification)
                .where(Notification.user_id == UUID(rid))
                .order_by(Notification.created_at.desc())
                .limit(1)
            )
            n = session.exec(stmt).first()
            if n is None:
                continue
            notification_payloads.append(
                {
                    "id": str(n.id),
                    "user_id": rid,
                    "type": getattr(n, "type", "message"),
                    "title": getattr(n, "title", "New message"),
                    "body": getattr(n, "body", ""),
                    "data": getattr(n, "data", {}) or {},
                    "created_at": (
                        n.created_at.isoformat()
                        if getattr(n, "created_at", None)
                        else None
                    ),
                }
            )

        return {
            "message": msg_payload,
            "conversation_id": str(conversation_id),
            "recipient_ids": recipient_ids,
            "notifications": notification_payloads,
        }


@sio.on("send_message")
async def on_send_message(sid, data):
    """
    Event payload: { conversation_id, client_message_id, type, content, ... }
    Ack: { success: true, data: { message: ... } } | { success: false, error: {...} }
    """
    session = await sio.get_session(sid)
    sender_id = session.get("user_id")
    if not sender_id:
        return _err("UNAUTHENTICATED", "Socket session is not authenticated.")

    if not isinstance(data, dict):
        return _err("INVALID_PAYLOAD", "Payload must be an object.")

    conversation_id = data.get("conversation_id")
    if not conversation_id:
        return _err("INVALID_PAYLOAD", "conversation_id is required.")

    try:
        result = await asyncio.to_thread(
            _persist_message, sender_id, str(conversation_id), data
        )
    except PermissionError as exc:
        code = str(exc)
        if code == "CONVERSATION_NOT_FOUND":
            return _err(
                "CONVERSATION_NOT_FOUND", "This conversation does not exist."
            )
        if code == "CONVERSATION_NOT_ACTIVE":
            return _err(
                "CONVERSATION_NOT_ACTIVE",
                "This conversation is still pending acceptance.",
            )
        return _err(
            "CONVERSATION_ACCESS_DENIED",
            "You are not a member of this conversation.",
        )
    except ValueError as exc:
        return _err("VALIDATION_ERROR", str(exc))
    except Exception:
        logger.exception("send_message failed")
        return _err("INTERNAL_ERROR", "Message could not be sent.")

    # Broadcast persisted message to the conversation room (including sender tabs).
    await sio.emit(
        "new_message",
        result["message"],
        room=conversation_room(result["conversation_id"]),
    )

    # Emit each notification to the corresponding recipient's personal room.
    for notif in result["notifications"]:
        await sio.emit(
            "new_notification", notif, room=user_room(notif["user_id"])
        )

    return _ok({"message": result["message"]})


@sio.on("message_read")
async def on_message_read(sid, data):
    """
    Mark a conversation read for the current user, emit message_read to the conversation room.
    Payload: { conversation_id }
    """
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    if not user_id:
        return _err("UNAUTHENTICATED", "Socket session is not authenticated.")

    conversation_id = (data or {}).get("conversation_id")
    if not conversation_id:
        return _err("INVALID_PAYLOAD", "conversation_id is required.")

    def _do():
        from app.services.message_service import MessageService
        with Session(engine) as s:
            MessageService(s).mark_read(
                UUID(str(conversation_id)), UUID(user_id)
            )
            return True

    try:
        await asyncio.to_thread(_do)
    except PermissionError:
        return _err(
            "CONVERSATION_ACCESS_DENIED",
            "You are not a member of this conversation.",
        )
    except Exception:
        logger.exception("message_read failed")
        return _err("INTERNAL_ERROR", "Could not update read state.")

    await sio.emit(
        "message_read",
        {"conversation_id": str(conversation_id), "user_id": user_id},
        room=conversation_room(conversation_id),
        skip_sid=sid,
    )
    return _ok({"conversation_id": str(conversation_id)})