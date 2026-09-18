# app/database/session.py

from sqlmodel import create_engine, Session
from sqlalchemy.pool import NullPool

from app.core.config import settings


# ──────────────────────────────────────────────────────────────
# Detect which Supabase connection mode we're on.
#
#   • Transaction pooler (port 6543)
#       → Handled by pgbouncer. Use NullPool so we don't double-
#         pool. Also disable prepared statements (pgbouncer in
#         transaction mode doesn't support them).
#
#   • Session pooler OR direct (port 5432)
#       → We pool ourselves, but conservatively so we never
#         exceed Supabase free-tier cap (15 total across all
#         clients, shared with your whole team).
# ──────────────────────────────────────────────────────────────

DATABASE_URL = settings.DATABASE_URL
is_transaction_pooler = ":6543" in DATABASE_URL
is_development = settings.environment.lower() == "development"


if is_transaction_pooler:
    # ── Transaction pooler mode ────────────────────────────
    # pgbouncer handles pooling. We open a fresh connection per
    # request and close it immediately, freeing the slot for the
    # next request (yours or your teammates').
    engine = create_engine(
        DATABASE_URL,
        echo=is_development,
        poolclass=NullPool,
        connect_args={
            # Required for pgbouncer in transaction mode
            "options": "-c statement_cache_size=0",
        },
    )
else:
    # ── Session pooler / direct mode ───────────────────────
    # We pool, but conservatively. Supabase free tier caps at
    # 15 total across the whole project — leave headroom for
    # your teammates and the SQL editor.
    engine = create_engine(
        DATABASE_URL,
        echo=is_development,
        pool_pre_ping=True,
        pool_size=5,          # baseline: 5 connections
        max_overflow=3,       # burst up to 8 total
        pool_timeout=10,      # wait max 10s for a slot
        pool_recycle=1800,    # recycle every 30 min
    )


def get_session():
    """FastAPI dependency — yields a scoped DB session."""
    with Session(engine) as session:
        try:
            yield session
        finally:
            session.close()