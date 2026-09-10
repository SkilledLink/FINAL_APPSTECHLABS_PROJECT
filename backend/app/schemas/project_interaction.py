from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ============================================================
# LIKE SCHEMAS
# ============================================================

class ProjectLikeToggleResponse(BaseModel):
    liked: bool
    likes_count: int
    message: str

# ============================================================
# COMMENT SCHEMAS
# ============================================================

class ProjectCommentBase(BaseModel):
    content: str

class ProjectCommentCreate(ProjectCommentBase):
    user_name: str

class ProjectCommentResponse(ProjectCommentBase):
    id: int
    project_id: int
    user_id: int
    user_name: str
    created_at: datetime

    class Config:
        from_attributes = True

# ============================================================
# SHARE SCHEMAS
# ============================================================

class ProjectShareToggleResponse(BaseModel):
    shared: bool
    shares_count: int
    message: str