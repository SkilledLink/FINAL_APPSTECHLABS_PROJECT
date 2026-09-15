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

def send_contact_reply_email(
    email: str,
    name: str,
    original_message: str,
    admin_reply: str,
) -> None:
    try:
        html_content = f"""
        <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
            <div style="max-width:680px;margin:0 auto;padding:40px 20px;">

                <div style="background:#ffffff;border-radius:16px;overflow:hidden;
                            box-shadow:0 4px 20px rgba(15,23,42,0.08);">

                    <div style="padding:28px 32px;background:#0f172a;text-align:center;">
                        <div style="font-size:28px;font-weight:800;color:#ffffff;">
                            SkilledLink
                        </div>
                        <div style="margin-top:6px;font-size:14px;color:#cbd5e1;">
                            Professional connections. Real opportunities.
                        </div>
                    </div>

                    <div style="padding:32px;">

                        <h2 style="margin:0 0 16px;color:#0f172a;font-size:24px;">
                            Hello {name},
                        </h2>

                        <p style="color:#475569;font-size:15px;line-height:1.7;">
                            Thank you for contacting SkilledLink.
                            Our team has reviewed your message and provided a response below.
                        </p>

                        <div style="margin:24px 0;padding:20px;background:#f8fafc;
                                    border-left:4px solid #94a3b8;border-radius:8px;">
                            <div style="font-size:13px;font-weight:700;color:#64748b;
                                        margin-bottom:8px;">
                                YOUR MESSAGE
                            </div>
                            <div style="color:#334155;font-size:14px;line-height:1.7;">
                                {original_message}
                            </div>
                        </div>

                        <div style="margin:24px 0;padding:20px;background:#eff6ff;
                                    border-left:4px solid #2563eb;border-radius:8px;">
                            <div style="font-size:13px;font-weight:700;color:#1d4ed8;
                                        margin-bottom:8px;">
                                SKILLEDLINK RESPONSE
                            </div>
                            <div style="color:#1e3a8a;font-size:14px;line-height:1.7;">
                                {admin_reply}
                            </div>
                        </div>

                        <p style="margin-top:28px;color:#475569;font-size:15px;line-height:1.7;">
                            If you have any further questions, you are welcome to contact
                            us again.
                        </p>

                        <p style="margin-top:24px;color:#0f172a;font-size:15px;
                                  line-height:1.7;">
                            Best regards,<br>
                            <strong>The SkilledLink Team</strong>
                        </p>

                    </div>

                    <div style="padding:20px 32px;background:#f8fafc;
                                border-top:1px solid #e2e8f0;text-align:center;">
                        <p style="margin:0;color:#94a3b8;font-size:12px;">
                            © SkilledLink. All rights reserved.
                        </p>
                    </div>

                </div>
            </div>
        </div>
        """

        resend.Emails.send({
            "from": settings.FROM_EMAIL,
            "to": email,
            "subject": "Response from SkilledLink",
            "html": html_content,
        })

    except Exception as e:
        print(f"❌ Error sending contact reply email: {e}")