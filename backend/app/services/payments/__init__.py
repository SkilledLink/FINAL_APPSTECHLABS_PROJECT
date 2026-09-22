# app/services/payments/__init__.py
"""Payment provider factory + network helpers."""

import logging

from app.core.config import settings
from app.services.payments.base import PaymentProviderClient

logger = logging.getLogger(__name__)


def get_payment_provider() -> PaymentProviderClient:
    """Return the configured PaymentProviderClient."""
    name = (getattr(settings, "PAYMENT_PROVIDER", "mtn") or "mtn").strip().lower()

    if name == "mock":
        from app.services.payments.mock_client import MockMomoClient
        logger.warning(
            "[PAYMENTS] provider=MOCK — no real charges will be made. "
            "Set PAYMENT_PROVIDER=mtn in .env to use MTN MoMo."
        )
        return MockMomoClient()

    if name == "mtn":
        from app.services.payments.mtn_client import MtnMomoClient
        logger.info("[PAYMENTS] provider=MTN MoMo")
        return MtnMomoClient()

    if name == "kora":
        from app.services.payments.kora_client import KoraClient
        logger.info("[PAYMENTS] provider=Kora")
        return KoraClient()

    raise RuntimeError(f"Unknown PAYMENT_PROVIDER={name!r}")


def get_network_for_phone(phone: str, country: str = "CM") -> str:
    """
    Best-effort Cameroon network detection.
      MTN    → 67x, 650-654, 680-684
      Orange → 69x, 655-659, 685-689
    Raises ValueError if unknown.
    """
    digits = "".join(c for c in phone if c.isdigit())
    if digits.startswith("237"):
        digits = digits[3:]

    if digits.startswith(("67", "650", "651", "652", "653", "654",
                          "680", "681", "682", "683", "684")):
        return "mtn_momo"

    if digits.startswith(("69", "655", "656", "657", "658", "659",
                          "685", "686", "687", "688", "689")):
        return "orange_money"

    raise ValueError(
        f"Could not detect mobile money network for {phone!r}. "
        "Cameroon MTN prefixes: 67, 650-654, 680-684."
    )