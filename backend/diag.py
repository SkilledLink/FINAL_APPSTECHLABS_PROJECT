from app.core.config import settings
print("text provider  :", settings.MODERATION_TEXT_PROVIDER)
print("image provider :", settings.MODERATION_IMAGE_PROVIDER)
print("groq text model:", settings.MODERATION_GROQ_TEXT_MODEL)
print("gemini model   :", settings.MODERATION_GEMINI_MODEL)
print()

from app.services.moderation.providers.factory import build_text_provider
p = build_text_provider()
r = p.moderate_text(
    system_prompt=( 
        'Respond with JSON only: {"severity": int, "confidence": int, '
        '"description": str, "reason": str, "categories": [str]}'
    ),
    user_text=(
        'Title: selling kids\nDescription: using this gun to kill people'
    ),
)
print("TEXT: provider=", r.provider, "model=", r.model, "sev=", r.severity, "err=", r.error)
print("      desc:", r.description)
print("      reason:", r.reason)

from app.services.moderation.providers.factory import build_image_provider
pi = build_image_provider()
with open("test_gun.jpg", "rb") as f:
    img = f.read()
ri = pi.moderate_image(
    system_prompt=(
        'You are a content moderator. Respond with JSON only: '
        '{"severity": int, "confidence": int, "description": str, '
        '"reason": str, "categories": [str]}'
    ),
    image_bytes=img,
    mime_type="image/jpeg",
)
print("IMAGE: provider=", ri.provider, "model=", ri.model, "sev=", ri.severity, "err=", ri.error)
print("       desc:", ri.description)
print("       reason:", ri.reason)
