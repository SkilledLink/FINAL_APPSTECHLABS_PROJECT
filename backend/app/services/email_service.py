import resend
from app.core.config import settings

resend.api_key = settings.RESEND_API_KEY

def send_verification_email(email: str, code: str) -> None:
    try:
        print(f"Attempting to send verification code to {email}...")
        html_content = f"""
        <div style="background-color: #F0F9FF; border: 2px solid #BAE6FD; border-radius: 8px; padding: 20px; text-align: center;">
            <h2 style="color: #0369A1;">Verify Your Email</h2>
            <p style="color: #666;">Your code is:</p>
            <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #0369A1;">{code}</span>
            <p style="color: #999; font-size: 12px;">This code expires in {settings.VERIFICATION_TOKEN_EXPIRE_MINUTES} minutes.</p>
        </div>
        """
        resend.Emails.send({
            "from": settings.FROM_EMAIL,
            "to": email,
            "subject": "Your Appstect Verification Code",
            "html": html_content,
        })
        print("✅ Verification Email sent successfully!")
    except Exception as e:
        print(f"❌ Error sending email: {e}")


def send_password_reset_email(email: str, code: str) -> None:
    try:
        print(f"Attempting to send password reset code to {email}...")
        html_content = f"""
        <div style="background-color: #FEF2F2; border: 2px solid #FECACA; border-radius: 8px; padding: 20px; text-align: center;">
            <h2 style="color: #991B1B;">Password Reset</h2>
            <p style="color: #666;">Your reset code is:</p>
            <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #B91C1C;">{code}</span>
            <p style="color: #999; font-size: 12px;">This code expires in {settings.VERIFICATION_TOKEN_EXPIRE_MINUTES} minutes.</p>
        </div>
        """
        resend.Emails.send({
            "from": settings.FROM_EMAIL,
            "to": email,
            "subject": "Your Appstect Password Reset Code",
            "html": html_content,
        })
        print("✅ Password Reset Email sent successfully!")
    except Exception as e:
        print(f"❌ Error sending email: {e}")