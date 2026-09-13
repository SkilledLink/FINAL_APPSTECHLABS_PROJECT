from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, status
from sqlmodel import Session

from app.database.session import get_session
from app.dependencies.permissions import has_capability
from app.enums.admin import Capability
from app.models.user import User
from app.schemas.job import JobListResponse, JobResponse
from app.services.admin_service import AdminService
from app.services.job_service import JobService

router = APIRouter(
    prefix="/moderator/jobs",
    tags=["moderator-jobs"],
    dependencies=[Depends(has_capability(Capability.MANAGE_JOBS))],
)


@router.get("", response_model=JobListResponse)
def list_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    user_id: Optional[UUID] = Query(None),
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.MANAGE_JOBS)),
):
    return JobService(session).list_jobs(
        current_user,
        skip=skip,
        limit=limit,
        user_id=user_id,
        search=search,
    )


@router.delete(
    "/comments/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_job_comment(
    comment_id: UUID,
    reason: str = Query(..., min_length=5, max_length=500),
    request: Request = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.MANAGE_COMMENTS)),
):
    AdminService(session).moderator_delete_job_comment(
        actor=current_user,
        comment_id=comment_id,
        reason=reason,
        request=request,
    )


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.MANAGE_JOBS)),
):
    return JobService(session).get_job(job_id, current_user)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: UUID,
    reason: str = Query(..., min_length=5, max_length=500),
    request: Request = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.MANAGE_JOBS)),
):
    AdminService(session).moderator_delete_job(
        actor=current_user,
        job_id=job_id,
        reason=reason,
        hard=False,
        request=request,
    )