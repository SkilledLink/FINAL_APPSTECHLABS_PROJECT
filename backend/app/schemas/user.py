from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.enums.user import AccountStatus, AccountType

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    first_name: str
    last_name: str
    account_type: AccountType
    status: AccountStatus
    is_email_verified: bool
    is_admin: bool
    is_moderator: bool
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[EmailStr] = None
    # We don't allow updating password, account_type, status here – those go through separate endpoints
    is_admin: Optional[bool] = None       # only admins can set this
    is_moderator: Optional[bool] = None   # only admins can set this

class UserListResponse(BaseModel):
    items: list[UserResponse]
    total: int
    page: int
    size: int