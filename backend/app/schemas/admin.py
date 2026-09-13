from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AdminActionRequest(BaseModel):
    reason: str = Field(..., min_length=5, max_length=500)


class RoleUpdateRequest(BaseModel):
    is_admin: Optional[bool] = None
    is_moderator: Optional[bool] = None
    reason: str = Field(..., min_length=5, max_length=500)


class AdminDashboardResponse(BaseModel):
    total_users: int
    active_users: int
    suspended_users: int
    total_professionals: int
    verified_professionals: int
    pending_professionals: int
    total_feeds: int
    total_jobs: int
    total_admins: int
    total_moderators: int
    generated_at: datetime


class AuditLogResponse(BaseModel):
    id: UUID
    actor_user_id: Optional[UUID] = None
    actor_role: Optional[str] = None
    action: str
    entity_type: str
    entity_id: Optional[UUID] = None
    old_value: Optional[dict] = None
    new_value: Optional[dict] = None
    reason: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuditLogListResponse(BaseModel):
    items: list[AuditLogResponse]
    total: int
    page: int
    size: int