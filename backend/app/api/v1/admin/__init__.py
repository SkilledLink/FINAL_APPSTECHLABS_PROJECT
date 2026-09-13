from fastapi import APIRouter

from app.api.v1.admin.dashboard import router as dashboard_router
from app.api.v1.admin.users import router as users_router
from app.api.v1.admin.professionals import router as professionals_router
from app.api.v1.admin.feeds import router as feeds_router
from app.api.v1.admin.jobs import router as jobs_router
from app.api.v1.moderator import moderator_router as moderators_router
from app.api.v1.admin.administrators import router as administrators_router
from app.api.v1.admin.audit_logs import router as audit_logs_router
from app.api.v1.admin.moderation import router as moderation_router
...

admin_router = APIRouter()
admin_router.include_router(dashboard_router)
admin_router.include_router(users_router)
admin_router.include_router(professionals_router)
admin_router.include_router(feeds_router)
admin_router.include_router(jobs_router)
admin_router.include_router(moderators_router)
admin_router.include_router(administrators_router)
admin_router.include_router(audit_logs_router)
admin_router.include_router(moderation_router)
