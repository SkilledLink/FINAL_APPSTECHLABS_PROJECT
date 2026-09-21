# app/services/payments/kora_client.py
"""Kora aggregator client.

Configuration is read from app.core.config.settings (which loads .env
via pydantic-settings). Falls back to os.getenv and constructor args.

⚠️  Endpoint paths must be verified against Kora's current docs before
    enabling live mode.
"""

import hashlib
import hmac
import logging
import os
from decimal import Decimal
from typing import Optional

import httpx

from app.core.config import settings
from app.services.payments.base import ChargeInitResult, WebhookEvent

logger = logging.getLogger(__name__)


_NETWORK_MAP = {
    "mtn_momo": "Mtn",
    "orange_money": "Orange",
}

_SIGNATURE_HEADERS = (
    "x-korapay-signature",
    "x-kora-signature",
    "x-signature",
)


def _resolve_setting(field: str, env_var: str, default: Optional[str] = None) -> Optional[str]:
    """Settings > env var > default. Never raises."""
    value = getattr(settings, field, None)
    if value:
        return value
    value = os.getenv(env_var)
    if value:
        return value
    return default


class KoraClient:
    DEFAULT_BASE_URL = "https://api.korapay.com/merchant/api/v1"
    DEFAULT_TIMEOUT = 30.0

    def __init__(
        self,
        public_key: Optional[str] = None,
        secret_key: Optional[str] = None,
        environment: Optional[str] = None,
        country: Optional[str] = None,
        currency: Optional[str] = None,
        supported_providers: Optional[list[str]] = None,
        base_url: Optional[str] = None,
        timeout: Optional[float] = None,
    ):
        self.public_key = public_key or _resolve_setting(
            "KORA_PUBLIC_KEY", "KORA_PUBLIC_KEY"
        )
        self.secret_key = secret_key or _resolve_setting(
            "KORA_SECRET_KEY", "KORA_SECRET_KEY"
        )
        self.environment = (
            environment
            or _resolve_setting("KORA_ENVIRONMENT", "KORA_ENVIRONMENT", "test")
        ).lower()
        self.country = (
            country
            or _resolve_setting("KORA_COUNTRY", "KORA_COUNTRY", "CM")
        )
        self.currency = (
            currency
            or _resolve_setting("KORA_CURRENCY", "KORA_CURRENCY", "XAF")
        )

        providers_raw = _resolve_setting(
            "KORA_MOBILE_MONEY_PROVIDERS",
            "KORA_MOBILE_MONEY_PROVIDERS",
            "mtn,orange",
        )
        self.supported_providers = supported_providers or [
            p.strip().lower() for p in providers_raw.split(",") if p.strip()
        ]

        self.base_url = (
            base_url
            or _resolve_setting("KORA_BASE_URL", "KORA_BASE_URL", self.DEFAULT_BASE_URL)
        ).rstrip("/")

        self.charge_init_path = _resolve_setting(
            "KORA_CHARGE_INIT_PATH",
            "KORA_CHARGE_INIT_PATH",
            "/charges/mobile-money",
        )
        self.charge_verify_path = _resolve_setting(
            "KORA_CHARGE_VERIFY_PATH",
            "KORA_CHARGE_VERIFY_PATH",
            "/charges/{reference}",
        )

        self.webhook_url = _resolve_setting(
            "KORA_WEBHOOK_URL",
            "KORA_WEBHOOK_URL",
            "https://example.com/api/v1/payments/webhooks/kora",
        )

        if timeout is not None:
            self.timeout = timeout
        else:
            raw = _resolve_setting(
                "KORA_TIMEOUT_SECONDS", "KORA_TIMEOUT_SECONDS"
            )
            try:
                self.timeout = float(raw) if raw else self.DEFAULT_TIMEOUT
            except (TypeError, ValueError):
                self.timeout = self.DEFAULT_TIMEOUT

    # ─────────────────────────────────────────────────────────
    #  Public API
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

        normalized_network = _NETWORK_MAP.get(network.lower())
        if normalized_network is None:
            raise ValueError(f"Unsupported mobile money network: {network}")

        # Payload shape per Kora's mobile money charge API.
        payload = {
            "reference": reference,
            "amount": int(amount),
            "currency": currency,
            "description": description or f"SkilledLink payment {reference}",
            "notification_url": self.webhook_url,
            "redirect_url": self.webhook_url,
            "customer": {
                "name": customer.get("name") or "SkilledLink User",
                "email": customer.get("email"),
            },
            "merchant_bears_cost": True,
            "mobile_money": {
                "number": phone_number,
                "network": normalized_network,
            },
        }

        url = f"{self.base_url}{self.charge_init_path}"

        logger.info("[KORA] POST %s", url)
        logger.info(
            "[KORA] env=%s country=%s currency=%s",
            self.environment, self.country, self.currency,
        )
        logger.info("[KORA] payload=%s", payload)

        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.post(
                    url,
                    json=payload,
                    headers=self._auth_headers(),
                )
                logger.info(
                    "[KORA] response status=%s body=%s",
                    response.status_code,
                    response.text,
                )
                response.raise_for_status()
                body = response.json()
        except httpx.HTTPStatusError as exc:
            logger.error(
                "Kora charge init failed (status=%s): %s",
                exc.response.status_code,
                exc.response.text,
            )
            return ChargeInitResult(
                status="failed",
                raw={"error": exc.response.text, "status": exc.response.status_code},
                message=f"Kora rejected the request: {exc.response.text[:300]}",
            )
        except httpx.HTTPError as exc:
            logger.error("Kora charge init transport error: %s", exc)
            return ChargeInitResult(
                status="failed",
                raw={"error": str(exc)},
                message="Could not reach payment provider",
            )

        data = body.get("data") or {}
        provider_reference = (
            data.get("reference")
            or data.get("transaction_reference")
            or data.get("payment_reference")
        )
        checkout_url = (
            data.get("checkout_url")
            or data.get("payment_link")
            or data.get("redirect_url")
        )
        instructions = (
            data.get("instructions")
            or data.get("message")
            or "Confirm the mobile money prompt on your phone."
        )

        return ChargeInitResult(
            status="pending",
            raw=body,
            provider_reference=provider_reference,
            checkout_url=checkout_url,
            instructions=instructions,
            message=body.get("message"),
        )

    def verify_webhook_signature(self, raw_body: bytes, headers: dict) -> bool:
        # Dev-only bypass. Read via `settings` because pydantic-settings
        # does NOT populate os.environ from .env in this project.
        if getattr(settings, "KORA_ALLOW_UNSIGNED_WEBHOOKS", False):
            logger.warning(
                "[KORA] Unsigned webhook accepted (dev bypass is ON). "
                "Turn off KORA_ALLOW_UNSIGNED_WEBHOOKS in production."
            )
            return True

        signature = None
        for key in _SIGNATURE_HEADERS:
            if key in headers:
                signature = headers[key]
                break
        if not signature or not self.secret_key:
            return False
        computed = hmac.new(
            self.secret_key.encode(),
            raw_body,
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(computed, signature)

    def parse_webhook_event(self, body: dict) -> WebhookEvent:
        data = body.get("data") or body
        reference = (
            data.get("reference")
            or data.get("merchant_reference")
            or ""
        )
        raw_status = (
            data.get("status")
            or body.get("event")
            or ""
        ).lower()

        if raw_status in {"success", "successful", "charge.success"}:
            status = "success"
        elif raw_status in {"failed", "failure", "charge.failed", "error"}:
            status = "failed"
        else:
            status = "pending"

        provider_transaction_id = (
            data.get("transaction_reference")
            or data.get("transaction_id")
            or data.get("id")
        )
        reason = (
            data.get("failure_reason")
            or data.get("message")
            or body.get("message")
        )

        return WebhookEvent(
            reference=reference,
            status=status,
            provider_transaction_id=provider_transaction_id,
            reason=reason,
            raw=body,
        )

    # ─────────────────────────────────────────────────────────
    #  Internals
    # ─────────────────────────────────────────────────────────

    def _auth_headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def _require_keys(self) -> None:
        if not self.secret_key:
            raise RuntimeError(
                "KORA_SECRET_KEY is not configured. Checked: constructor arg, "
                "settings.KORA_SECRET_KEY, os.environ['KORA_SECRET_KEY']. "
                "Ensure it is set in backend/.env and that uvicorn was started "
                "from the backend directory."
            )