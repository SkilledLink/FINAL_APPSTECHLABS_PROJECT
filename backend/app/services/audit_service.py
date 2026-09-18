import logging
from typing import Optional
from uuid import UUID

from fastapi import Request
from sqlmodel import Session, func, select

from app.models.audit_log import AuditLog
from app.models.user import User

logger = logging.getLogger(__name__)


class AuditService:
    def __init__(self, session: Session):
        self.session = session

    def _derive_role(self, actor: User) -> str:
        if getattr(actor, "is_admin", False):
            return "admin"
        if getattr(actor, "is_moderator", False):
            return "moderator"
        return "user" 

    def _request_meta(
        self, request: Optional[Request],
    ) -> tuple[Optional[str], Optional[str]]:
        if request is None:
            return None, None
        ip = None
        try:
            if request.client:
                ip = request.client.host
        except Exception:
            ip = None
        ua = None
        try:
            ua = request.headers.get("user-agent")
        except Exception:
            ua = None
        if ua and len(ua) > 500:
            ua = ua[:500]
        return ip, ua

    def log(
        self,
        actor: User,
        action: str,
        entity_type: str,
        entity_id: Optional[UUID] = None,
        old_value: Optional[dict] = None,
        new_value: Optional[dict] = None,
        reason: Optional[str] = None,
        request: Optional[Request] = None,
    ) -> AuditLog:
        ip, ua = self._request_meta(request)
        entry = AuditLog(
            actor_user_id=actor.id,
            actor_role=self._derive_role(actor),
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            old_value=old_value,
            new_value=new_value,
            reason=reason,
            ip_address=ip,
            user_agent=ua,
        )
        self.session.add(entry)
        self.session.flush()
        return entry

    def list_logs(
        self,
        skip: int = 0,
        limit: int = 50,
        actor_user_id: Optional[UUID] = None,
        entity_type: Optional[str] = None,
        action: Optional[str] = None,
    ) -> tuple[list[AuditLog], int]:
        conditions = []
        if actor_user_id is not None:
            conditions.append(AuditLog.actor_user_id == actor_user_id)
        if entity_type:
            conditions.append(AuditLog.entity_type == entity_type)
        if action:
            conditions.append(AuditLog.action == action)

        count_stmt = select(func.count()).select_from(AuditLog)
        list_stmt = select(AuditLog)
        if conditions:
            count_stmt = count_stmt.where(*conditions)
            list_stmt = list_stmt.where(*conditions)

        total = self.session.exec(count_stmt).first() or 0
        items = self.session.exec(
            list_stmt.order_by(AuditLog.created_at.desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return list(items), total

    def get_by_id(self, log_id: UUID) -> Optional[AuditLog]:
        return self.session.get(AuditLog, log_id)