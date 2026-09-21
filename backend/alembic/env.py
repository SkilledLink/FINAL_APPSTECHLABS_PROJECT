# alembic/env.py

import sys
from logging.config import fileConfig
from pathlib import Path

import sqlalchemy as sa
from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlalchemy.dialects import postgresql
from sqlmodel import SQLModel

# Ensure `app` is importable when alembic runs from backend/.
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Register custom column types so autogenerate recognises them.
import geoalchemy2  # noqa: F401
from pgvector.sqlalchemy import Vector  # noqa: F401

from app.core.config import settings  # noqa: E402

# Import every model so SQLModel.metadata knows about them.
import app.models  # noqa: F401, E402

config = context.config

config.set_main_option(
    "sqlalchemy.url",
    settings.DATABASE_URL.replace("%", "%%"),
)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = SQLModel.metadata


# ─────────────────────────────────────────────────────────────────────
#  Autogenerate filter — protect legacy tables and unsafe diffs
# ─────────────────────────────────────────────────────────────────────

# Tables that exist in the DB but are NOT managed by our SQLModel metadata.
LEGACY_TABLES = {
    "spatial_ref_sys",
    "sposts", "posts", "search_documents",
    "contact2_messages", "contact_messages", "contacts", "landing_inquiries",
    "project_shares", "projects", "project_likes", "project_comments",
    "job_shares", "job_posts", "job_applications",
    "conversations", "conversation_participants", "messages", "reviews",
    "feed_comments", "feed_hashtags", "feed_likes", "feed_media",
    "feeds", "hashtags",
}

# (table, column) pairs we never want autogenerate to touch.
IGNORE_COLUMN_PAIRS = {
    ("users", "avatar_url"),          # exists in DB, not in model
    ("users", "username"),            # DB allows NULL, model does not
    ("users", "profile_image_url"),   # DB is TEXT, model is String
    ("users", "banner_image_url"),    # same
}


def include_object(object, name, type_, reflected, compare_to):
    if type_ == "table":
        if name in LEGACY_TABLES:
            return False
        if reflected and compare_to is None:
            return False

    if type_ == "column":
        table = getattr(object, "table", None)
        table_name = getattr(table, "name", None)
        if table_name and (table_name, name) in IGNORE_COLUMN_PAIRS:
            return False

    return True


def compare_type(context, inspected_column, metadata_column,
                 inspected_type, metadata_type):
    """Return False to skip a type diff, None for default behaviour.

    Skips:
      - TIMESTAMPTZ (DB) → DateTime (model)      — would strip tz info
      - JSONB (DB) → JSON (model)                — JSONB is superior
      - TEXT (DB) → String/VARCHAR/AutoString    — DB is intentionally unbounded
    """
    # TIMESTAMP(timezone=True) → naive DateTime
    if isinstance(inspected_type, sa.TIMESTAMP) and getattr(
        inspected_type, "timezone", False
    ) and isinstance(metadata_type, sa.DateTime):
        return False

    # JSONB → JSON
    if isinstance(inspected_type, postgresql.JSONB) and isinstance(
        metadata_type, postgresql.JSON
    ):
        return False

    # TEXT → String / VARCHAR / AutoString
    if isinstance(inspected_type, sa.Text) and isinstance(
        metadata_type, sa.String
    ):
        return False

    return None


def compare_server_default(context, inspected_column, metadata_column,
                           inspected_default, metadata_default,
                           rendered_metadata_default):
    """Never flag server_default differences — the DB is authoritative."""
    return False


# ─────────────────────────────────────────────────────────────────────
#  Migration runners
# ─────────────────────────────────────────────────────────────────────

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=compare_type,
        compare_server_default=compare_server_default,
        include_object=include_object,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=compare_type,
            compare_server_default=compare_server_default,
            include_object=include_object,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()