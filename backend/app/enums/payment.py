# app/enums/payment.py

from enum import Enum


class PaymentProvider(str, Enum):
    MTN_MOMO = "mtn_momo"
    ORANGE_MONEY = "orange_money"


class PaymentMethod(str, Enum):
    MOBILE_MONEY = "mobile_money"
    CARD = "card"
    BANK_TRANSFER = "bank_transfer"
    CASH = "cash"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    EXPIRED = "expired"