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
    EMBEDDING_DIMENSION: int = 1536

settings = Settings()
