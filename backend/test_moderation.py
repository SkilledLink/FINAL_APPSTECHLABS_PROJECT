# test_moderation.py
"""
Standalone moderation smoke test. Run from backend/:
    python test_moderation.py
"""
import io
import logging

from PIL import Image

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s %(name)s: %(message)s",
)

from app.services.moderation.providers.factory import (
    build_text_provider,
    build_image_provider,
)
from app.services.moderation import prompts
from app.services.moderation.text_moderator import TextModerator
from app.services.moderation.video_moderator import VideoModerator


def make_test_jpeg() -> bytes:
    """Generate a real 64x64 JPEG at runtime — no embedded hex."""
    img = Image.new("RGB", (64, 64), color=(200, 180, 140))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


def make_test_png() -> bytes:
    """Generate a real 64x64 PNG at runtime."""
    img = Image.new("RGB", (64, 64), color=(80, 140, 200))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def main():
    print("=" * 70)
    print("1. TEXT MODERATION — benign post (cache miss then hit)")
    print("=" * 70)

    tp = build_text_provider()
    print(f"provider name: {tp.name}")
    tm = TextModerator(tp)

    r = tm.moderate(
        "Kitchen renovation complete",
        "Happy customer, see the before and after photos below.",
    )
    print(f"  severity={r.severity} confidence={r.confidence}")
    print(f"  description={r.description!r}")
    print(f"  reason={r.reason!r}")
    print(f"  categories={r.categories}")
    print(f"  provider={r.provider} model={r.model}")
    print(f"  error={r.error}")

    print()
    print("  --- second call, same content (should hit cache) ---")
    r2 = tm.moderate(
        "Kitchen renovation complete",
        "Happy customer, see the before and after photos below.",
    )
    print(f"  severity={r2.severity} (should match)")
    assert r.severity == r2.severity

    print()
    print("=" * 70)
    print("2. IMAGE MODERATION — real 64x64 JPEG (PIL-generated)")
    print("=" * 70)

    ip = build_image_provider()
    print(f"provider name: {ip.name}")

    jpeg = make_test_jpeg()
    print(f"  test image: {len(jpeg)} bytes, JPEG")

    r3 = ip.moderate_image(prompts.SYSTEM_PROMPT, jpeg, "image/jpeg")
    print(f"  severity={r3.severity} confidence={r3.confidence}")
    print(f"  description={r3.description!r}")
    print(f"  reason={r3.reason!r}")
    print(f"  categories={r3.categories}")
    print(f"  provider={r3.provider} model={r3.model}")
    print(f"  error={r3.error}")
    if r3.fallback_used:
        print(f"  fallback_used=True  primary={r3.primary_provider}")
        print(f"  primary_error={r3.primary_error!r}")

    print()
    print("=" * 70)
    print("3. IMAGE MODERATION — real 64x64 PNG")
    print("=" * 70)

    png = make_test_png()
    print(f"  test image: {len(png)} bytes, PNG")

    r_png = ip.moderate_image(prompts.SYSTEM_PROMPT, png, "image/png")
    print(f"  severity={r_png.severity} confidence={r_png.confidence}")
    print(f"  description={r_png.description!r}")
    print(f"  error={r_png.error}")

    print()
    print("=" * 70)
    print("4. VIDEO STUB — must always flag for review")
    print("=" * 70)
    vm = VideoModerator()
    r4 = vm.moderate("https://example.com/some-video.mp4")
    print(f"  type={type(r4).__name__}")
    print(f"  severity={r4.severity} (expect 6)")
    print(f"  reason={r4.reason!r}")
    assert r4.severity == 6

    print()
    print("=" * 70)
    print("ALL CHECKS PASSED")
    print("=" * 70)


if __name__ == "__main__":
    main()