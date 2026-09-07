from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.schemas.jobs import JobPostCreate, JobPostResponse, JobPostUpdate
from app.services.job_service import (
    create_job,
    get_jobs,
    get_job,
    update_job,
    delete_job,
    get_jobs_by_trade,
    get_urgent_jobs
)

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

@router.post("/", response_model=JobPostResponse, status_code=status.HTTP_201_CREATED)
def create_job_endpoint(job_data: JobPostCreate, db: Session = Depends(get_db)):
    """Create a new job"""
    return create_job(db, job_data)

@router.get("/", response_model=List[JobPostResponse])
def get_jobs_endpoint(
    skip: int = 0,
    limit: int = 20,
    trade: Optional[str] = None,
    urgent: bool = False,
    db: Session = Depends(get_db)
):
    """Get all jobs"""
    if urgent:
        return get_urgent_jobs(db, limit)
    if trade:
        return get_jobs_by_trade(db, trade, limit)
    return get_jobs(db, skip, limit)

@router.get("/{job_id}", response_model=JobPostResponse)
def get_job_endpoint(job_id: int, db: Session = Depends(get_db)):
    """Get a specific job"""
    job = get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.patch("/{job_id}", response_model=JobPostResponse)
def update_job_endpoint(job_id: int, job_data: JobPostUpdate, db: Session = Depends(get_db)):
    """Update a job"""
    job = update_job(db, job_id, job_data)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_endpoint(job_id: int, db: Session = Depends(get_db)):
    """Delete a job"""
    deleted = delete_job(db, job_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job deleted successfully"}