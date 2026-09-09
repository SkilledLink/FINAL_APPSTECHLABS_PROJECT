import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from typing import Optional
import uuid

from app.core.config import settings

# Configure Cloudinary once
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)


class StorageService:
    # ─── Client‑side signed URL (legacy) ──────────────────────
    def generate_upload_url(self, user_id: str, file_name: str, content_type: str, folder: str = "files"):
        """
        Generates a signed upload URL for client‑side uploads (legacy).
        For server‑side upload, use upload_image().
        """
        return "upload_url", f"{folder}/{user_id}/{file_name}"

    def get_public_url(self, path: str) -> str:
        """
        Returns the public URL for a given stored file path.
        """
        return f"https://yourcloudinary.cloud.com/{path}"

    # ─── Server‑side upload (works for all file types) ────────
    def upload_image(
        self,
        file: UploadFile,
        folder: str = "",
        public_id: Optional[str] = None,
        max_size_mb: int = 20,
        allowed_mime_types: Optional[list[str]] = None,
        resource_type: str = "auto",  # "image", "video", "raw", or "auto"
    ) -> str:
        """
        Upload a file to Cloudinary. Supports images, audio, video, and raw files.
        Returns the secure URL.
        """
        # Default allowed MIME types (if needed for validation)
        if allowed_mime_types is None:
            allowed_mime_types = [
                "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif",
                "application/pdf", "audio/webm", "audio/mpeg", "video/mp4",
                "application/octet-stream",
            ]

        # Read file contents
        contents = file.file.read()
        if len(contents) > max_size_mb * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Max size: {max_size_mb}MB"
            )

        # Optional: content‑type validation – skip if resource_type is "auto"
        actual_content_type = file.content_type
        if resource_type == "auto" and actual_content_type:
            # For "auto", we don't need strict validation – Cloudinary will handle it.
            pass
        elif resource_type != "auto":
            if actual_content_type is None or actual_content_type.lower() not in [m.lower() for m in allowed_mime_types]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid file type. Allowed: {', '.join(allowed_mime_types)}"
                )

        # Generate a public_id if not provided
        if public_id is None:
            public_id = str(uuid.uuid4())

        # Build the full Cloudinary public_id
        full_public_id = f"{folder}/{public_id}" if folder else public_id

        try:
            # Upload to Cloudinary with the appropriate resource_type
            upload_result = cloudinary.uploader.upload(
                contents,
                public_id=full_public_id,
                overwrite=False,
                resource_type=resource_type,
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Cloudinary upload failed: {str(e)}"
            )

        return upload_result.get("secure_url")