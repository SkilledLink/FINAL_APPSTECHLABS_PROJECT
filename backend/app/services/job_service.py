from sqlmodel import Session, select
from typing import List, Optional
from app.models.jobs import JobPost
from app.schemas.pycache.jobs import JobPostCreate, JobPostUpdate

# ============================================================
# JOB SERVICE
# ============================================================

def create_job_post(db: Session, job_data: JobPostCreate) -> JobPost:
    db_job = JobPost(
        title=job_data.title,
        client_type=job_data.client_type,
        client_name=job_data.client_name,
        location=job_data.location,
        trade=job_data.trade,
        custom_trade=job_data.custom_trade,
        description=job_data.description,
        budget=job_data.budget,
        urgency=job_data.urgency,
        contact_phone=job_data.contact_phone,
        contact_email=job_data.contact_email,
        images=job_data.images or [],
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def get_job_posts(db: Session, skip: int = 0, limit: int = 20) -> List[JobPost]:
    statement = select(JobPost).where(JobPost.is_active == True).order_by(JobPost.created_at.desc()).offset(skip).limit(limit)
    return db.exec(statement).all()

def get_job_post(db: Session, job_id: int) -> Optional[JobPost]:
    return db.get(JobPost, job_id)

def update_job_post(db: Session, job_id: int, job_data: JobPostUpdate) -> Optional[JobPost]:
    db_job = get_job_post(db, job_id)
    if not db_job:
        return None
    update_data = job_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_job, key, value)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def delete_job_post(db: Session, job_id: int) -> bool:
    db_job = get_job_post(db, job_id)
    if not db_job:
        return False
    db_job.is_active = False
    db.add(db_job)
    db.commit()
    return True

def get_jobs_by_trade(db: Session, trade: str, limit: int = 10) -> List[JobPost]:
    statement = select(JobPost).where(JobPost.trade == trade, JobPost.is_active == True).order_by(JobPost.created_at.desc()).limit(limit)
    return db.exec(statement).all()

def get_urgent_jobs(db: Session, limit: int = 10) -> List[JobPost]:
    statement = select(JobPost).where(JobPost.urgency == "today", JobPost.is_active == True).order_by(JobPost.created_at.desc()).limit(limit)
    return db.exec(statement).all()