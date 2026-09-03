from enum import Enum

class AccountType(str, Enum):
    USER = "user"
    PROFESSIONAL = "professional"
    BUSINESS = "business"

class AccountStatus(str, Enum):
    PENDING_VERIFICATION = "pending_verification"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DEACTIVATED = "deactivated"