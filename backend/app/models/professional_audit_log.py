from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import JSON
from sqlmodel import Column, Field, Relationship, SQLModel

from app.enums.professional import AuditAction

if TYPE_CHECKING:
    from app.models.professional import Professional


class ProfessionalAuditLog(SQLModel, table=True):
    __tablename__ = "professional_audit_logs"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    professional_id: UUID = Field(
        foreign_key="professionals.id", index=True, nullable=False
    )

    actor_user_id: Optional[UUID] = Field(default=None, foreign_key="users.id")
    actor_role: Optional[str] = Field(default=None, max_length=20)

    action: AuditAction = Field(nullable=False, index=True)
    old_value: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    new_value: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    reason: Optional[str] = Field(default=None, max_length=500)

    ip_address: Optional[str] = Field(default=None, max_length=45)
    user_agent: Optional[str] = Field(default=None, max_length=500)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    professional: Optional["Professional"] = Relationship(
        back_populates="audit_logs",
        sa_relationship_kwargs={"foreign_keys": "[ProfessionalAuditLog.professional_id]"},
    )