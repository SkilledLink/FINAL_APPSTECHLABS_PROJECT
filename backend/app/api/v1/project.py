from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.schemas.project_interaction import (
    ProjectLikeToggleResponse,
    ProjectCommentCreate,
    ProjectCommentResponse,
    ProjectShareToggleResponse
)
from app.services.project_services import (
    create_project,
    get_projects,
    get_project,
    update_project,
    delete_project,
    get_projects_by_professional,
    get_projects_by_trade
)
from app.services.project_interaction import (
    toggle_project_like,
    get_project_likes_count,
    add_project_comment,
    get_project_comments,
    toggle_project_share
)

router = APIRouter(prefix="/api/projects", tags=["Projects"])

# ============================================================
# PROJECT CRUD
# ============================================================

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project_endpoint(project_data: ProjectCreate, db: Session = Depends(get_db)):
    return create_project(db, project_data)

@router.get("/", response_model=List[ProjectResponse])
def get_projects_endpoint(
    skip: int = 0,
    limit: int = 20,
    professional_id: Optional[int] = None,
    trade: Optional[str] = None,
    db: Session = Depends(get_db)
):
    if professional_id:
        return get_projects_by_professional(db, professional_id)
    if trade:
        return get_projects_by_trade(db, trade, limit)
    return get_projects(db, skip, limit)

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project_endpoint(project_id: int, db: Session = Depends(get_db)):
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project_endpoint(project_id: int, project_data: ProjectUpdate, db: Session = Depends(get_db)):
    project = update_project(db, project_id, project_data)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_endpoint(project_id: int, db: Session = Depends(get_db)):
    deleted = delete_project(db, project_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}

# ============================================================
# ✅ LIKE PROJECT
# ============================================================

@router.post("/{project_id}/like", response_model=ProjectLikeToggleResponse)
def toggle_project_like_endpoint(project_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    """Like or unlike a project"""
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    liked, total_likes = toggle_project_like(db, project_id, user_id)
    return {
        "liked": liked,
        "likes_count": total_likes,
        "message": "Liked" if liked else "Unliked"
    }

@router.get("/{project_id}/likes/count")
def get_project_likes_count_endpoint(project_id: int, db: Session = Depends(get_db)):
    """Get total likes for a project"""
    return {"likes_count": get_project_likes_count(db, project_id)}

# ============================================================
# ✅ COMMENT ON PROJECT
# ============================================================

@router.post("/{project_id}/comments", response_model=ProjectCommentResponse, status_code=status.HTTP_201_CREATED)
def add_project_comment_endpoint(
    project_id: int,
    comment_data: ProjectCommentCreate,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """Add a comment to a project"""
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return add_project_comment(db, project_id, comment_data, user_id)

@router.get("/{project_id}/comments", response_model=List[ProjectCommentResponse])
def get_project_comments_endpoint(project_id: int, db: Session = Depends(get_db)):
    """Get all comments for a project"""
    return get_project_comments(db, project_id)

# ============================================================
# ✅ SHARE PROJECT
# ============================================================

@router.post("/{project_id}/share", response_model=ProjectShareToggleResponse)
def toggle_project_share_endpoint(project_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    """Share or unshare a project"""
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    shared, total_shares = toggle_project_share(db, project_id, user_id)
    return {
        "shared": shared,
        "shares_count": total_shares,
        "message": "Shared" if shared else "Unshared"
    }