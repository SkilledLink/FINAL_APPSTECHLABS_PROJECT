from sqlmodel import Session, select
from typing import List, Optional
from app.models.project_interaction import ProjectLike, ProjectComment, ProjectShare
from app.schemas.project_interaction import ProjectCommentCreate

# ============================================================
# LIKES
# ============================================================

def toggle_project_like(db: Session, project_id: int, user_id: int) -> tuple[bool, int]:
    """Toggle like on a project. Returns (is_liked, total_likes)"""
    existing = db.exec(
        select(ProjectLike).where(ProjectLike.project_id == project_id, ProjectLike.user_id == user_id)
    ).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        liked = False
    else:
        like = ProjectLike(project_id=project_id, user_id=user_id)
        db.add(like)
        db.commit()
        liked = True
    
    total = db.exec(select(ProjectLike).where(ProjectLike.project_id == project_id)).all()
    return liked, len(total)

def get_project_likes_count(db: Session, project_id: int) -> int:
    return len(db.exec(select(ProjectLike).where(ProjectLike.project_id == project_id)).all())

# ============================================================
# COMMENTS
# ============================================================

def add_project_comment(db: Session, project_id: int, comment_data: ProjectCommentCreate, user_id: int) -> ProjectComment:
    comment = ProjectComment(
        project_id=project_id,
        user_id=user_id,
        user_name=comment_data.user_name,
        content=comment_data.content
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

def get_project_comments(db: Session, project_id: int) -> List[ProjectComment]:
    return db.exec(
        select(ProjectComment).where(ProjectComment.project_id == project_id).order_by(ProjectComment.created_at.desc())
    ).all()

# ============================================================
# SHARES
# ============================================================

def toggle_project_share(db: Session, project_id: int, user_id: int) -> tuple[bool, int]:
    """Toggle share on a project. Returns (is_shared, total_shares)"""
    existing = db.exec(
        select(ProjectShare).where(ProjectShare.project_id == project_id, ProjectShare.user_id == user_id)
    ).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        shared = False
    else:
        share = ProjectShare(project_id=project_id, user_id=user_id)
        db.add(share)
        db.commit()
        shared = True
    
    total = db.exec(select(ProjectShare).where(ProjectShare.project_id == project_id)).all()
    return shared, len(total)