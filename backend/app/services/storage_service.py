# app/services/storage_service.py

import logging
import uuid
from typing import Optional

import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile

from app.core.config import settings

logger = logging.getLogger(__name__)

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)


class StorageService:
    # ─── Client-side signed URL (legacy) ─────────────────────
    def generate_upload_url(
        self,
        user_id: str,
        file_name: str,
        content_type: str,
        folder: str = "files",
    ):
        return "upload_url", f"{folder}/{user_id}/{file_name}"

    def get_public_url(self, path: str) -> str:
        return f"https://yourcloudinary.cloud.com/{path}"

    # ─── Server-side upload ──────────────────────────────────
    def upload_image(
        self,
        file: UploadFile,
        folder: str = "",
        public_id: Optional[str] = None,
        max_size_mb: int = 20,
        allowed_mime_types: Optional[list[str]] = None,
        resource_type: str = "auto",
    ) -> str:
        """Upload a file to Cloudinary. Raises HTTPException on any failure.

        Never returns None — callers can rely on a non-empty URL.
        """
        if allowed_mime_types is None:
            allowed_mime_types = [
                "image/jpeg", "image/jpg", "image/png",
                "image/webp", "image/gif",
                "application/pdf",
                "audio/webm", "audio/mpeg",
                "video/mp4",
                "application/octet-stream",
            ]

        # 1. Read the file
        try:
            contents = file.file.read()
        except Exception as exc:
            logger.error("Failed to read uploaded file: %s", exc)
            raise HTTPException(
                status_code=400, detail=f"Could not read uploaded file: {exc}"
            )

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty (0 bytes).",
            )

        if len(contents) > max_size_mb * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Max size: {max_size_mb}MB",
            )

        # 2. MIME check (only when resource_type is explicit)
        actual_content_type = file.content_type
        if resource_type != "auto":
            if (
                actual_content_type is None
                or actual_content_type.lower()
                not in [m.lower() for m in allowed_mime_types]
            ):
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid file type. Allowed: {', '.join(allowed_mime_types)}",
                )

        # 3. Public ID
        if public_id is None:
            public_id = str(uuid.uuid4())
        full_public_id = f"{folder}/{public_id}" if folder else public_id

        # 4. Upload
        try:
            upload_result = cloudinary.uploader.upload(
                contents,
                public_id=full_public_id,
                overwrite=False,
                resource_type=resource_type,
            )
        except Exception as exc:
            logger.exception("Cloudinary upload raised for %s", full_public_id)
            raise HTTPException(
                status_code=500,
                detail=f"Cloudinary upload failed: {exc}",
            )

        # 5. Verify the response actually contains a URL.
        #    Cloudinary sometimes returns {"error": {...}} instead of raising.
        if not isinstance(upload_result, dict):
            logger.error(
                "Cloudinary returned non-dict result for %s: %r",
                full_public_id,
                upload_result,
            )
            raise HTTPException(
                status_code=500,
                detail="Cloudinary upload returned an unexpected response.",
            )

        secure_url = upload_result.get("secure_url")
        if not secure_url:
            error_detail = upload_result.get("error") or upload_result
            logger.error(
                "Cloudinary returned no secure_url for %s: %r",
                full_public_id,
                error_detail,
            )
            raise HTTPException(
                status_code=500,
                detail=(
                    f"Cloudinary upload returned no URL. "
                    f"Response: {str(error_detail)[:400]}"
                ),
            )

        return secure_url