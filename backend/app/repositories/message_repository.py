from sqlmodel import Session, select
from uuid import UUID
from typing import Optional, List
from datetime import datetime
from app.models.message import Message
from sqlalchemy.dialects.postgresql import insert

class MessageRepository:
    def __init__(self, session: Session):
        self.session = session

    def insert_message(self, message_data: dict) -> Message:
        stmt = insert(Message).values(**message_data).returning(Message)
        stmt = stmt.on_conflict_do_nothing(
            index_elements=["sender_id", "client_message_id"]
        )
        result = self.session.execute(stmt)
        inserted = result.scalar_one_or_none()
        if not inserted:
            select_stmt = select(Message).where(
                Message.sender_id == message_data["sender_id"],
                Message.client_message_id == message_data["client_message_id"]
            )
            return self.session.exec(select_stmt).first()
        self.session.commit()
        return inserted

    def get_messages(self, conversation_id: UUID, before: Optional[datetime] = None, limit: int = 50) -> List[Message]:
        stmt = select(Message).where(Message.conversation_id == conversation_id)
        if before:
            stmt = stmt.where(Message.created_at < before)
        stmt = stmt.order_by(Message.created_at.desc()).limit(limit)
        return self.session.exec(stmt).all()