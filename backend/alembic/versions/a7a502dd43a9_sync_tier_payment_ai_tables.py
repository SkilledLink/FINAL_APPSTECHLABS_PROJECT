"""sync tier/payment/ai tables (hand-curated)

Revision ID: a7a502dd43a9
Revises: c4a8b1e2f9d3
Create Date: 2026-09-21
"""
from alembic import op
import sqlalchemy as sa


revision = "a7a502dd43a9"
down_revision = "c4a8b1e2f9d3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── 1. professionals.deletion_type: enum → VARCHAR(30) ─────────
    op.execute(
        """
        ALTER TABLE professionals
            ALTER COLUMN deletion_type TYPE VARCHAR(30)
            USING lower(deletion_type::text)
        """
    )
    op.execute("DROP TYPE IF EXISTS deletiontype")

    # ── 2. Re-create audit log action index ───────────────────────
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_professional_audit_logs_action
            ON professional_audit_logs (action)
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_professional_audit_logs_action")

    op.execute(
        "CREATE TYPE deletiontype AS ENUM ('SELF', 'ADMIN', 'GDPR', 'BAN')"
    )
    op.execute(
        """
        ALTER TABLE professionals
            ALTER COLUMN deletion_type TYPE deletiontype
            USING upper(deletion_type)::deletiontype
        """
    )