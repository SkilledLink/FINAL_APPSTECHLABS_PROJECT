# app/schemas/upload.py
from pydantic import BaseModel
from typing import Optional

class UploadUrlRequest(BaseModel):
    file_name: str
    content_type: str = "audio/webm"
    duration_seconds: Optional[float] = None
    file_size: Optional[int] = None   # <-- new optional field

class UploadUrlResponse(BaseModel):
    upload_url: str
    path: str
    public_url: Optional[str] = None