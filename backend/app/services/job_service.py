import logging
from typing import Optional, List, Tuple
from uuid import UUID, uuid4

from fastapi import HTTPException, UploadFile
from sqlmodel import Session

from app.models.user import User
from app.models.job import Job, JobImage, JobComment
from app.repositories.job_repository import JobRepository
from app.schemas.job import (
    JobResponse, JobCreate, JobUpdate, JobListResponse,
    JobImageResponse, JobLikeResponse,
    JobCommentCreate, JobCommentResponse
)
from app.schemas.user import UserResponse
from app.services.notification_service import NotificationService
from app.services.storage_service import StorageService

logger = logging.getLogger(__name__)


class JobService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = JobRepository(session)
        self.storage = StorageService()

    # ---------- Job CRUD ----------
    def create_job(self, user: User, data: JobCreate, files: List[UploadFile]) -> JobResponse:
        if len(files) > 5:
            raise HTTPException(400, "Maximum 5 images per job")

        try:
            job = self.repo.create(user, data.model_dump(exclude_unset=True))

            if files:
                existing_count = self.repo.count_images(job)
                for i, file in enumerate(files):
                    public_id = f"img_{uuid4()}"
                    url = self.storage.upload_image(
                        file,
                        folder=f"jobs/{job.id}",
                        public_id=public_id
                    )
                    self.repo.add_image(job, url, order=existing_count + i)

            response = self._build_job_response(job, user)

            self.session.commit()

            return response

        except Exception as e:
            self.session.rollback()
            logger.error(f"Job creation failed: {e}")
            raise

    def get_job(self, job_id: UUID, current_user: User) -> JobResponse:
        job = self.repo.get_by_id(job_id)
        if not job or job.deleted_at:
            raise HTTPException(404, "Job not found")
        return self._build_job_response(job, current_user)

    def list_jobs(
        self,
        current_user: User,
        skip: int = 0,
        limit: int = 20,
        user_id: Optional[UUID] = None,
        search: Optional[str] = None,
    ) -> JobListResponse:
        jobs, total = self.repo.list(skip, limit, user_id=user_id, search=search)
        items = [
            self._build_job_response(job, current_user, with_details=False)
            for job in jobs
        ]
        return JobListResponse(
            items=items,
            total=total,
            page=skip // limit + 1 if limit else 1,
            size=limit
        )

    def update_job(self, job_id: UUID, data: JobUpdate, current_user: User) -> Job:
        job = self.repo.get_by_id(job_id)
        if not job or job.deleted_at:
            raise HTTPException(404, "Job not found")
        if job.user_id != current_user.id and not current_user.is_admin:
            raise HTTPException(403, "Not enough permissions")

        update_data = data.model_dump(exclude_unset=True)
        try:
            updated = self.repo.update(job, update_data)
            self.session.commit()
            return updated
        except Exception as e:
            self.session.rollback()
            raise

    def delete_job(self, job_id: UUID, current_user: User, hard: bool = False) -> None:
        job = self.repo.get_by_id(job_id)
        if not job or job.deleted_at:
            raise HTTPException(404, "Job not found")
        if job.user_id != current_user.id and not current_user.is_admin:
            raise HTTPException(403, "Not enough permissions")
        try:
            self.repo.delete(job, hard=hard)
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            raise

    # ---------- Images ----------
    def upload_job_images(
        self,
        job_id: UUID,
        files: List[UploadFile],
        current_user: User
    ) -> List[JobImageResponse]:
        job = self.repo.get_by_id(job_id)
        if not job or job.deleted_at:
            raise HTTPException(404, "Job not found")
        if job.user_id != current_user.id and not current_user.is_admin:
            raise HTTPException(403, "Not enough permissions")

        if len(files) > 5:
            raise HTTPException(400, "Maximum 5 images per job")

        try:
            existing_count = self.repo.count_images(job)
            uploaded = []
            for i, file in enumerate(files):
                public_id = f"img_{uuid4()}"
                url = self.storage.upload_image(
                    file,
                    folder=f"jobs/{job_id}",
                    public_id=public_id
                )
                img = self.repo.add_image(job, url, order=existing_count + i)
                uploaded.append(JobImageResponse.model_validate(img))
            self.session.commit()
            return uploaded
        except Exception as e:
            self.session.rollback()
            raise

    def delete_job_image(self, image_id: UUID, current_user: User) -> None:
        try:
            image = self.session.get(JobImage, image_id)
            if not image:
                raise HTTPException(404, "Image not found")
            job = self.repo.get_by_id(image.job_id)
            if not job or job.deleted_at:
                raise HTTPException(404, "Job not found")
            if job.user_id != current_user.id and not current_user.is_admin:
                raise HTTPException(403, "Not enough permissions")
            self.repo.delete_image(image_id)
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            raise

    # ---------- Likes ----------
    def toggle_like(self, job_id: UUID, current_user: User) -> JobLikeResponse:
        job = self.repo.get_by_id(job_id)
        if not job or job.deleted_at:
            raise HTTPException(404, "Job not found")
        try:
            liked = self.repo.toggle_like(current_user, job)
            self.session.commit()

            if job.user_id != current_user.id:
                try:
                    display = NotificationService.display_name(current_user)
                    service = NotificationService(self.session)
                    if liked:
                        service.notify_like(
                            recipient_id=job.user_id,
                            actor_id=current_user.id,
                            actor_display=display,
                            target_type="job",
                            target_id=job.id,
                            target_label="job",
                        )
                    else:
                        service.notify_unlike(
                            recipient_id=job.user_id,
                            actor_id=current_user.id,
                            target_type="job",
                            target_id=job.id,
                            target_label="job",
                        )
                except Exception:
                    logger.exception("Job like notification failed")

            return JobLikeResponse(job_id=job_id, liked=liked)
        except Exception as e:
            self.session.rollback()
            raise

    # ---------- Comments ----------
    def create_comment(
        self,
        job_id: UUID,
        data: JobCommentCreate,
        current_user: User
    ) -> JobCommentResponse:
        job = self.repo.get_by_id(job_id)
        if not job or job.deleted_at:
            raise HTTPException(404, "Job not found")
        if data.parent_id:
            parent = self.session.get(JobComment, data.parent_id)
            if not parent or parent.job_id != job_id:
                raise HTTPException(400, "Invalid parent comment")
        try:
            comment = self.repo.create_comment(
                current_user,
                job,
                data.content,
                data.parent_id
            )
            self.session.commit()

            try:
                display = NotificationService.display_name(current_user)
                service = NotificationService(self.session)
                if data.parent_id:
                    parent = self.session.get(JobComment, data.parent_id)
                    if parent and parent.user_id != current_user.id:
                        service.notify_reply(
                            recipient_id=parent.user_id,
                            actor_id=current_user.id,
                            actor_display=display,
                            target_type="job",
                            target_id=job.id,
                            comment_id=comment.id,
                            parent_comment_id=parent.id,
                        )
                else:
                    if job.user_id != current_user.id:
                        service.notify_comment(
                            recipient_id=job.user_id,
                            actor_id=current_user.id,
                            actor_display=display,
                            target_type="job",
                            target_id=job.id,
                            comment_id=comment.id,
                            target_label="job",
                        )
            except Exception:
                logger.exception("Job comment notification failed")

            return JobCommentResponse.model_validate(comment)
        except Exception as e:
            self.session.rollback()
            raise

    def delete_comment(self, comment_id: UUID, current_user: User) -> None:
        try:
            deleted = self.repo.delete_comment(
                comment_id,
                current_user,
                current_user.is_admin
            )
            if not deleted:
                raise HTTPException(404, "Comment not found or you lack permissions")
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            raise

    # ---------- Helper ----------
    def _build_job_response(
        self,
        job: Job,
        current_user: User,
        with_details: bool = True
    ) -> JobResponse:
        likes_count = self.repo.get_like_count(job)
        comments_count = self.repo.get_comment_count(job)
        is_liked = self.repo.is_liked_by_user(current_user, job)

        images = [JobImageResponse.model_validate(img) for img in self.repo.get_images(job)]

        comments = []
        if with_details:
            comments = [
                JobCommentResponse.model_validate(c)
                for c in self.repo.get_comments(job)
            ]

        response = JobResponse.model_validate(job)
        response.likes_count = likes_count
        response.comments_count = comments_count
        response.is_liked = is_liked
        response.images = images
        if with_details:
            response.comments = comments
            if job.user:
                response.user = UserResponse.model_validate(job.user)
        return response