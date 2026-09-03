from supabase import create_client, Client
from app.core.config import settings
from uuid import uuid4
from typing import Tuple

class StorageService:
    def __init__(self):
        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        self.bucket = settings.SUPABASE_STORAGE_BUCKET

    async def generate_upload_url(self, user_id: str, file_name: str, content_type: str) -> Tuple[str, str]:
        path = f"voice/{user_id}/{uuid4()}.webm"
        res = self.supabase.storage.from_(self.bucket).create_signed_upload_url(path)
        return res["signedUrl"], res["path"]

    def get_public_url(self, path: str) -> str:
        return self.supabase.storage.from_(self.bucket).get_public_url(path)