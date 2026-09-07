from sqlmodel import Session, select
from typing import List, Optional
from app.models.project import Project, ProjectStatus
from app.schemas.project import ProjectCreate, ProjectUpdate

def create_project(db: Session, project_data: ProjectCreate) -> Project:
    db_project = Project(
        title=project_data.title,
        category=project_data.category,
        trade=project_data.trade,
        location=project_data.location,
        description=project_data.description,
        before_image=project_data.before_image,
        after_image=project_data.after_image,
        images=project_data.images or [],
        completion_date=project_data.completion_date,
        duration=project_data.duration,
        budget=project_data.budget,
        client=project_data.client,
        skills=project_data.skills or [],
        challenges=project_data.challenges or [],
        results=project_data.results or [],
        professional_id=project_data.professional_id,
        status=project_data.status,
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def get_projects(db: Session, skip: int = 0, limit: int = 20) -> List[Project]:
    statement = select(Project).where(Project.status == ProjectStatus.PUBLISHED).order_by(Project.created_at.desc()).offset(skip).limit(limit)
    return db.exec(statement).all()

def get_project(db: Session, project_id: int) -> Optional[Project]:
    return db.get(Project, project_id)

def update_project(db: Session, project_id: int, project_data: ProjectUpdate) -> Optional[Project]:
    db_project = get_project(db, project_id)
    if not db_project:
        return None
    update_data = project_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int) -> bool:
    db_project = get_project(db, project_id)
    if not db_project:
        return False
    db.delete(db_project)
    db.commit()
    return True

def get_projects_by_professional(db: Session, professional_id: int) -> List[Project]:
    statement = select(Project).where(Project.professional_id == professional_id).order_by(Project.created_at.desc())
    return db.exec(statement).all()