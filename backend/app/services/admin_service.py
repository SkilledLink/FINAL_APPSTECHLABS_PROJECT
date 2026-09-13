import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, Request
from sqlalchemy import or_
from sqlmodel import Session, func, select

from app.enums.professional import ProfessionalAccountStatus
from app.enums.user import AccountStatus
from app.models.feed import Feed, FeedComment
from app.models.job import Job, JobComment
from app.models.professional import Professional
from app.models.user import User
from app.schemas.admin import AdminDashboardResponse
from app.services.audit_service import AuditService

logger = logging.getLogger(__name__)


class AdminService:
    def __init__(self, session: Session):
        self.session = session
        self.audit = AuditService(session)

    # ─── Users ───────────────────────────────────────────────

    def list_users(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        include_deleted: bool = False,
        status_filter: Optional[AccountStatus] = None,
    ) -> tuple[list[User], int]:
        conditions = []
        if not include_deleted:
            conditions.append(User.deleted_at.is_(None))
        if status_filter is not None:
            conditions.append(User.status == status_filter)
        if search:
            term = f"%{search}%"
            conditions.append(
                or_(
                    User.email.ilike(term),
                    User.first_name.ilike(term),
                    User.last_name.ilike(term),
                    User.username.ilike(term),
                )
            )

        count_stmt = select(func.count()).select_from(User)
        list_stmt = select(User)
        if conditions:
            count_stmt = count_stmt.where(*conditions)
            list_stmt = list_stmt.where(*conditions)

        total = self.session.exec(count_stmt).first() or 0
        items = self.session.exec(
            list_stmt.order_by(User.created_at.desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return list(items), total

    def get_user(self, user_id: UUID, include_deleted: bool = False) -> User:
        stmt = select(User).where(User.id == user_id)
        if not include_deleted:
            stmt = stmt.where(User.deleted_at.is_(None))
        user = self.session.exec(stmt).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    def suspend_user(
        self,
        actor: User,
        user_id: UUID,
        reason: str,
        request: Optional[Request] = None,
    ) -> User:
        user = self.get_user(user_id)
        if user.status == AccountStatus.SUSPENDED:
            raise HTTPException(status_code=400, detail="User already suspended")
        old_status = user.status
        user.status = AccountStatus.SUSPENDED
        user.updated_at = datetime.now(timezone.utc)
        self.session.add(user)
        self.audit.log(
            actor=actor,
            action="user.suspended",
            entity_type="user",
            entity_id=user.id,
            old_value={"status": old_status.value},
            new_value={"status": AccountStatus.SUSPENDED.value},
            reason=reason,
            request=request,
        )
        self.session.commit()
        self.session.refresh(user)
        return user

    def reactivate_user(
        self,
        actor: User,
        user_id: UUID,
        reason: str,
        request: Optional[Request] = None,
    ) -> User:
        user = self.get_user(user_id)
        if user.status == AccountStatus.ACTIVE:
            raise HTTPException(status_code=400, detail="User already active")
        old_status = user.status
        user.status = AccountStatus.ACTIVE
        user.updated_at = datetime.now(timezone.utc)
        self.session.add(user)
        self.audit.log(
            actor=actor,
            action="user.reactivated",
            entity_type="user",
            entity_id=user.id,
            old_value={"status": old_status.value},
            new_value={"status": AccountStatus.ACTIVE.value},
            reason=reason,
            request=request,
        )
        self.session.commit()
        self.session.refresh(user)
        return user

    def soft_delete_user(
        self,
        actor: User,
        user_id: UUID,
        reason: str,
        request: Optional[Request] = None,
    ) -> User:
        user = self.get_user(user_id)
        if user.deleted_at is not None:
            raise HTTPException(status_code=400, detail="User already deleted")
        if user.id == actor.id:
            raise HTTPException(
                status_code=400, detail="Cannot delete your own account"
            )
        user.deleted_at = datetime.now(timezone.utc)
        user.updated_at = datetime.now(timezone.utc)
        self.session.add(user)
        self.audit.log(
            actor=actor,
            action="user.deleted",
            entity_type="user",
            entity_id=user.id,
            new_value={"deleted_at": str(user.deleted_at)},
            reason=reason,
            request=request,
        )
        self.session.commit()
        self.session.refresh(user)
        return user

    def update_user_role(
        self,
        actor: User,
        user_id: UUID,
        is_admin: Optional[bool],
        is_moderator: Optional[bool],
        reason: str,
        request: Optional[Request] = None,
    ) -> User:
        user = self.get_user(user_id, include_deleted=True)

        # Rule: cannot demote the last remaining admin (including self)
        if is_admin is False:
            admin_count = self.session.exec(
                select(func.count())
                .select_from(User)
                .where(User.is_admin.is_(True), User.deleted_at.is_(None))
            ).first() or 0
            if admin_count <= 1:
                raise HTTPException(
                    status_code=400,
                    detail="Cannot demote the last remaining administrator",
                )

        old_snapshot = {
            "is_admin": user.is_admin,
            "is_moderator": user.is_moderator,
        }
        new_snapshot = dict(old_snapshot)
        changed = False
        if is_admin is not None and is_admin != user.is_admin:
            user.is_admin = is_admin
            new_snapshot["is_admin"] = is_admin
            changed = True
        if is_moderator is not None and is_moderator != user.is_moderator:
            user.is_moderator = is_moderator
            new_snapshot["is_moderator"] = is_moderator
            changed = True

        if not changed:
            raise HTTPException(status_code=400, detail="No role change requested")

        user.updated_at = datetime.now(timezone.utc)
        self.session.add(user)

        if old_snapshot["is_admin"] != new_snapshot["is_admin"]:
            action = (
                "admin.promoted" if new_snapshot["is_admin"] else "admin.demoted"
            )
        else:
            action = (
                "moderator.promoted"
                if new_snapshot["is_moderator"]
                else "moderator.demoted"
            )

        self.audit.log(
            actor=actor,
            action=action,
            entity_type="user",
            entity_id=user.id,
            old_value=old_snapshot,
            new_value=new_snapshot,
            reason=reason,
            request=request,
        )
        self.session.commit()
        self.session.refresh(user)
        return user

    def list_by_role(
        self,
        is_admin: bool,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[User], int]:
        if is_admin:
            conditions = [
                User.is_admin.is_(True),
                User.deleted_at.is_(None),
            ]
        else:
            conditions = [
                User.is_moderator.is_(True),
                User.is_admin.is_(False),
                User.deleted_at.is_(None),
            ]

        total = self.session.exec(
            select(func.count()).select_from(User).where(*conditions)
        ).first() or 0
        items = self.session.exec(
            select(User)
            .where(*conditions)
            .order_by(User.created_at.desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return list(items), total

    # ─── Content moderation ──────────────────────────────────

    def moderator_delete_feed(
        self,
        actor: User,
        feed_id: UUID,
        reason: str,
        hard: bool = False,
        request: Optional[Request] = None,
    ) -> None:
        feed = self.session.get(Feed, feed_id)
        if not feed:
            raise HTTPException(status_code=404, detail="Feed not found")
        if hard and not actor.is_admin:
            raise HTTPException(
                status_code=403, detail="Hard delete requires admin privileges"
            )
        old_deleted = feed.deleted_at

        if hard:
            self.session.delete(feed)
        else:
            feed.deleted_at = datetime.now(timezone.utc)
            self.session.add(feed)

        self.audit.log(
            actor=actor,
            action="feed.hard_deleted" if hard else "feed.deleted",
            entity_type="feed",
            entity_id=feed_id,
            old_value={"deleted_at": str(old_deleted) if old_deleted else None},
            new_value=(
                None
                if hard
                else {"deleted_at": str(feed.deleted_at)}
            ),
            reason=reason,
            request=request,
        )
        self.session.commit()

    def moderator_delete_feed_comment(
        self,
        actor: User,
        comment_id: UUID,
        reason: str,
        request: Optional[Request] = None,
    ) -> None:
        comment = self.session.get(FeedComment, comment_id)
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        old_content = comment.content
        feed_id = comment.feed_id
        self.session.delete(comment)
        self.audit.log(
            actor=actor,
            action="feed_comment.deleted",
            entity_type="feed_comment",
            entity_id=comment_id,
            old_value={"content": old_content, "feed_id": str(feed_id)},
            reason=reason,
            request=request,
        )
        self.session.commit()

    def moderator_delete_job(
        self,
        actor: User,
        job_id: UUID,
        reason: str,
        hard: bool = False,
        request: Optional[Request] = None,
    ) -> None:
        job = self.session.get(Job, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        if hard and not actor.is_admin:
            raise HTTPException(
                status_code=403, detail="Hard delete requires admin privileges"
            )
        old_deleted = job.deleted_at

        if hard:
            self.session.delete(job)
        else:
            job.deleted_at = datetime.now(timezone.utc)
            self.session.add(job)

        self.audit.log(
            actor=actor,
            action="job.hard_deleted" if hard else "job.deleted",
            entity_type="job",
            entity_id=job_id,
            old_value={"deleted_at": str(old_deleted) if old_deleted else None},
            new_value=(
                None
                if hard
                else {"deleted_at": str(job.deleted_at)}
            ),
            reason=reason,
            request=request,
        )
        self.session.commit()

    def moderator_delete_job_comment(
        self,
        actor: User,
        comment_id: UUID,
        reason: str,
        request: Optional[Request] = None,
    ) -> None:
        comment = self.session.get(JobComment, comment_id)
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        old_content = comment.content
        job_id = comment.job_id
        self.session.delete(comment)
        self.audit.log(
            actor=actor,
            action="job_comment.deleted",
            entity_type="job_comment",
            entity_id=comment_id,
            old_value={"content": old_content, "job_id": str(job_id)},
            reason=reason,
            request=request,
        )
        self.session.commit()

    # ─── Dashboard ───────────────────────────────────────────

    def dashboard(self) -> AdminDashboardResponse:
        def count(model, *conditions):
            stmt = select(func.count()).select_from(model)
            if conditions:
                stmt = stmt.where(*conditions)
            return self.session.exec(stmt).first() or 0

        return AdminDashboardResponse(
            total_users=count(User, User.deleted_at.is_(None)),
            active_users=count(
                User,
                User.deleted_at.is_(None),
                User.status == AccountStatus.ACTIVE,
            ),
            suspended_users=count(
                User,
                User.deleted_at.is_(None),
                User.status == AccountStatus.SUSPENDED,
            ),
            total_professionals=count(
                Professional, Professional.deleted_at.is_(None)
            ),
            verified_professionals=count(
                Professional,
                Professional.deleted_at.is_(None),
                Professional.is_verified.is_(True),
            ),
            pending_professionals=count(
                Professional,
                Professional.deleted_at.is_(None),
                Professional.status == ProfessionalAccountStatus.PENDING,
            ),
            total_feeds=count(Feed, Feed.deleted_at.is_(None)),
            total_jobs=count(Job, Job.deleted_at.is_(None)),
            total_admins=count(
                User, User.deleted_at.is_(None), User.is_admin.is_(True)
            ),
            total_moderators=count(
                User,
                User.deleted_at.is_(None),
                User.is_moderator.is_(True),
                User.is_admin.is_(False),
            ),
            generated_at=datetime.now(timezone.utc),
        )