# app/services/payments/mtn_client.py
"""MTN Mobile Money (MoMo) Collections API client.

Implements PaymentProviderClient so the service layer stays
provider-agnostic. Only MTN MoMo is wired up here.

Endpoints (per MTN MoMo API docs):
    POST /collection/token/
    POST /collection/v1_0/requesttopay
    GET  /collection/v1_0/requesttopay/{referenceId}
"""

import base64
import json
import logging
import time
import uuid
from decimal import Decimal
from typing import Optional
from urllib.parse import urlparse

import httpx

from app.core.config import settings
from app.services.payments.base import ChargeInitResult, WebhookEvent

logger = logging.getLogger(__name__)


class MtnMomoError(Exception):
    def __init__(self, status: int, message: str, code: Optional[str] = None):
        self.status = status
        self.message = message
        self.code = code
        super().__init__(f"[{status}] {message}")


def _s(field: str, default: Optional[str] = None) -> Optional[str]:
    return getattr(settings, field, None) or default


class MtnMomoClient:
    """PaymentProviderClient implementation for MTN MoMo (Collections)."""

    DEFAULT_BASE_URL = "https://sandbox.momodeveloper.mtn.com"
    DEFAULT_TIMEOUT = 30.0

    # MTN's sandbox rejects XAF — EUR is the only supported currency there.
    SANDBOX_CURRENCY = "EUR"
    # CFA franc is pegged to EUR at a fixed rate (1 EUR = 655.957 XAF).
    XAF_PER_EUR = Decimal("655.957")

    def __init__(
        self,
        subscription_key: Optional[str] = None,
        api_user: Optional[str] = None,
        api_key: Optional[str] = None,
        target_env: Optional[str] = None,
        currency: Optional[str] = None,
        base_url: Optional[str] = None,
        callback_url: Optional[str] = None,
        timeout: Optional[float] = None,
    ) -> None:
        self.subscription_key = subscription_key or _s("MOMO_SUBSCRIPTION_KEY")
        self.api_user = api_user or _s("MOMO_API_USER")
        self.api_key = api_key or _s("MOMO_API_KEY")
        self.target_env = target_env or _s("MOMO_TARGET_ENV", "sandbox")
        self.currency = currency or _s("MOMO_CURRENCY", "EUR")
        self.base_url = (
            base_url or _s("MOMO_BASE_URL", self.DEFAULT_BASE_URL)
        ).rstrip("/")
        self.callback_url = callback_url or _s("MOMO_CALLBACK_URL")
        raw_to = timeout if timeout is not None else _s("MOMO_TIMEOUT_SECONDS")
        try:
            self.timeout = float(raw_to) if raw_to else self.DEFAULT_TIMEOUT
        except (TypeError, ValueError):
            self.timeout = self.DEFAULT_TIMEOUT

        # In-memory token cache
        self._token: Optional[str] = None
        self._token_expires_at: float = 0.0

    # ─────────────────────────────────────────────────────────
    #  Currency + amount resolution
    # ─────────────────────────────────────────────────────────

    def _resolve_amount_and_currency(
        self, amount: Decimal, currency: str
    ) -> tuple[str, str]:
        is_sandbox = self.target_env.strip().lower() == "sandbox"

        if is_sandbox:
            actual_currency = self.SANDBOX_CURRENCY
            if (currency or "").upper() == "XAF":
                actual_amount = (amount / self.XAF_PER_EUR).quantize(
                    Decimal("0.01")
                )
            else:
                actual_amount = amount
            amount_str = f"{actual_amount:.2f}"
            logger.info(
                "[MTN] sandbox amount conversion: %s %s → %s %s",
                amount,
                currency,
                amount_str,
                actual_currency,
            )
            return amount_str, actual_currency

        amount_str = (
            str(int(amount))
            if amount == amount.to_integral_value()
            else str(amount)
        )
        return amount_str, self.currency

    # ─────────────────────────────────────────────────────────
    #  Phone + text sanitization
    # ─────────────────────────────────────────────────────────

    @staticmethod
    def _normalize_phone(phone_number: str) -> str:
        raw = "".join(c for c in str(phone_number) if c.isdigit())
        if raw.startswith("00"):
            raw = raw[2:]
        if len(raw) == 9 and not raw.startswith("237"):
            raw = "237" + raw
        return raw

    @staticmethod
    def _ascii_safe(
        s: Optional[str], max_len: int = 60, fallback: str = "Payment"
    ) -> str:
        text = (s or "").strip()
        text = text.encode("ascii", "ignore").decode("ascii")
        text = " ".join(text.split())
        if not text:
            text = fallback
        return text[:max_len]

    def _should_send_callback_header(self) -> bool:
        """
        MTN validates X-Callback-Url against the API User's registered
        providerCallbackHost. If they don't match, MTN returns:
            "Callback URL does not match the configured value."

        We only send the header when MOMO_CALLBACK_URL is explicitly
        configured with a real, non-placeholder host. Otherwise MTN
        will fall back to the API User's registered host, which is
        exactly what we want for sandbox testing.
        """
        url = (self.callback_url or "").strip()
        if not url:
            return False
        # Ignore obvious placeholder values
        if "example.com" in url:
            return False
        return True

    # ─────────────────────────────────────────────────────────
    #  PaymentProviderClient protocol
    # ─────────────────────────────────────────────────────────

    def initiate_charge(
        self,
        *,
        reference: str,
        amount: Decimal,
        currency: str,
        customer: dict,
        phone_number: str,
        network: str,
        description: Optional[str] = None,
    ) -> ChargeInitResult:
        self._require_keys()

        if network.lower() not in {"mtn_momo", "mtn", "mtn_mobile_money"}:
            return ChargeInitResult(
                status="failed",
                raw={"error": f"unsupported network: {network}"},
                message="MtnMomoClient only handles MTN networks.",
            )

        mtn_reference = str(uuid.uuid4())

        try:
            token = self._get_token()
        except MtnMomoError as exc:
            logger.error("[MTN] token error: %s", exc)
            return ChargeInitResult(
                status="failed",
                raw={
                    "error": exc.message,
                    "status": exc.status,
                    "code": exc.code,
                },
                message=f"Could not authenticate with MTN: {exc.message}",
            )

        headers = {
            "Authorization": f"Bearer {token}",
            "X-Reference-Id": mtn_reference,
            "X-Target-Environment": self.target_env,
            "Ocp-Apim-Subscription-Key": self.subscription_key,
            "Content-Type": "application/json",
        }

        # Only include callback URL when it's a real host that matches
        # the API User's registered providerCallbackHost.
        if self._should_send_callback_header():
            headers["X-Callback-Url"] = self.callback_url
            logger.info(
                "[MTN] sending X-Callback-Url: %s", self.callback_url
            )
        else:
            logger.info(
                "[MTN] omitting X-Callback-Url (MTN will use the API "
                "User's registered providerCallbackHost)"
            )

        amount_str, actual_currency = self._resolve_amount_and_currency(
            amount, currency
        )
        msisdn = self._normalize_phone(phone_number)

        payload = {
            "amount": amount_str,
            "currency": actual_currency,
            "externalId": reference,
            "payer": {
                "partyIdType": "MSISDN",
                "partyId": msisdn,
            },
            "payerMessage": self._ascii_safe(
                description, max_len=60, fallback="Subscription"
            ),
            "payeeNote": self._ascii_safe(
                "Thank you", max_len=60, fallback="Thank you"
            ),
        }

        url = f"{self.base_url}/collection/v1_0/requesttopay"

        logger.info(
            "[MTN] POST %s env=%s ref=%s caller_currency=%s actual_currency=%s",
            url,
            self.target_env,
            mtn_reference,
            currency,
            actual_currency,
        )
        logger.info("[MTN] payload=%s", json.dumps(payload, default=str))

        try:
            with httpx.Client(timeout=self.timeout) as client:
                r = client.post(url, json=payload, headers=headers)

                logger.info(
                    "[MTN] response status=%s headers=%s body=%r",
                    r.status_code,
                    dict(r.headers),
                    r.text,
                )

                if r.status_code != 202:
                    body_text = r.text or ""
                    try:
                        parsed = r.json() if body_text else {}
                    except Exception:
                        parsed = {}

                    message = (
                        parsed.get("message")
                        or parsed.get("detail")
                        or body_text
                        or f"MTN returned {r.status_code} with no body"
                    )

                    return ChargeInitResult(
                        status="failed",
                        raw={
                            "error": body_text,
                            "parsed": parsed,
                            "status": r.status_code,
                            "sent_payload": payload,
                            "sent_callback": headers.get("X-Callback-Url"),
                        },
                        message=f"MTN rejected the request: {message}",
                    )
        except httpx.HTTPError as exc:
            logger.error("[MTN] transport error: %s", exc)
            return ChargeInitResult(
                status="failed",
                raw={"error": str(exc)},
                message="Could not reach MTN MoMo",
            )

        return ChargeInitResult(
            status="pending",
            raw={"reference_id": mtn_reference},
            provider_reference=mtn_reference,
            checkout_url=None,
            instructions=(
                "A prompt has been sent to your phone. "
                "Enter your Mobile Money PIN to approve the payment."
            ),
            message="Payment request sent",
        )

    def verify_webhook_signature(self, raw_body: bytes, headers: dict) -> bool:
        if _s("MOMO_ALLOW_UNSIGNED_WEBHOOKS") in (True, "true", "True", "1"):
            logger.warning(
                "[MTN] Unsigned webhook accepted (dev bypass ON). "
                "Disable MOMO_ALLOW_UNSIGNED_WEBHOOKS in production."
            )
            return True

        expected = _s("MOMO_WEBHOOK_SECRET")
        if not expected:
            return True

        provided = (
            headers.get("x-momo-secret")
            or headers.get("x-webhook-secret")
            or ""
        )
        import hmac

        return hmac.compare_digest(str(expected), str(provided))

    def parse_webhook_event(self, body: dict) -> WebhookEvent:
        reference = body.get("externalId") or body.get("referenceId") or ""
        raw_status = (body.get("status") or "").lower()

        if raw_status in {"successful", "success"}:
            status = "success"
        elif raw_status in {"failed", "failure", "cancelled", "canceled"}:
            status = "failed"
        else:
            status = "pending"

        return WebhookEvent(
            reference=reference,
            status=status,
            provider_transaction_id=(
                body.get("financialTransactionId") or body.get("referenceId")
            ),
            reason=body.get("reason"),
            raw=body,
        )

    # ─────────────────────────────────────────────────────────
    #  Extra helpers (used by polling endpoint)
    # ─────────────────────────────────────────────────────────

    def get_status(self, reference_id: str) -> dict:
        self._require_keys()
        token = self._get_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "X-Target-Environment": self.target_env,
            "Ocp-Apim-Subscription-Key": self.subscription_key,
        }
        url = f"{self.base_url}/collection/v1_0/requesttopay/{reference_id}"
        with httpx.Client(timeout=self.timeout) as client:
            r = client.get(url, headers=headers)
            if r.status_code != 200:
                raise MtnMomoError(r.status_code, r.text)
            return r.json()

    # ─────────────────────────────────────────────────────────
    #  Token management
    # ─────────────────────────────────────────────────────────

    def _basic_auth(self) -> str:
        raw = f"{self.api_user}:{self.api_key}"
        return f"Basic {base64.b64encode(raw.encode()).decode()}"

    def _fetch_token(self) -> tuple[str, float]:
        headers = {
            "Authorization": self._basic_auth(),
            "Ocp-Apim-Subscription-Key": self.subscription_key,
            "Content-Length": "0",
        }
        url = f"{self.base_url}/collection/token/"
        with httpx.Client(timeout=self.timeout) as client:
            r = client.post(url, headers=headers)
        if r.status_code != 200:
            raise MtnMomoError(r.status_code, r.text, code="TOKEN_ERROR")
        data = r.json()
        token = data["access_token"]
        expires_in = int(data.get("expires_in", 3600))
        return token, time.time() + expires_in - 60

    def _get_token(self) -> str:
        if self._token and time.time() < self._token_expires_at:
            return self._token
        token, exp = self._fetch_token()
        self._token = token
        self._token_expires_at = exp
        logger.info(
            "[MTN] token acquired (expires in ~%ss)", int(exp - time.time())
        )
        return token

    def _require_keys(self) -> None:
        missing = [
            name
            for name, val in (
                ("MOMO_SUBSCRIPTION_KEY", self.subscription_key),
                ("MOMO_API_USER", self.api_user),
                ("MOMO_API_KEY", self.api_key),
            )
            if not val
        ]
        if missing:
            raise RuntimeError(
                "Missing MTN MoMo configuration: "
                + ", ".join(missing)
                + ". Set them in backend/.env and restart uvicorn "
                "from the backend directory."
            )