from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database.session import get_session
from app.dependencies.permissions import has_capability
from app.enums.admin import Capability
from app.schemas.admin import AdminDashboardResponse
from app.services.admin_service import AdminService

router = APIRouter(
    prefix="/admin/dashboard",
    tags=["admin-dashboard"],
    dependencies=[Depends(has_capability(Capability.VIEW_DASHBOARD))],
)


@router.get("", response_model=AdminDashboardResponse)
def get_dashboard(session: Session = Depends(get_session)):
    return AdminService(session).dashboard()