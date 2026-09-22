# app/core/config.py

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    VERIFICATION_TOKEN_EXPIRE_MINUTES: int = 10

    RESEND_API_KEY: str
    FROM_EMAIL: str

    app_name: str = "Professional Network API"
    environment: str = "development"

    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_STORAGE_BUCKET: str = "messages"

    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    DIDIT_API_KEY: str
    DIDIT_WEBHOOK_SECRET: str
    DIDIT_WORKFLOW_ID: str = "9245dbac-f2de-4f75-8b19-5a35fa43e416"

    # ── AI / Embeddings ─────────────────────────────────────
    OPENAI_API_KEY: str
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    GEMINI_API_KEY: str = ""
    EMBEDDING_DIMENSION: int = 1536

    # ── Location ────────────────────────────────────────────
    NOMINATIM_BASE_URL: str = "https://nominatim.openstreetmap.org"
    NOMINATIM_USER_AGENT: str = "SkilledLink/1.0 (contact@skilledlink.app)"
    NOMINATIM_TIMEOUT_SECONDS: float = 8.0
    NOMINATIM_MIN_INTERVAL_SECONDS: float = 1.0
    NOMINATIM_CACHE_TTL_SECONDS: int = 60 * 60 * 24
    NOMINATIM_COUNTRY_BIAS: str = "cm"

    LOCATION_SEARCH_MAX_RESULTS: int = 8
    LOCATION_MIN_RADIUS_KM: float = 0.5
    LOCATION_MAX_RADIUS_KM: float = 200.0
    NEARBY_DEFAULT_RADIUS_KM: float = 10.0
    NEARBY_MAX_RESULTS: int = 50
    LOCATION_PUBLIC_FUZZ_DECIMALS: int = 3

    # ── Groq ────────────────────────────────────────────────
    GROQ_API_KEY: str = ""

    # ── AI Gateway ──────────────────────────────────────────
    AI_PRIMARY_PROVIDER: str = "groq"
    AI_FALLBACK_PROVIDER: str = "gemini"

    GROQ_CHAT_MODEL: str = "openai/gpt-oss-120b"
    GROQ_CHAT_MODEL_FAST: str = "openai/gpt-oss-20b"
    GROQ_CHAT_BASE_URL: str = "https://api.groq.com/openai/v1"
    GROQ_CHAT_TIMEOUT_SECONDS: float = 8.0
    GROQ_CHAT_MAX_TOKENS: int = 350
    GROQ_CHAT_TEMPERATURE: float = 0.4

    GEMINI_CHAT_MODEL: str = "models/gemini-3.1-flash-lite"
    GEMINI_CHAT_TIMEOUT_SECONDS: float = 12.0
    GEMINI_CHAT_MAX_TOKENS: int = 350
    GEMINI_CHAT_TEMPERATURE: float = 0.4

    GEMINI_IMAGE_MODEL: str = "models/gemini-3.1-flash-lite"
    GEMINI_IMAGE_TIMEOUT_SECONDS: float = 20.0

    AI_TOTAL_BUDGET_SECONDS: float = 15.0
    AI_RETRY_TRANSIENT: bool = True
    AI_RETRY_BACKOFF_SECONDS: float = 0.5

    # ── AI — per subscription tier ──────────────────────────
    # Level 2 (AI Professional) → Groq
    AI_TIER_2_PROVIDER: str = "groq"
    AI_TIER_2_API_KEY: str = ""
    AI_TIER_2_MODEL: str = "openai/gpt-oss-120b"
    AI_TIER_2_BASE_URL: str = "https://api.groq.com/openai/v1"
    AI_TIER_2_MAX_TOKENS: int = 2000
    AI_TIER_2_TEMPERATURE: float = 0.4
    AI_TIER_2_TIMEOUT_SECONDS: float = 15.0

    # Level 3 (AI Professional Plus) → Gemini
    # Primary model is a Lite Flash (better availability than full Flash).
    # Fallbacks are tried in order if the primary returns 503/5xx.
    AI_TIER_3_PROVIDER: str = "gemini"
    AI_TIER_3_API_KEY: str = ""
    AI_TIER_3_MODEL: str = "models/gemini-3.5-flash-lite"
    AI_TIER_3_MODEL_FALLBACKS: str = (
        "models/gemini-3.1-flash-lite,"
        "models/gemini-3.5-flash,"
        "models/gemini-3.7-flash"
    )
    AI_TIER_3_BASE_URL: str = (
        "https://generativelanguage.googleapis.com/v1beta"
    )
    AI_TIER_3_MAX_TOKENS: int = 3000
    AI_TIER_3_TEMPERATURE: float = 0.4
    AI_TIER_3_TIMEOUT_SECONDS: float = 30.0

    # Vision model for Level 3 image analysis
    AI_TIER_3_VISION_MODEL: str = "models/gemini-3.5-flash-lite"

    # ── Chat flags ──────────────────────────────────────────
    CHAT_INTENT_ENABLED: bool = True
    CHAT_SKIP_RAG_FOR_SIMPLE: bool = True

    # ── RAG ─────────────────────────────────────────────────
    RAG_TOP_K: int = 3
    RAG_MIN_SIMILARITY: float = 0.45
    RAG_QUERY_CACHE_TTL_SECONDS: int = 3600
    RAG_QUERY_CACHE_MAX_SIZE: int = 500

    # ── AI Tools ────────────────────────────────────────────
    AI_TOOLS_ENABLED: bool = True
    AI_TOOL_PROFESSIONAL_LIMIT: int = 10

    # ── Image uploads ───────────────────────────────────────
    AI_IMAGE_MAX_SIZE_MB: int = 8

    # ── Moderation ──────────────────────────────────────────
    MODERATION_ENABLED: bool = True
    MODERATION_TEXT_PROVIDER: str = "gemini"
    MODERATION_TEXT_FALLBACK_PROVIDER: str = "groq"
    MODERATION_IMAGE_PROVIDER: str = "gemini"
    MODERATION_IMAGE_FALLBACK_PROVIDER: str = "groq"
    MODERATION_TIMEOUT_SECONDS: int = 10
    MODERATION_MAX_RETRIES: int = 1
    MODERATION_IMAGE_MAX_DIMENSION: int = 768
    MODERATION_MAX_CALLS_PER_MINUTE: int = 12
    MODERATION_TEXT_CACHE_TTL_SECONDS: int = 604800
    MODERATION_TEXT_CACHE_MAX_SIZE: int = 2000
    MODERATION_GROQ_TEXT_MODEL: str = "openai/gpt-oss-120b"
    MODERATION_GROQ_VISION_MODEL: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    MODERATION_GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    MODERATION_GEMINI_MODEL: str = "models/gemini-3.6-flash"

    # ── Socket.IO ───────────────────────────────────────────
    SOCKET_CORS_ORIGINS: str = "http://localhost:5173"
    SOCKET_PATH: str = "socket.io"

    # ── Kora Payments ───────────────────────────────────────
    KORA_PUBLIC_KEY: str = ""
    KORA_SECRET_KEY: str = ""
    KORA_ENVIRONMENT: str = "test"
    KORA_COUNTRY: str = "CM"
    KORA_CURRENCY: str = "XAF"
    KORA_MOBILE_MONEY_PROVIDERS: str = "mtn,orange"
    KORA_BASE_URL: str = "https://api.korapay.com/merchant/api/v1"
    KORA_CHARGE_INIT_PATH: str = "/charges/mobile-money"
    KORA_CHARGE_VERIFY_PATH: str = "/charges/{reference}"
    KORA_TIMEOUT_SECONDS: float = 30.0
    KORA_WEBHOOK_URL: str = "https://example.com/api/v1/payments/webhooks/kora"
    KORA_ALLOW_UNSIGNED_WEBHOOKS: bool = False


settings = Settings()