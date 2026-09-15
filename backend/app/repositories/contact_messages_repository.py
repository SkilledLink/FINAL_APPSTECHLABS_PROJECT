from datetime import datetime, timedelta, timezone

from sqlmodel import Session, select

from app.models.contact_messages import Contact2_Message


class ContactMessageRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, contact_message: Contact2_Message) -> Contact2_Message:
        self.session.add(contact_message)
        self.session.flush()
        self.session.refresh(contact_message)
        return contact_message

    def get_by_id(self, message_id: int) -> Contact2_Message | None:
        statement = select(Contact2_Message).where(
            Contact2_Message.id == message_id
        )
        return self.session.exec(statement).first()

    def get_all(self) -> list[Contact2_Message]:
        statement = select(Contact2_Message).order_by(
            Contact2_Message.created_at.desc()
        )
        return list(self.session.exec(statement).all())

    def count_recent_by_email(self, email: str) -> int:
        cutoff = datetime.now(timezone.utc) - timedelta(days=7)

        statement = select(Contact2_Message).where(
            Contact2_Message.email == email,
            Contact2_Message.created_at >= cutoff,
        )

        messages = self.session.exec(statement).all()
        return len(messages)