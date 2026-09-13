from fastapi import APIRouter

from app.api.v1.moderator.users import router as users_router
from app.api.v1.moderator.professionals import router as professionals_router
from app.api.v1.moderator.feeds import router as feeds_router
from app.api.v1.moderator.jobs import router as jobs_router
from app.api.v1.moderator.audit_logs import router as audit_logs_router

moderator_router = APIRouter()
moderator_router.include_router(users_router)
moderator_router.include_router(professionals_router)
moderator_router.include_router(feeds_router)
moderator_router.include_router(jobs_router)
moderator_router.include_router(audit_logs_router)