import io
import logging
from typing import Optional

import httpx
from PIL import Image

from app.core.config import settings

logger = logging.getLogger(__name__)

_MAX_DOWNLOAD_BYTES = 10 * 1024 * 1024  # 10 MB
_ALLOWED_MIME_PREFIX = "image/"


class ImageFetchError(Exception):
    pass


class CloudinaryImageFetcher:
    """Download an image URL and return resized JPEG bytes suitable
    for a vision model."""

    def __init__(self):
        self.max_dim = settings.MODERATION_IMAGE_MAX_DIMENSION
        self.timeout = 15.0

    def fetch_and_resize(self, url: str) -> tuple[bytes, str]:
        if not url:
            raise ImageFetchError("empty_url")
        try:
            with httpx.Client(timeout=self.timeout, follow_redirects=True) as client:
                r = client.get(url)
        except httpx.TimeoutException:
            raise ImageFetchError("timeout")
        except httpx.HTTPError as e:
            raise ImageFetchError(f"http_error: {e}")

        if r.status_code == 404:
            raise ImageFetchError("not_found")
        if r.status_code >= 400:
            raise ImageFetchError(f"http_status_{r.status_code}")

        content_type = (r.headers.get("content-type") or "").lower()
        if not content_type.startswith(_ALLOWED_MIME_PREFIX):
            raise ImageFetchError(f"bad_content_type: {content_type}")

        if len(r.content) > _MAX_DOWNLOAD_BYTES:
            raise ImageFetchError("payload_too_large")

        return self._resize(r.content)

    def _resize(self, raw: bytes) -> tuple[bytes, str]:
        try:
            img = Image.open(io.BytesIO(raw))
            img.load()
        except Exception as e:
            raise ImageFetchError(f"decode_failed: {e}")

        # Convert to RGB (handles PNG alpha, palette, CMYK, etc.)
        if img.mode != "RGB":
            img = img.convert("RGB")

        img.thumbnail((self.max_dim, self.max_dim), Image.LANCZOS)

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=80, optimize=True)
        return buf.getvalue(), "image/jpeg"