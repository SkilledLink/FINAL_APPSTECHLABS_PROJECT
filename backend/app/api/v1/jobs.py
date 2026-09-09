from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlmodel import Session

from app.dependencies.current_user import get_current_user, get_current_active_user
from app.database.session import get_session
from app.models.user import User
from app.schemas.job import (
    JobResponse,
    JobCreate,
    JobUpdate,
    JobListResponse,
    JobImageResponse,
    JobLikeResponse,
    JobCommentCreate,
    JobCommentResponse,
)
from app.services.job_service import JobService

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    title: str = Form(..., max_length=200),
    description: str = Form(...),
    status: str = Form("published"),
    files: List[UploadFile] = File(default=[]),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """Create a new job with optional images."""
    job_data = JobCreate(title=title, description=description, status=status)
    service = JobService(session)
    return service.create_job(current_user, job_data, files)


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = JobService(session)
    return service.get_job(job_id, current_user)


@router.get("", response_model=JobListResponse)
def list_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user_id: Optional[UUID] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = JobService(session)
    return service.list_jobs(current_user, skip, limit, user_id, search)


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: UUID,
    data: JobUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = JobService(session)
    return service.update_job(job_id, data, current_user)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = JobService(session)
    service.delete_job(job_id, current_user, hard=False)


@router.post("/{job_id}/images", response_model=List[JobImageResponse])
def upload_job_images(
    job_id: UUID,
    files: List[UploadFile] = File(..., description="Up to 5 images"),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    if len(files) > 5:
        raise HTTPException(400, "Maximum 5 images per request")
    service = JobService(session)
    return service.upload_job_images(job_id, files, current_user)


@router.delete("/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_image(
    image_id: UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = JobService(session)
    service.delete_job_image(image_id, current_user)


@router.post("/{job_id}/like", response_model=JobLikeResponse)
def toggle_like(
    job_id: UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = JobService(session)
    return service.toggle_like(job_id, current_user)


@router.post("/{job_id}/comments", response_model=JobCommentResponse)
def create_comment(
    job_id: UUID,
    data: JobCommentCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = JobService(session)
    return service.create_comment(job_id, data, current_user)


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = JobService(session)
    service.delete_comment(comment_id, current_user)