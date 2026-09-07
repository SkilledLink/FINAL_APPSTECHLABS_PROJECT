from typing import Optional
from uuid import UUID
import datetime 
import pytz

from sqlmodel import Session, select

from app.models.professional import Professional


class ProfessionalRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, professional: Professional) -> Professional:
        self.session.add(professional)
        self.session.flush()  # to get the ID if needed
        return professional

    def get_by_id(self, professional_id: UUID) -> Optional[Professional]:
        return self.session.get(Professional, professional_id)

    def get_by_user_id(self, user_id: UUID) -> Optional[Professional]:
        statement = select(Professional).where(Professional.user_id == user_id)
        return self.session.exec(statement).first()

    def update(self, professional: Professional, **kwargs) -> Professional:
        for key, value in kwargs.items():
            setattr(professional, key, value)
        professional.updated_at = datetime.now(timezone.utc)
        self.session.add(professional)
        self.session.flush()
        return professional

    def delete(self, professional: Professional) -> None:
        self.session.delete(professional)
        self.session.flush()