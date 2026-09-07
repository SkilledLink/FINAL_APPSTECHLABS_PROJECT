from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, ARRAY, Text

class UrgencyLevel(str, Enum):
    TODAY = "today"
    TOMORROW = "tomorrow"
    THIS_WEEK = "this-week"
    NEXT_WEEK = "next-week"
    FLEXIBLE = "flexible"

class JobPost(SQLModel, table=True):
    __tablename__ = "job_posts"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=255)
    client_type: str = Field(default="individual", max_length=50)
    client_name: str = Field(max_length=255)
    location: str = Field(max_length=255)
    trade: str = Field(max_length=100)
    custom_trade: Optional[str] = Field(default=None, max_length=100)
    description: str = Field(sa_column=Column(Text))
    budget: Optional[str] = Field(default=None, max_length=100)
    urgency: UrgencyLevel = Field(default=UrgencyLevel.FLEXIBLE)
    contact_phone: str = Field(max_length=20)
    contact_email: Optional[str] = Field(default=None, max_length=255)
    images: List[str] = Field(default=[], sa_column=Column(ARRAY(String(500))))
    is_verified: bool = Field(default=False)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)