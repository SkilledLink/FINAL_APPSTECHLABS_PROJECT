import resend

from app.core.config import settings

resend.api_key = settings.RESEND_API_KEY


async def send_verification_email(email: str, code: str) -> None:
    resend.Emails.send(
        from_=settings.FROM_EMAIL,
        to=email,
        subject="Verify your email",
        html=f"<p>Your verification code is: <strong>{code}</strong></p>",
    )