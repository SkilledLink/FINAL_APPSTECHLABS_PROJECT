from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class ContactMessageCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    email: EmailStr
    message: str = Field(min_length=1, max_length=5000)


class ContactMessageRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    message: str
    is_read: bool
    replied: bool
    admin_reply: str | None
    created_at: datetime
    replied_at: datetime | None


class ContactMessageReply(BaseModel):
    reply: str = Field(min_length=1, max_length=5000)

    