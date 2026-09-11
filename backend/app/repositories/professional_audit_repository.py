from typing import Optional, Tuple
from uuid import UUID

from sqlmodel import Session, func, select

from app.enums.professional import AuditAction
from app.models.professional_audit_log import ProfessionalAuditLog


class ProfessionalAuditRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, log: ProfessionalAuditLog) -> ProfessionalAuditLog:
        self.session.add(log)
        self.session.flush()
        return log

    def list_for_professional(
        self,
        professional_id: UUID,
        skip: int = 0,
        limit: int = 50,
        action: Optional[AuditAction] = None,
    ) -> Tuple[list[ProfessionalAuditLog], int]:
        conditions = [ProfessionalAuditLog.professional_id == professional_id]
        if action:
            conditions.append(ProfessionalAuditLog.action == action)

        total = (
            self.session.exec(
                select(func.count())
                .select_from(ProfessionalAuditLog)
                .where(*conditions)
            ).first()
            or 0
        )
        items = self.session.exec(
            select(ProfessionalAuditLog)
            .where(*conditions)
            .order_by(ProfessionalAuditLog.created_at.desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return items, total

    def list_all(
        self,
        skip: int = 0,
        limit: int = 50,
        action: Optional[AuditAction] = None,
    ) -> Tuple[list[ProfessionalAuditLog], int]:
        conditions = []
        if action:
            conditions.append(ProfessionalAuditLog.action == action)

        count_stmt = select(func.count()).select_from(ProfessionalAuditLog)
        list_stmt = select(ProfessionalAuditLog)
        if conditions:
            count_stmt = count_stmt.where(*conditions)
            list_stmt = list_stmt.where(*conditions)

        total = self.session.exec(count_stmt).first() or 0
        items = self.session.exec(
            list_stmt.order_by(ProfessionalAuditLog.created_at.desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return items, total