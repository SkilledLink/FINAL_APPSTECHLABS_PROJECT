from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.schemas.jobs import JobPostCreate, JobPostResponse, JobPostUpdate
from app.schemas.job_interaction import (
    JobLikeToggleResponse, JobCommentCreate, JobCommentResponse,
    JobShareToggleResponse, JobApplicationCreate, JobApplicationResponse
)
from app.services.job_service import (
    create_job, get_jobs, get_job, update_job, delete_job,
    get_jobs_by_trade, get_urgent_jobs
)
from app.services.job_interaction_service import (
    toggle_job_like, get_job_likes_count,
    add_job_comment, get_job_comments,
    toggle_job_share, apply_to_job, get_job_applications
)

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

# ============================================================
# JOB CRUD (Already exists)
# ============================================================

@router.post("/", response_model=JobPostResponse, status_code=status.HTTP_201_CREATED)
def create_job_endpoint(job_data: JobPostCreate, db: Session = Depends(get_db)):
    return create_job(db, job_data)

@router.get("/", response_model=List[JobPostResponse])
def get_jobs_endpoint(
    skip: int = 0,
    limit: int = 20,
    trade: Optional[str] = None,
    urgent: bool = False,
    db: Session = Depends(get_db)
):
    if urgent:
        return get_urgent_jobs(db, limit)
    if trade:
        return get_jobs_by_trade(db, trade, limit)
    return get_jobs(db, skip, limit)

@router.get("/{job_id}", response_model=JobPostResponse)
def get_job_endpoint(job_id: int, db: Session = Depends(get_db)):
    job = get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

# ============================================================
# ✅ NEW: LIKE JOB
# ============================================================

@router.post("/{job_id}/like", response_model=JobLikeToggleResponse)
def toggle_job_like_endpoint(job_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    """Like or unlike a job"""
    job = get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    liked, total_likes = toggle_job_like(db, job_id, user_id)
    return {
        "liked": liked,
        "likes_count": total_likes,
        "message": "Liked" if liked else "Unliked"
    }

@router.get("/{job_id}/likes/count")
def get_job_likes_count_endpoint(job_id: int, db: Session = Depends(get_db)):
    """Get total likes for a job"""
    return {"likes_count": get_job_likes_count(db, job_id)}

# ============================================================
# ✅ NEW: COMMENT ON JOB
# ============================================================

@router.post("/{job_id}/comments", response_model=JobCommentResponse, status_code=status.HTTP_201_CREATED)
def add_job_comment_endpoint(
    job_id: int,
    comment_data: JobCommentCreate,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """Add a comment to a job"""
    job = get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return add_job_comment(db, job_id, comment_data, user_id)

@router.get("/{job_id}/comments", response_model=List[JobCommentResponse])
def get_job_comments_endpoint(job_id: int, db: Session = Depends(get_db)):
    """Get all comments for a job"""
    return get_job_comments(db, job_id)

# ============================================================
# ✅ NEW: SHARE JOB
# ============================================================

@router.post("/{job_id}/share", response_model=JobShareToggleResponse)
def toggle_job_share_endpoint(job_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    """Share or unshare a job"""
    job = get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    shared, total_shares = toggle_job_share(db, job_id, user_id)
    return {
        "shared": shared,
        "shares_count": total_shares,
        "message": "Shared" if shared else "Unshared"
    }

# ============================================================
# ✅ NEW: APPLY TO JOB
# ============================================================

@router.post("/{job_id}/apply", response_model=JobApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_to_job_endpoint(
    job_id: int,
    application_data: JobApplicationCreate,
    db: Session = Depends(get_db)
):
    """Apply to a job"""
    job = get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return apply_to_job(db, job_id, application_data)

@router.get("/{job_id}/applications", response_model=List[JobApplicationResponse])
def get_job_applications_endpoint(job_id: int, db: Session = Depends(get_db)):
    """Get all applications for a job"""
    return get_job_applications(db, job_id)