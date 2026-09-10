from typing import Optional, List
from uuid import UUID
from sqlmodel import Session
from app.models.chat_log import ChatLog


class ChatLogRepository:
    def __init__(self, session: Session):
        self.session = session

    def create_log(
        self,
        user_id: UUID,
        message: str,
        response: str,
        sources: Optional[List[str]] = None
    ) -> ChatLog:
        log = ChatLog(
            user_id=user_id,
            message=message,
            response=response,
            sources=sources
        )
        self.session.add(log)
        self.session.flush()
        return log