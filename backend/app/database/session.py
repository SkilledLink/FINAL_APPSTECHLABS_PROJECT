# app/database/session.py

from sqlmodel import create_engine, Session
from sqlalchemy.pool import NullPool

from app.core.config import settings


# ──────────────────────────────────────────────────────────────
# Detect which Supabase connection mode we're on.
#
#   • Transaction pooler (port 6543)
#       → pgbouncer handles pooling. Use NullPool so we don't
#         double-pool, and disable psycopg 3's client-side
#         prepared-statement cache via prepare_threshold=None.
#
#   • Session pooler OR direct (port 5432)
#       → We pool ourselves, conservatively.
# ──────────────────────────────────────────────────────────────

DATABASE_URL = settings.DATABASE_URL
is_transaction_pooler = ":6543" in DATABASE_URL
is_development = settings.environment.lower() == "development"


if is_transaction_pooler:
    # ── Transaction pooler mode ────────────────────────────
    engine = create_engine(
        DATABASE_URL,
        echo=is_development,
        poolclass=NullPool,
        connect_args={
            # ✅ Correct for psycopg 3 + pgbouncer (transaction mode).
            # Disables the client-side prepared-statement cache so we
            # never send named statements like "_pg3_0" to pgbouncer.
            "prepare_threshold": None,
        },
    )
else:
    # ── Session pooler / direct mode ───────────────────────
    engine = create_engine(
        DATABASE_URL,
        echo=is_development,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=3,
        pool_timeout=10,
        pool_recycle=1800,
    )


def get_session():
    """FastAPI dependency — yields a scoped DB session."""
    with Session(engine) as session:
        try:
            yield session
        finally:
            session.close()