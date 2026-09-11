from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    VERIFICATION_TOKEN_EXPIRE_MINUTES: int = 10

    # Email
    RESEND_API_KEY: str
    FROM_EMAIL: str

    # Application
    app_name: str = "Professional Network API"
    environment: str = "development"

    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_STORAGE_BUCKET: str = "messages"

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    # ─── Didit KYC (professional verification) ───
    DIDIT_API_KEY: str
    DIDIT_WEBHOOK_SECRET: str
    # workflow_id is per-session config, but we keep it here for convenience
    DIDIT_WORKFLOW_ID: str = "9245dbac-f2de-4f75-8b19-5a35fa43e416"
        # AI / Embeddings
    OPENAI_API_KEY: str
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    GEMINI_API_KEY: str = ""
    EMBEDDING_DIMENSION: int = 1536

        # ── Location / Geocoding ─────────────────────────────────
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

settings = Settings()
