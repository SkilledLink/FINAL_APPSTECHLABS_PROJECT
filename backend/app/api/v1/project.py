from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.services.project_services import (
    create_project,
    get_projects,
    get_project,
    update_project,
    delete_project,
    get_projects_by_professional
)

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project_endpoint(project_data: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project"""
    return create_project(db, project_data)

@router.get("/", response_model=List[ProjectResponse])
def get_projects_endpoint(
    skip: int = 0,
    limit: int = 20,
    professional_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all projects"""
    if professional_id:
        return get_projects_by_professional(db, professional_id)
    return get_projects(db, skip, limit)

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project_endpoint(project_id: int, db: Session = Depends(get_db)):
    """Get a specific project"""
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project_endpoint(project_id: int, project_data: ProjectUpdate, db: Session = Depends(get_db)):
    """Update a project"""
    project = update_project(db, project_id, project_data)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_endpoint(project_id: int, db: Session = Depends(get_db)):
    """Delete a project"""
    deleted = delete_project(db, project_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}