import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from typing import Optional

from app.core.config import settings


# Configure Cloudinary (already done in core/cloudinary.py, but we'll keep it here)
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)


class StorageService:
    # --- Existing methods (signed URLs) ---
    def generate_upload_url(self, user_id: str, file_name: str, content_type: str, folder: str = "files"):
        """
        Generates a signed upload URL for client‑side uploads (existing logic).
        Placeholder – implement as needed.
        """
        # Example implementation (not required for profile image)
        # ...
        return "upload_url", f"{folder}/{user_id}/{file_name}"

    def get_public_url(self, path: str) -> str:
        """
        Returns the public URL for a given stored file path.
        Placeholder – implement as needed.
        """
        return f"https://yourcloudinary.cloud.com/{path}"

    # --- NEW method for server‑side upload ---
    def upload_image(
        self,
        file: UploadFile,
        user_id: str,
        folder: str = "profile",
        max_size_mb: int = 5,
        allowed_mime_types: Optional[list[str]] = None,
    ) -> str:
        """
        Upload an image file to Cloudinary, overwriting any previous image
        for the same user/folder combination.
        Returns the secure URL.
        """
        if allowed_mime_types is None:
            allowed_mime_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]

        # Validate content type
        if file.content_type not in allowed_mime_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_mime_types)}"
            )

        # Read file contents
        contents = file.file.read()
        if len(contents) > max_size_mb * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Max size: {max_size_mb}MB"
            )

        # Public ID: users/{user_id}/{folder}/avatar
        public_id = f"users/{user_id}/{folder}/avatar"
        try:
            upload_result = cloudinary.uploader.upload(
                contents,
                public_id=public_id,
                overwrite=True,
                resource_type="image",
                # optional transformations: e.g., width=500, crop="fill"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Cloudinary upload failed: {str(e)}"
            )

        return upload_result.get("secure_url")