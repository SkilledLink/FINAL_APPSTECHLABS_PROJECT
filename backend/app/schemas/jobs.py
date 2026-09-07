from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UrgencyLevel(str, Enum):
    TODAY = "today"
    TOMORROW = "tomorrow"
    THIS_WEEK = "this-week"
    NEXT_WEEK = "next-week"
    FLEXIBLE = "flexible"

class JobPostBase(BaseModel):
    title: str
    client_type: str = "individual"
    client_name: str
    location: str
    trade: str
    custom_trade: Optional[str] = None
    description: str
    budget: Optional[str] = None
    urgency: UrgencyLevel = UrgencyLevel.FLEXIBLE
    contact_phone: str
    contact_email: Optional[str] = None
    images: Optional[List[str]] = []

class JobPostCreate(JobPostBase):
    pass

class JobPostUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    budget: Optional[str] = None
    urgency: Optional[UrgencyLevel] = None
    is_active: Optional[bool] = None

class JobPostResponse(JobPostBase):
    id: int
    is_verified: bool = False
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True