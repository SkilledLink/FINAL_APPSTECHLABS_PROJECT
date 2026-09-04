from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.job import JobPostCreate, JobPostResponse, JobPostUpdate
from app.services.job_service import (
    create_job_post,
    get_job_posts,
    get_job_post,
    update_job_post,
    delete_job_post,
    get_jobs_by_trade,
    get_urgent_jobs
)

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

@router.post("/", response_model=JobPostResponse, status_code=status.HTTP_201_CREATED)
def create_job(job_data: JobPostCreate, db: Session = Depends(get_db)):
    """Create a new job post"""
    return create_job_post(db, job_data)

@router.get("/", response_model=List[JobPostResponse])
def get_jobs(
    skip: int = 0,
    limit: int = 20,
    trade: Optional[str] = None,
    urgent: bool = False,
    db: Session = Depends(get_db)
):
    """Get all job posts"""
    if urgent:
        return get_urgent_jobs(db, limit)
    if trade:
        return get_jobs_by_trade(db, trade, limit)
    return get_job_posts(db, skip, limit)

@router.get("/{job_id}", response_model=JobPostResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Get a specific job post"""
    job = get_job_post(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.patch("/{job_id}", response_model=JobPostResponse)
def update_job(job_id: int, job_data: JobPostUpdate, db: Session = Depends(get_db)):
    """Update a job post"""
    job = update_job_post(db, job_id, job_data)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: int, db: Session = Depends(get_db)):
    """Delete a job post"""
    deleted = delete_job_post(db, job_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job deleted successfully"}