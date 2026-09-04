# app/services/storage_service.py
from supabase import create_client, Client
from app.core.config import settings
from uuid import uuid4
from typing import Tuple
import os

class StorageService:
    def __init__(self):
        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        self.bucket = settings.SUPABASE_STORAGE_BUCKET

    def generate_upload_url(
        self,
        user_id: str,
        file_name: str,
        content_type: str,
        folder: str = "voice"   # <-- new folder parameter
    ) -> Tuple[str, str]:
        # Extract file extension
        ext = file_name.split('.')[-1] if '.' in file_name else 'bin'
        # Build path with folder and random name
        path = f"{folder}/{user_id}/{uuid4()}.{ext}"
        res = self.supabase.storage.from_(self.bucket).create_signed_upload_url(path)
        return res["signedUrl"], res["path"]

    def get_public_url(self, path: str) -> str:
        return self.supabase.storage.from_(self.bucket).get_public_url(path)