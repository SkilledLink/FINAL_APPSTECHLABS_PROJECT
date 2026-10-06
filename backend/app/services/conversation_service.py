# app/services/conversation_service.py
from uuid import UUID
from typing import List

from fastapi import HTTPException, status
from sqlmodel import Session

from app.models.conversation import Conversation
from app.models.notification import Notification
from app.repositories.conversation_repository import ConversationRepository
from app.schemas.conversation import (
    ConversationCreate,
    ConversationResponse,
    ParticipantInfo,
)
from app.services.user_service import UserService
from app.sockets.emit_bridge import emit_to_user_sync


class ConversationService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = ConversationRepository(session)
        self.user_service = UserService(session)

    # ── reads ───────────────────────────────────────────────
    def get_user_conversations(self, user_id: UUID) -> List[ConversationResponse]:
        conversations = self.repo.get_user_conversations(
            user_id, statuses=("active",)
        )
        return [
            self._build_conversation_response(c, user_id) for c in conversations
        ]

    def get_incoming_requests(self, user_id: UUID) -> List[ConversationResponse]:
        requests = self.repo.get_incoming_requests(user_id)
        return [self._build_conversation_response(c, user_id) for c in requests]

    def get_sent_requests(self, user_id: UUID) -> List[ConversationResponse]:
        """Requests I sent that are still awaiting acceptance."""
        sent = self.repo.get_sent_requests(user_id)
        return [self._build_conversation_response(c, user_id) for c in sent]

    # ── create ──────────────────────────────────────────────
    def create_conversation(
        self, user_id: UUID, data: ConversationCreate
    ) -> ConversationResponse:
        if user_id not in data.participant_ids:
            data.participant_ids.append(user_id)

        is_direct = data.type == "direct" and len(data.participant_ids) == 2

        if is_direct:
            other_id = next(uid for uid in data.participant_ids if uid != user_id)
            return self.get_or_create_direct_conversation(user_id, other_id)

        conv_data = data.model_dump(exclude={"participant_ids"})
        conv_data["created_by"] = user_id
        conv_data["status"] = "active"
        conv = self.repo.create_conversation(conv_data, data.participant_ids)
        return self._build_conversation_response(conv, user_id)

    def get_or_create_direct_conversation(
        self, user_id: UUID, other_user_id: UUID
    ) -> ConversationResponse:
        if user_id == other_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot start a conversation with yourself.",
            )

        # 1) Active direct already exists → return it.
        active = self.repo.find_direct_conversation(
            user_id, other_user_id, statuses=("active",)
        )
        if active:
            return self._build_conversation_response(active, user_id)

        # 2) Pending request already exists (either direction)?
        pending = self.repo.find_pending_between(user_id, other_user_id)
        if pending:
            if pending.created_by == user_id:
                return self._build_conversation_response(pending, user_id)
            return self.accept_request(pending.id, user_id)

        # 3) Fresh pending request.
        conv = self.repo.create_conversation(
            conv_data={
                "type": "direct",
                "created_by": user_id,
                "status": "pending",
            },
            participant_ids=[user_id, other_user_id],
        )
        self._notify_request_received(
            conv, sender_id=user_id, recipient_id=other_user_id
        )
        return self._build_conversation_response(conv, user_id)

    # ── accept / reject ────────────────────────────────────
    def accept_request(
        self, conversation_id: UUID, user_id: UUID
    ) -> ConversationResponse:
        conv = self._load_actionable_request(conversation_id, user_id)

        updated = self.repo.update_status(conv.id, "active")
        if updated is None:
            raise HTTPException(status_code=404, detail="Request not found.")

        self._notify_request_accepted(updated, accepter_id=user_id)
        return self._build_conversation_response(updated, user_id)

    def reject_request(self, conversation_id: UUID, user_id: UUID) -> None:
        conv = self._load_actionable_request(conversation_id, user_id)
        self.repo.update_status(conv.id, "rejected")
        self._notify_request_rejected(conv, rejecter_id=user_id)

    # ── internals ──────────────────────────────────────────
    def _load_actionable_request(
        self, conversation_id: UUID, user_id: UUID
    ) -> Conversation:
        conv = self.repo.get_by_id(conversation_id)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found.")
        if conv.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Request already {conv.status}.",
            )
        if conv.created_by == user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot action your own request.",
            )
        if not self.repo.is_participant(conv.id, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not part of this conversation.",
            )
        return conv

    # ── notifications ──────────────────────────────────────
    # The DB column is `payload`. The socket payload uses key `data`
    # because the frontend expects `notification.data.*`.
    def _notify_request_received(
        self, conv: Conversation, *, sender_id: UUID, recipient_id: UUID
    ) -> None:
        sender = self.user_service.get_user_model_by_id(sender_id)
        sender_name = (
            f"{sender.first_name} {sender.last_name}".strip() or sender.email
        )

        notif = Notification(
            user_id=recipient_id,
            type="conversation_request",
            title="New conversation request",
            body=f"{sender_name} wants to start a conversation with you.",
            payload={
                "conversation_id": str(conv.id),
                "sender_id": str(sender_id),
                "sender_name": sender_name,
                "sender_image": getattr(sender, "profile_image_url", None),
            },
        )
        self.session.add(notif)
        self.session.commit()
        self.session.refresh(notif)

        emit_to_user_sync(
            str(recipient_id),
            "new_notification",
            {
                "id": str(notif.id),
                "user_id": str(recipient_id),
                "type": notif.type,
                "title": notif.title,
                "body": notif.body,
                "data": notif.payload or {},
                "created_at": (
                    notif.created_at.isoformat() if notif.created_at else None
                ),
            },
        )
        emit_to_user_sync(
            str(recipient_id),
            "conversation_request_received",
            {
                "conversation_id": str(conv.id),
                "sender_id": str(sender_id),
                "sender_name": sender_name,
            },
        )

    def _notify_request_accepted(
        self, conv: Conversation, *, accepter_id: UUID
    ) -> None:
        sender_id = conv.created_by
        accepter = self.user_service.get_user_model_by_id(accepter_id)
        accepter_name = (
            f"{accepter.first_name} {accepter.last_name}".strip()
            or accepter.email
        )

        notif = Notification(
            user_id=sender_id,
            type="conversation_request_accepted",
            title="Request accepted",
            body=f"{accepter_name} accepted your conversation request.",
            payload={
                "conversation_id": str(conv.id),
                "accepter_id": str(accepter_id),
                "accepter_name": accepter_name,
            },
        )
        self.session.add(notif)
        self.session.commit()
        self.session.refresh(notif)

        emit_to_user_sync(
            str(sender_id),
            "conversation_request_accepted",
            {
                "conversation_id": str(conv.id),
                "accepter_id": str(accepter_id),
            },
        )
        emit_to_user_sync(
            str(sender_id),
            "new_notification",
            {
                "id": str(notif.id),
                "user_id": str(sender_id),
                "type": notif.type,
                "title": notif.title,
                "body": notif.body,
                "data": notif.payload or {},
                "created_at": (
                    notif.created_at.isoformat() if notif.created_at else None
                ),
            },
        )

    def _notify_request_rejected(
        self, conv: Conversation, *, rejecter_id: UUID
    ) -> None:
        emit_to_user_sync(
            str(conv.created_by),
            "conversation_request_rejected",
            {
                "conversation_id": str(conv.id),
                "rejecter_id": str(rejecter_id),
            },
        )

    # ── response builder ───────────────────────────────────
    def _build_conversation_response(
        self, conv: Conversation, current_user_id: UUID
    ) -> ConversationResponse:
        participants = self.repo.get_participants(conv.id)
        other: ParticipantInfo | None = None
        for p in participants:
            if p.user_id != current_user_id:
                user = self.user_service.get_user_model_by_id(p.user_id)
                other = ParticipantInfo(
                    id=user.id,
                    first_name=user.first_name,
                    last_name=user.last_name,
                    profile_image_url=getattr(user, "profile_image_url", None),
                    username=(
                        f"{user.first_name} {user.last_name}".strip()
                        or user.email
                    ),
                    account_type=getattr(user, "account_type", None),
                )
                break

        last_msg = self.repo.get_last_message(conv.id)
        unread = self.repo.count_unread(conv.id, current_user_id)

        return ConversationResponse(
            id=conv.id,
            type=conv.type,
            title=conv.title,
            status=conv.status,
            created_by=conv.created_by,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            last_message=last_msg,
            unread_count=unread,
            participant=other,
        )