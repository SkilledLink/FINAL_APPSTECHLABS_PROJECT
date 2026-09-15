# test_vision_real.py
"""
Test Gemini vision with a real image file.
Usage:
    python test_vision_real.py path/to/photo.jpg
"""
import sys
import time
from pathlib import Path

from app.core.config import settings
from google import genai
from google.genai import types


def main():
    if len(sys.argv) < 2:
        print("Usage: python test_vision_real.py <path/to/image.jpg>")
        return

    path = Path(sys.argv[1])
    if not path.exists():
        print(f"File not found: {path}")
        return

    print(f"File    : {path}")
    print(f"Size    : {path.stat().st_size:,} bytes")

    # Detect mime
    suffix = path.suffix.lower()
    mime = {
        ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".png": "image/png", ".webp": "image/webp",
    }.get(suffix)
    if not mime:
        print(f"Unsupported extension: {suffix}")
        return

    data = path.read_bytes()
    model = settings.GEMINI_IMAGE_MODEL

    print(f"Model   : {model}")
    print()

    client = genai.Client(
        api_key=settings.GEMINI_API_KEY,
        http_options={"timeout": 30000},
    )

    start = time.perf_counter()
    try:
        resp = client.models.generate_content(
            model=model,
            contents=[
                types.Part.from_bytes(data=data, mime_type=mime),
                "Describe what you see in this image in one sentence.",
            ],
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=200,
            ),
        )
        secs = time.perf_counter() - start
        print(f"✅ Success ({secs:.2f}s)")
        print()
        print("Response:")
        print(resp.text)
    except Exception as e:
        secs = time.perf_counter() - start
        print(f"❌ Failed ({secs:.2f}s)")
        print(f"{type(e).__name__}: {e}")


if __name__ == "__main__":
    main()