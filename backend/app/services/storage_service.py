import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from typing import Optional
import uuid

from app.core.config import settings


cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)


class StorageService:
    def generate_upload_url(self, user_id: str, file_name: str, content_type: str, folder: str = "files"):
        return "upload_url", f"{folder}/{user_id}/{file_name}"

    def get_public_url(self, path: str) -> str:
        return f"https://yourcloudinary.cloud.com/{path}"

    def upload_image(
        self,
        file: UploadFile,
        folder: str = "",
        public_id: Optional[str] = None,
        max_size_mb: int = 5,
        allowed_mime_types: Optional[list[str]] = None,
    ) -> str:
        if allowed_mime_types is None:
            allowed_mime_types = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/webp",
                "image/gif"
            ]

        # Read the file contents once
        contents = file.file.read()
        if len(contents) > max_size_mb * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Max size: {max_size_mb}MB"
            )

        # Determine content type from magic bytes if missing or generic
        actual_content_type = file.content_type
        if actual_content_type is None or actual_content_type.lower() == "application/octet-stream":
            # Try to guess from the first bytes
            import magic
            try:
                mime = magic.from_buffer(contents[:1024], mime=True)
                if mime and mime.startswith("image/"):
                    actual_content_type = mime
            except (ImportError, Exception):
                # Fallback: use file extension or just assume it's an image
                # but we'll raise a 400 if we can't determine
                pass

        # If still not recognized, raise error
        if actual_content_type is None or actual_content_type.lower() not in [m.lower() for m in allowed_mime_types]:
            # Last resort: if the file name ends with a known image extension, accept it
            if file.filename and any(file.filename.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif']):
                # Accept as image/jpeg if extension is .jpg/.jpeg, etc.
                if file.filename.lower().endswith(('.jpg', '.jpeg')):
                    actual_content_type = "image/jpeg"
                elif file.filename.lower().endswith('.png'):
                    actual_content_type = "image/png"
                elif file.filename.lower().endswith('.webp'):
                    actual_content_type = "image/webp"
                elif file.filename.lower().endswith('.gif'):
                    actual_content_type = "image/gif"
                else:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Unsupported image format: {file.filename}"
                    )
            else:
                # Log and raise
                print(f"Rejected file: {file.filename}, content_type: {file.content_type}, detected: {actual_content_type}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid file type. Allowed: {', '.join(allowed_mime_types)}"
                )

        # Proceed with upload
        if public_id is None:
            public_id = str(uuid.uuid4())

        full_public_id = f"{folder}/{public_id}" if folder else public_id

        try:
            upload_result = cloudinary.uploader.upload(
                contents,
                public_id=full_public_id,
                overwrite=False,
                resource_type="image",
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Cloudinary upload failed: {str(e)}"
            )

        return upload_result.get("secure_url")