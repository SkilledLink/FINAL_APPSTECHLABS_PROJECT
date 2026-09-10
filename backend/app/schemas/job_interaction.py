from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ============================================================
# LIKE SCHEMAS
# ============================================================

class JobLikeResponse(BaseModel):
    id: int
    job_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class JobLikeToggleResponse(BaseModel):
    liked: bool
    likes_count: int
    message: str

# ============================================================
# COMMENT SCHEMAS
# ============================================================

class JobCommentBase(BaseModel):
    content: str

class JobCommentCreate(JobCommentBase):
    user_name: str

class JobCommentResponse(JobCommentBase):
    id: int
    job_id: int
    user_id: int
    user_name: str
    created_at: datetime

    class Config:
        from_attributes = True

# ============================================================
# SHARE SCHEMAS
# ============================================================

class JobShareResponse(BaseModel):
    id: int
    job_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class JobShareToggleResponse(BaseModel):
    shared: bool
    shares_count: int
    message: str

# ============================================================
# APPLICATION SCHEMAS
# ============================================================

class JobApplicationBase(BaseModel):
    professional_name: str
    message: Optional[str] = None

class JobApplicationCreate(JobApplicationBase):
    professional_id: int

class JobApplicationResponse(JobApplicationBase):
    id: int
    job_id: int
    professional_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True