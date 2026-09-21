"""professional v2: status, verification, fraud, retention, audit logs

Revision ID: c4a8b1e2f9d3
Revises: 8f3c2a91d7e4   # ← chain from the location migration (or your current head)
Create Date: 2026-01-15 10:30:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "c4a8b1e2f9d3"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()

    # ─── 1. Enums ────────────────────────────────────────────
    professional_status_enum = postgresql.ENUM(
        "pending", "active", "suspended", "under_review", "deactivated", "deleted",
        name="professionalaccountstatus",
        create_type=False,
    )
    verification_status_enum = postgresql.ENUM(
        "not_started", "pending", "approved", "rejected", "failed",
        "manual_review", "manual_approved", "manual_rejected", "expired",
        name="verificationstatus",
        create_type=False,
    )
    experience_level_enum = postgresql.ENUM(
        "junior", "intermediate", "senior", "expert",
        name="experiencelevel",
        create_type=False,
    )
    deletion_type_enum = postgresql.ENUM(
        "self", "admin", "gdpr", "ban",
        name="deletiontype",
        create_type=False,
    )
    audit_action_enum = postgresql.ENUM(
        "profile.created", "profile.updated",
        "profile.soft_deleted.self", "profile.soft_deleted.admin",
        "status.suspended", "status.reactivated", "status.under_review",
        "status.deactivated",
        "verification.submitted", "verification.approved", "verification.rejected",
        "verification.failed", "verification.manual_review",
        "verification.manual_approved", "verification.manual_rejected",
        "verification.attempts_exhausted",
        "flag.added", "flag.removed",
        "trust_score.changed",
        name="auditaction",
        create_type=False,
    )

    professional_status_enum.create(bind, checkfirst=True)
    verification_status_enum.create(bind, checkfirst=True)
    experience_level_enum.create(bind, checkfirst=True)
    deletion_type_enum.create(bind, checkfirst=True)
    audit_action_enum.create(bind, checkfirst=True)

    # ─── 2. Add new columns to professionals ─────────────────
    op.add_column("professionals", sa.Column("headline", sa.String(150), nullable=True))
    op.add_column("professionals", sa.Column("experience_level", experience_level_enum, nullable=False, server_default="intermediate"))
    op.add_column("professionals", sa.Column("company_name", sa.String(150), nullable=True))
    op.add_column("professionals", sa.Column("job_title", sa.String(120), nullable=True))
    op.add_column("professionals", sa.Column("employment_type", sa.String(50), nullable=True))

    op.add_column("professionals", sa.Column("website_url", sa.String(300), nullable=True))
    op.add_column("professionals", sa.Column("linkedin_url", sa.String(300), nullable=True))
    op.add_column("professionals", sa.Column("portfolio_url", sa.String(300), nullable=True))
    op.add_column("professionals", sa.Column("facebook_url", sa.String(300), nullable=True))
    op.add_column("professionals", sa.Column("instagram_url", sa.String(300), nullable=True))
    op.add_column("professionals", sa.Column("twitter_url", sa.String(300), nullable=True))

    op.add_column("professionals", sa.Column("certifications", postgresql.JSONB, nullable=True))
    op.add_column("professionals", sa.Column("education", postgresql.JSONB, nullable=True))
    op.add_column("professionals", sa.Column("languages", postgresql.JSONB, nullable=True))

    op.add_column("professionals", sa.Column("currency", sa.String(3), nullable=False, server_default="XAF"))

    op.add_column("professionals", sa.Column("availability_notes", sa.String(500), nullable=True))
    op.add_column("professionals", sa.Column("response_time_hours", sa.Integer, nullable=True))

    op.add_column("professionals", sa.Column("status", professional_status_enum, nullable=False, server_default="pending"))
    op.add_column("professionals", sa.Column("profile_completeness", sa.Integer, nullable=False, server_default="0"))

    op.add_column("professionals", sa.Column("verification_attempts", sa.Integer, nullable=False, server_default="0"))
    op.add_column("professionals", sa.Column("verification_last_attempt_at", sa.DateTime(timezone=True), nullable=True))

    op.add_column("professionals", sa.Column("admin_override_status", verification_status_enum, nullable=True))
    op.add_column("professionals", sa.Column("admin_override_by", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("professionals", sa.Column("admin_override_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("professionals", sa.Column("admin_override_reason", sa.String(500), nullable=True))

    op.add_column("professionals", sa.Column("is_flagged", sa.Boolean, nullable=False, server_default=sa.false()))
    op.add_column("professionals", sa.Column("fraud_notes", sa.String(2000), nullable=True))
    op.add_column("professionals", sa.Column("trust_score", sa.Integer, nullable=False, server_default="50"))

    op.add_column("professionals", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("professionals", sa.Column("deleted_by_user_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("professionals", sa.Column("deletion_type", deletion_type_enum, nullable=True))
    op.add_column("professionals", sa.Column("deletion_reason", sa.String(500), nullable=True))
    op.add_column("professionals", sa.Column("retention_until", sa.DateTime(timezone=True), nullable=True))

    op.add_column("professionals", sa.Column("snapshot_email", sa.String(255), nullable=True))
    op.add_column("professionals", sa.Column("snapshot_username", sa.String(50), nullable=True))
    op.add_column("professionals", sa.Column("snapshot_ip", sa.String(45), nullable=True))
    op.add_column("professionals", sa.Column("snapshot_user_agent", sa.String(500), nullable=True))

    op.add_column("professionals", sa.Column("embedding_stale", sa.Boolean, nullable=False, server_default=sa.false()))

    # ─── 3. FKs (added after columns exist) ──────────────────
    op.create_foreign_key(
        "fk_professionals_admin_override_by_users",
        "professionals", "users",
        ["admin_override_by"], ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_professionals_deleted_by_user_id_users",
        "professionals", "users",
        ["deleted_by_user_id"], ["id"],
        ondelete="SET NULL",
    )

    # ─── 4. Backfill existing rows ───────────────────────────
    op.execute("""
        UPDATE professionals
        SET status = CASE
            WHEN is_verified = TRUE THEN 'active'::professionalaccountstatus
            ELSE 'pending'::professionalaccountstatus
        END
    """)

    # Map the old free-form verification_status string → new enum
    op.execute("""
        UPDATE professionals
        SET verification_status = CASE
            WHEN verification_status IN ('not_started', 'pending', 'approved',
                                         'rejected', 'failed', 'manual_review',
                                         'manual_approved', 'manual_rejected', 'expired')
                THEN verification_status::verificationstatus
            ELSE 'not_started'::verificationstatus
        END
    """)

    op.execute("UPDATE professionals SET currency = 'XAF' WHERE currency IS NULL")
    op.execute("UPDATE professionals SET trust_score = 50 WHERE trust_score IS NULL")
    op.execute("UPDATE professionals SET profile_completeness = 0 WHERE profile_completeness IS NULL")

    # ─── 5. Indexes ──────────────────────────────────────────
    op.create_index("ix_professionals_status", "professionals", ["status"])
    op.create_index("ix_professionals_verification_status", "professionals", ["verification_status"])
    op.create_index("ix_professionals_is_flagged", "professionals", ["is_flagged"])
    op.create_index("ix_professionals_deleted_at", "professionals", ["deleted_at"])
    op.create_index(
        "ix_professionals_status_deleted",
        "professionals",
        ["status", "deleted_at"],
    )
    op.create_index(
        "ix_professionals_verification_deleted",
        "professionals",
        ["verification_status", "deleted_at"],
    )

    # ─── 6. professional_audit_logs ──────────────────────────
    op.create_table(
        "professional_audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "professional_id", postgresql.UUID(as_uuid=True),
            sa.ForeignKey("professionals.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "actor_user_id", postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("actor_role", sa.String(20), nullable=True),
        sa.Column("action", audit_action_enum, nullable=False),
        sa.Column("old_value", postgresql.JSONB, nullable=True),
        sa.Column("new_value", postgresql.JSONB, nullable=True),
        sa.Column("reason", sa.String(500), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("user_agent", sa.String(500), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True),
            nullable=False, server_default=sa.func.now(),
        ),
    )
    op.create_index(
        "ix_professional_audit_logs_professional_id",
        "professional_audit_logs", ["professional_id"],
    )
    op.create_index(
        "ix_professional_audit_logs_action",
        "professional_audit_logs", ["action"],
    )
    op.create_index(
        "ix_professional_audit_logs_created_at",
        "professional_audit_logs", ["created_at"],
    )


def downgrade() -> None:
    op.drop_table("professional_audit_logs")

    op.drop_index("ix_professionals_verification_deleted", table_name="professionals")
    op.drop_index("ix_professionals_status_deleted", table_name="professionals")
    op.drop_index("ix_professionals_deleted_at", table_name="professionals")
    op.drop_index("ix_professionals_is_flagged", table_name="professionals")
    op.drop_index("ix_professionals_verification_status", table_name="professionals")
    op.drop_index("ix_professionals_status", table_name="professionals")

    op.drop_constraint("fk_professionals_deleted_by_user_id_users", "professionals", type_="foreignkey")
    op.drop_constraint("fk_professionals_admin_override_by_users", "professionals", type_="foreignkey")

    for col in [
        "headline", "experience_level", "company_name", "job_title", "employment_type",
        "website_url", "linkedin_url", "portfolio_url", "facebook_url", "instagram_url", "twitter_url",
        "certifications", "education", "languages", "currency",
        "availability_notes", "response_time_hours",
        "status", "profile_completeness",
        "verification_attempts", "verification_last_attempt_at",
        "admin_override_status", "admin_override_by", "admin_override_at", "admin_override_reason",
        "is_flagged", "fraud_notes", "trust_score",
        "deleted_at", "deleted_by_user_id", "deletion_type", "deletion_reason", "retention_until",
        "snapshot_email", "snapshot_username", "snapshot_ip", "snapshot_user_agent",
        "embedding_stale",
    ]:
        op.drop_column("professionals", col)

    bind = op.get_bind()
    for name in [
        "auditaction", "deletiontype", "experiencelevel",
        "verificationstatus", "professionalaccountstatus",
    ]:
        op.execute(f"DROP TYPE IF EXISTS {name}")

