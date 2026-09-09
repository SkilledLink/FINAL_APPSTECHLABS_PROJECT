from sqlmodel import Session, select
from typing import List, Optional
from app.models.job_interaction import JobLike, JobComment, JobShare, JobApplication
from app.schemas.job_interaction import JobCommentCreate, JobApplicationCreate

# ============================================================
# LIKES
# ============================================================

def toggle_job_like(db: Session, job_id: int, user_id: int) -> tuple[bool, int]:
    """Toggle like on a job. Returns (is_liked, total_likes)"""
    existing = db.exec(
        select(JobLike).where(JobLike.job_id == job_id, JobLike.user_id == user_id)
    ).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        liked = False
    else:
        like = JobLike(job_id=job_id, user_id=user_id)
        db.add(like)
        db.commit()
        liked = True
    
    total = db.exec(select(JobLike).where(JobLike.job_id == job_id)).all()
    return liked, len(total)

def get_job_likes_count(db: Session, job_id: int) -> int:
    return len(db.exec(select(JobLike).where(JobLike.job_id == job_id)).all())

# ============================================================
# COMMENTS
# ============================================================

def add_job_comment(db: Session, job_id: int, comment_data: JobCommentCreate, user_id: int) -> JobComment:
    comment = JobComment(
        job_id=job_id,
        user_id=user_id,
        user_name=comment_data.user_name,
        content=comment_data.content
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

def get_job_comments(db: Session, job_id: int) -> List[JobComment]:
    return db.exec(
        select(JobComment).where(JobComment.job_id == job_id).order_by(JobComment.created_at.desc())
    ).all()

# ============================================================
# SHARES
# ============================================================

def toggle_job_share(db: Session, job_id: int, user_id: int) -> tuple[bool, int]:
    """Toggle share on a job. Returns (is_shared, total_shares)"""
    existing = db.exec(
        select(JobShare).where(JobShare.job_id == job_id, JobShare.user_id == user_id)
    ).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        shared = False
    else:
        share = JobShare(job_id=job_id, user_id=user_id)
        db.add(share)
        db.commit()
        shared = True
    
    total = db.exec(select(JobShare).where(JobShare.job_id == job_id)).all()
    return shared, len(total)

# ============================================================
# APPLICATIONS
# ============================================================

def apply_to_job(db: Session, job_id: int, application_data: JobApplicationCreate) -> JobApplication:
    application = JobApplication(
        job_id=job_id,
        professional_id=application_data.professional_id,
        professional_name=application_data.professional_name,
        message=application_data.message
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application

def get_job_applications(db: Session, job_id: int) -> List[JobApplication]:
    return db.exec(
        select(JobApplication).where(JobApplication.job_id == job_id)
    ).all()

def update_application_status(db: Session, application_id: int, status: str) -> Optional[JobApplication]:
    application = db.get(JobApplication, application_id)
    if not application:
        return None
    application.status = status
    db.commit()
    db.refresh(application)
    return application