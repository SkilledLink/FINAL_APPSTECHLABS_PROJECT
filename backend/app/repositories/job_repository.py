from datetime import datetime, timezone
from typing import Optional, Tuple, List
from uuid import UUID

from sqlmodel import Session, select, func
from sqlalchemy.orm import selectinload

from app.models.job import Job, JobImage, JobLike, JobComment
from app.models.user import User


class JobRepository:
    def __init__(self, session: Session):
        self.session = session

    # ---------- Job ----------
    def create(self, user: User, data: dict) -> Job:
        job = Job(user_id=user.id, **data)
        self.session.add(job)
        self.session.flush()  # get ID
        return job

    def get_by_id(self, job_id: UUID, include_deleted: bool = False) -> Optional[Job]:
        stmt = (
            select(Job)
            .where(Job.id == job_id)
            .options(
                selectinload(Job.user),
                selectinload(Job.images),
                selectinload(Job.comments).selectinload(JobComment.user),
                selectinload(Job.comments).selectinload(JobComment.replies),
            )
        )
        if not include_deleted:
            stmt = stmt.where(Job.deleted_at.is_(None))
        return self.session.exec(stmt).first()

    def list(
        self,
        skip: int = 0,
        limit: int = 20,
        include_deleted: bool = False,
        user_id: Optional[UUID] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[Job], int]:
        stmt = (
            select(Job)
            .options(
                selectinload(Job.user),
                selectinload(Job.images),
                selectinload(Job.comments).selectinload(JobComment.user),
                selectinload(Job.comments).selectinload(JobComment.replies),
            )
        )
        if not include_deleted:
            stmt = stmt.where(Job.deleted_at.is_(None))
        if user_id:
            stmt = stmt.where(Job.user_id == user_id)
        if search:
            stmt = stmt.where(
                Job.title.contains(search) | Job.description.contains(search)
            )

        count_stmt = select(func.count()).select_from(Job)
        if not include_deleted:
            count_stmt = count_stmt.where(Job.deleted_at.is_(None))
        if user_id:
            count_stmt = count_stmt.where(Job.user_id == user_id)
        if search:
            count_stmt = count_stmt.where(
                Job.title.contains(search) | Job.description.contains(search)
            )
        total = self.session.exec(count_stmt).first() or 0

        stmt = stmt.offset(skip).limit(limit).order_by(Job.created_at.desc())
        jobs = self.session.exec(stmt).all()
        return jobs, total

    def update(self, job: Job, data: dict) -> Job:
        for key, value in data.items():
            setattr(job, key, value)
        job.updated_at = datetime.now(timezone.utc)
        self.session.add(job)
        self.session.flush()
        return job

    def delete(self, job: Job, hard: bool = False) -> None:
        if hard:
            self.session.delete(job)
        else:
            job.deleted_at = datetime.now(timezone.utc)
            self.session.add(job)
        self.session.flush()

    # ---------- Images ----------
    def add_image(self, job: Job, image_url: str, order: int = 0) -> JobImage:
        img = JobImage(job_id=job.id, image_url=image_url, order=order)
        self.session.add(img)
        self.session.flush()
        return img

    def get_images(self, job: Job) -> List[JobImage]:
        stmt = select(JobImage).where(JobImage.job_id == job.id).order_by(JobImage.order)
        return self.session.exec(stmt).all()

    def delete_image(self, image_id: UUID) -> None:
        img = self.session.get(JobImage, image_id)
        if img:
            self.session.delete(img)
            self.session.flush()

    def count_images(self, job: Job) -> int:
        stmt = select(func.count()).where(JobImage.job_id == job.id)
        return self.session.exec(stmt).first() or 0

    # ---------- Likes ----------
    def toggle_like(self, user: User, job: Job) -> bool:
        existing = self.session.exec(
            select(JobLike).where(
                JobLike.user_id == user.id,
                JobLike.job_id == job.id
            )
        ).first()
        if existing:
            self.session.delete(existing)
            self.session.flush()
            return False
        else:
            like = JobLike(user_id=user.id, job_id=job.id)
            self.session.add(like)
            self.session.flush()
            return True

    def get_like_count(self, job: Job) -> int:
        stmt = select(func.count()).where(JobLike.job_id == job.id)
        return self.session.exec(stmt).first() or 0

    def is_liked_by_user(self, user: User, job: Job) -> bool:
        stmt = select(JobLike).where(
            JobLike.user_id == user.id,
            JobLike.job_id == job.id
        )
        return self.session.exec(stmt).first() is not None

    # ---------- Comments ----------
    def create_comment(
        self,
        user: User,
        job: Job,
        content: str,
        parent_id: Optional[UUID] = None
    ) -> JobComment:
        comment = JobComment(
            job_id=job.id,
            user_id=user.id,
            content=content,
            parent_id=parent_id
        )
        self.session.add(comment)
        self.session.flush()
        return comment

    def get_comments(self, job: Job) -> List[JobComment]:
        stmt = (
            select(JobComment)
            .where(
                JobComment.job_id == job.id,
                JobComment.parent_id.is_(None),
            )
            .options(
                selectinload(JobComment.user),
                selectinload(JobComment.replies),
            )
            .order_by(JobComment.created_at)
        )
        return self.session.exec(stmt).all()

    def get_comment_count(self, job: Job) -> int:
        stmt = select(func.count()).where(JobComment.job_id == job.id)
        return self.session.exec(stmt).first() or 0

    def delete_comment(self, comment_id: UUID, user: User, is_admin: bool = False) -> bool:
        comment = self.session.get(JobComment, comment_id)
        if not comment:
            return False
        if comment.user_id != user.id and not is_admin:
            return False
        self.session.delete(comment)
        self.session.flush()
        return True