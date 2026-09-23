# app/core/emails.py
import resend
from app.core.config import settings

resend.api_key = settings.RESEND_API_KEY


# ═══════════════════════════════════════════════════════════════════
# SHARED EMAIL SHELL — SkilledLink brand
# ═══════════════════════════════════════════════════════════════════

BRAND_NAME = "SkilledLink"
BRAND_TAGLINE = "Professional connections. Real opportunities."

# Colors (match the app's design system)
INK = "#0f172a"          # slate-900
INK_SOFT = "#334155"     # slate-700
MUTED = "#64748b"        # slate-500
MUTED_SOFT = "#94a3b8"   # slate-400
SURFACE = "#ffffff"
CANVAS = "#f4f7fb"
BORDER = "#e2e8f0"       # slate-200
BLUE = "#2563eb"         # blue-600
BLUE_DARK = "#1d4ed8"    # blue-700
BLUE_LIGHT = "#eff6ff"   # blue-50
BLUE_BORDER = "#bfdbfe"  # blue-200
GREEN = "#059669"        # emerald-600
GREEN_LIGHT = "#ecfdf5"  # emerald-50
GREEN_BORDER = "#a7f3d0" # emerald-200
RED = "#dc2626"          # red-600
RED_DARK = "#991b1b"
RED_LIGHT = "#fef2f2"
RED_BORDER = "#fecaca"


def _shell(
    *,
    preheader: str,
    title: str,
    subtitle: str,
    body_html: str,
    footer_note: str | None = None,
) -> str:
    """Wrap content in the shared SkilledLink email shell."""
    footer = (
        footer_note
        or f"© {BRAND_NAME}. All rights reserved."
    )

    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
</head>
<body style="margin:0;padding:0;background:{CANVAS};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

    <!-- Preheader (hidden preview text) -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
        {preheader}
    </div>

    <div style="padding:40px 16px;background:{CANVAS};">
        <div style="max-width:600px;margin:0 auto;">

            <!-- ═══════ CARD ═══════ -->
            <div style="background:{SURFACE};border-radius:16px;overflow:hidden;
                        border:1px solid {BORDER};
                        box-shadow:0 1px 3px rgba(15,23,42,0.04),0 12px 32px -16px rgba(15,23,42,0.08);">

                <!-- ═══════ HEADER ═══════ -->
                <div style="padding:28px 32px;background:{INK};text-align:center;">
                    <div style="font-size:22px;font-weight:800;color:#ffffff;
                                letter-spacing:-0.02em;line-height:1.1;">
                        Skilled<span style="color:#60a5fa;">Link</span>
                    </div>
                    <div style="margin-top:6px;font-size:12.5px;color:#94a3b8;
                                font-weight:500;letter-spacing:0.01em;">
                        {BRAND_TAGLINE}
                    </div>
                </div>

                <!-- ═══════ BODY ═══════ -->
                <div style="padding:36px 32px 28px;">
                    <h1 style="margin:0 0 8px;color:{INK};font-size:22px;
                               font-weight:700;letter-spacing:-0.02em;
                               line-height:1.25;"> 
                        {title}
                    </h1>
                    <p style="margin:0 0 28px;color:{MUTED};font-size:14px;
                              line-height:1.6;">
                        {subtitle}
                    </p>

                    {body_html}
                </div>

                <!-- ═══════ FOOTER ═══════ -->
                <div style="padding:20px 32px;background:#f8fafc;
                            border-top:1px solid {BORDER};text-align:center;">
                    <p style="margin:0;color:{MUTED_SOFT};font-size:11.5px;
                              line-height:1.6;">
                        {footer}
                    </p>
                    <p style="margin:6px 0 0;color:{MUTED_SOFT};font-size:11.5px;">
                        Need help? Reply to this email or visit
                        <a href="https://skilledlink.app/help"
                           style="color:{BLUE};text-decoration:none;font-weight:600;">
                            skilledlink.app/help
                        </a>
                    </p>
                </div>
            </div>

            <!-- ═══════ SUBFOOTER ═══════ -->
            <div style="text-align:center;margin-top:20px;">
                <p style="margin:0;color:{MUTED_SOFT};font-size:11px;
                          line-height:1.5;">
                    You're receiving this email because you have an account on
                    {BRAND_NAME}.
                </p>
            </div>

        </div>
    </div>
</body>
</html>
"""


def _code_block(code: str, accent: str = BLUE) -> str:
    """Render a verification / reset code as a clean, centered block."""
    return f"""
    <div style="margin:8px 0 24px;padding:24px 20px;
                background:#f8fafc;border:1px solid {BORDER};
                border-radius:12px;text-align:center;">
        <div style="font-size:11px;font-weight:700;color:{MUTED};
                    letter-spacing:0.14em;text-transform:uppercase;
                    margin-bottom:12px;">
            Your code
        </div>
        <div style="font-family:'SF Mono',Monaco,Menlo,Consolas,
                    'Courier New',monospace;
                    font-size:34px;font-weight:700;letter-spacing:0.35em;
                    color:{accent};line-height:1.1;
                    padding-left:0.35em;">
            {code}
        </div>
        <div style="margin-top:14px;font-size:12px;color:{MUTED_SOFT};">
            Expires in {settings.VERIFICATION_TOKEN_EXPIRE_MINUTES} minutes
        </div>
    </div>
    """


def _info_box(title: str, content: str, accent: str = BLUE) -> str:
    """Render an information block with a left accent border."""
    light_bg = BLUE_LIGHT if accent == BLUE else GREEN_LIGHT

    return f"""
    <div style="margin:24px 0;padding:18px 20px;
                background:{light_bg};
                border-left:3px solid {accent};
                border-radius:8px;">
        <div style="font-size:11px;font-weight:700;color:{accent};
                    letter-spacing:0.1em;text-transform:uppercase;
                    margin-bottom:8px;">
            {title}
        </div>
        <div style="color:{INK_SOFT};font-size:14px;line-height:1.7;
                    white-space:pre-wrap;">
            {content}
        </div>
    </div>
    """


def _button(label: str, href: str) -> str:
    """Render a primary CTA button."""
    return f"""
    <div style="margin:28px 0 8px;text-align:center;">
        <a href="{href}"
           style="display:inline-block;background:{BLUE};
                  color:#ffffff;font-weight:600;font-size:14px;
                  padding:14px 28px;border-radius:10px;
                  text-decoration:none;letter-spacing:-0.005em;
                  box-shadow:0 1px 2px rgba(37,99,235,0.2);">
            {label}
        </a>
    </div>
    """


def _muted_note(text: str) -> str:
    """Small muted helper text."""
    return f"""
    <p style="margin:20px 0 0;color:{MUTED_SOFT};font-size:12px;
              line-height:1.6;text-align:center;">
        {text}
    </p>
    """


# ═══════════════════════════════════════════════════════════════════
# 1. EMAIL VERIFICATION
# ═══════════════════════════════════════════════════════════════════

def send_verification_email(email: str, code: str) -> None:
    try:
        print(f"Attempting to send verification code to {email}…")

        body = f"""
            <p style="margin:0 0 8px;color:{INK_SOFT};font-size:14.5px;
                      line-height:1.7;">
                Welcome to {BRAND_NAME}. To finish setting up your account,
                enter the code below in the app:
            </p>

            {_code_block(code, accent=BLUE)}

            {_muted_note(
                "Didn't create an account? You can safely ignore this email — "
                "no account will be created without verifying this code."
            )}
        """

        html_content = _shell(
            preheader=f"Your {BRAND_NAME} verification code is {code}",
            title="Verify your email",
            subtitle="Confirm your email address to unlock your SkilledLink account.",
            body_html=body,
        )

        resend.Emails.send({
            "from": settings.FROM_EMAIL,
            "to": email,
            "subject": f"Your {BRAND_NAME} verification code",
            "html": html_content,
        })
        print("✅ Verification email sent successfully!")
    except Exception as e:
        print(f"❌ Error sending verification email: {e}")


# ═══════════════════════════════════════════════════════════════════
# 2. PASSWORD RESET
# ═══════════════════════════════════════════════════════════════════

def send_password_reset_email(email: str, code: str) -> None:
    try:
        print(f"Attempting to send password reset code to {email}…")

        body = f"""
            <p style="margin:0 0 8px;color:{INK_SOFT};font-size:14.5px;
                      line-height:1.7;">
                We received a request to reset your {BRAND_NAME} password.
                Enter the code below in the app to continue:
            </p>

            {_code_block(code, accent=RED)}

            {_info_box(
                title="Security notice",
                content=(
                    "If you didn't request this, no action is needed — your "
                    "password won't change. For added security, consider "
                    "changing your password if you suspect someone has access "
                    "to your email."
                ),
                accent=RED,
            )}
        """

        html_content = _shell(
            preheader=f"Your {BRAND_NAME} password reset code is {code}",
            title="Reset your password",
            subtitle="Enter this code to set a new password for your account.",
            body_html=body,
        )

        resend.Emails.send({
            "from": settings.FROM_EMAIL,
            "to": email,
            "subject": f"Your {BRAND_NAME} password reset code",
            "html": html_content,
        })
        print("✅ Password reset email sent successfully!")
    except Exception as e:
        print(f"❌ Error sending password reset email: {e}")


# ═══════════════════════════════════════════════════════════════════
# 3. CONTACT REPLY
# ═══════════════════════════════════════════════════════════════════

def send_contact_reply_email(
    email: str,
    name: str,
    original_message: str,
    admin_reply: str,
) -> None:
    try:
        print(f"Attempting to send contact reply to {email}…")

        body = f"""
            <p style="margin:0 0 24px;color:{INK_SOFT};font-size:14.5px;
                      line-height:1.7;">
                Hi {name}, thank you for contacting {BRAND_NAME}. Our team has
                reviewed your message and prepared a response below.
            </p>

            {_info_box("Your message", original_message, accent=MUTED)}

            {_info_box(
                f"{BRAND_NAME.upper()} response",
                admin_reply,
                accent=BLUE,
            )}

            <p style="margin:24px 0 0;color:{INK_SOFT};font-size:14.5px;
                      line-height:1.7;">
                If you have any further questions, feel free to reply to this
                email — we're always happy to help.
            </p>

            <p style="margin:20px 0 0;color:{INK};font-size:14.5px;
                      line-height:1.7;">
                Best regards,<br />
                <strong>The {BRAND_NAME} Team</strong>
            </p>
        """

        html_content = _shell(
            preheader=f"We've responded to your message — {BRAND_NAME}",
            title=f"Hello {name},",
            subtitle="Here's our response to your recent message.",
            body_html=body,
        )

        resend.Emails.send({
            "from": settings.FROM_EMAIL,
            "to": email,
            "subject": f"Response from {BRAND_NAME}",
            "html": html_content,
        })
        print("✅ Contact reply email sent successfully!")
    except Exception as e:
        print(f"❌ Error sending contact reply email: {e}")