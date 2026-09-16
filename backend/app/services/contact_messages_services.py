
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlmodel import Session, select

from app.enums.user import AccountStatus
from app.models.contact_messages import Contact2_Message
from app.models.user import User
from app.repositories.contact_messages_repository import ContactMessageRepository
from app.schemas.contact_messages import ContactMessageCreate
from app.services.email_service import send_contact_reply_email
from app.services.notification_service import NotificationService


class ContactMessageService:
    MAX_MESSAGES_PER_EMAIL = 7
    RATE_LIMIT_DAYS = 7

    def __init__(self, session: Session):
        self.session = session
        self.repo = ContactMessageRepository(session)

    def create_message(
        self,
        data: ContactMessageCreate,
    ) -> Contact2_Message:
        email = str(data.email).strip().lower()

        recent_count = self.repo.count_recent_by_email(email)

        if recent_count >= self.MAX_MESSAGES_PER_EMAIL:
            raise HTTPException(
                status_code=429,
                detail=(
                    "You have reached the maximum of 7 contact messages "
                    "allowed from this email address within 7 days."
                ),
            )

        contact_message = Contact2_Message(
            name=data.name.strip(),
            email=email,
            message=data.message.strip(),
        )

        self.repo.create(contact_message)

        self.session.commit()
        self.session.refresh(contact_message)

        # Notify all active admins after the message has been saved.
        admins = self.session.exec(
            select(User).where(
                User.is_admin == True,
                User.status == AccountStatus.ACTIVE,
            )
        ).all()

        notification_service = NotificationService(self.session)

        for admin in admins:
            notification_service.create(
                user_id=admin.id,
                type="contact_message",
                title="New Contact Message",
                body=f"{contact_message.name} sent a new contact message.",
                payload={
                    "contact_message_id": contact_message.id,
                    "sender_name": contact_message.name,
                    "sender_email": contact_message.email,
                },
            )

        return contact_message

    def get_message(
        self,
        message_id: int,
    ) -> Contact2_Message:
        contact_message = self.repo.get_by_id(message_id)

        if not contact_message:
            raise HTTPException(
                status_code=404,
                detail="Contact message not found",
            )

        return contact_message

    def mark_as_read(
        self,
        message_id: int,
    ) -> Contact2_Message:
        contact_message = self.get_message(message_id)

        if not contact_message.is_read:
            contact_message.is_read = True

            self.session.add(contact_message)
            self.session.commit()
            self.session.refresh(contact_message)

        return contact_message

    def reply_to_message(
        self,
        message_id: int,
        reply: str,
    ) -> Contact2_Message:
        contact_message = self.get_message(message_id)

        if contact_message.replied:
            raise HTTPException(
                status_code=400,
                detail="This contact message has already been replied to.",
            )

        reply = reply.strip()

        if not reply:
            raise HTTPException(
                status_code=400,
                detail="Reply cannot be empty.",
            )

        # Save the reply first.
        contact_message.admin_reply = reply
        contact_message.replied = True
        contact_message.replied_at = datetime.now(timezone.utc)
        contact_message.is_read = True

        self.session.add(contact_message)
        self.session.commit()
        self.session.refresh(contact_message)

        # Send the email after the reply has been saved.
        send_contact_reply_email(
            email=contact_message.email,
            name=contact_message.name,
            original_message=contact_message.message,
            admin_reply=reply,
        )

        return contact_message

