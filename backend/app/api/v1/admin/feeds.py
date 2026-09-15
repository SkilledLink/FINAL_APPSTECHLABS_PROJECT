from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, status
from sqlmodel import Session

from app.database.session import get_session
from app.dependencies.permissions import has_capability
from app.enums.admin import Capability
from app.models.user import User
from app.schemas.feed import FeedListResponse, FeedResponse
from app.services.admin_service import AdminService
from app.services.feed_service import FeedService
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, status
from sqlmodel import Session

from app.database.session import get_session
from app.dependencies.permissions import has_capability
from app.enums.admin import Capability
from app.models.user import User
from app.schemas.feed import FeedListResponse, FeedResponse
from app.services.admin_service import AdminService
from app.services.feed_service import FeedService

router = APIRouter(
    prefix="/admin/feeds",
    tags=["admin-feeds"],
    dependencies=[Depends(has_capability(Capability.MANAGE_POSTS))],
)


@router.get("", response_model=FeedListResponse)
def list_feeds(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    hashtag: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    include_deleted: bool = Query(True),
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.MANAGE_POSTS)),
):
    return FeedService(session).list_feeds_for_admin(
        current_user=current_user,
        skip=skip,
        limit=limit,
        search=search,
        hashtag=hashtag,
        status_filter=status_filter,
        include_deleted=include_deleted,
    )


# NOTE: /comments/{comment_id} declared before /{feed_id} so that the static
# path segment "comments" is matched first.
@router.delete(
    "/comments/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_feed_comment(
    comment_id: UUID,
    reason: str = Query(..., min_length=5, max_length=500),
    request: Request = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.MANAGE_COMMENTS)),
):
    AdminService(session).moderator_delete_feed_comment(
        actor=current_user,
        comment_id=comment_id,
        reason=reason,
        request=request,
    )


@router.get("/{feed_id}", response_model=FeedResponse)
def get_feed(
    feed_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.MANAGE_POSTS)),
):
    return FeedService(session).get_feed(feed_id, current_user)


@router.delete("/{feed_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_feed(
    feed_id: UUID,
    reason: str = Query(..., min_length=5, max_length=500),
    hard: bool = Query(False),
    request: Request = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.MANAGE_POSTS)),
):
    AdminService(session).moderator_delete_feed(
        actor=current_user,
        feed_id=feed_id,
        reason=reason,
        hard=hard,
        request=request,
    )
router = APIRouter(
    prefix="/admin/feeds",
    tags=["admin-feeds"],
    dependencies=[Depends(has_capability(Capability.MANAGE_POSTS))],
)


@router.get("", response_model=FeedListResponse)
def list_feeds(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    hashtag: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    include_deleted: bool = Query(True),
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.MANAGE_POSTS)),
):
    return FeedService(session).list_feeds_for_admin(
        current_user=current_user,
        skip=skip,
        limit=limit,
        search=search,
        hashtag=hashtag,
        status_filter=status_filter,
        include_deleted=include_deleted,
    )


# NOTE: /comments/{comment_id} declared before /{feed_id} so that the static
# path segment "comments" is matched first.
@router.delete(
    "/comments/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_feed_comment(
    comment_id: UUID,
    reason: str = Query(..., min_length=5, max_length=500),
    request: Request = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.MANAGE_COMMENTS)),
):
    AdminService(session).moderator_delete_feed_comment(
        actor=current_user,
        comment_id=comment_id,
        reason=reason,
        request=request,
    )


@router.get("/{feed_id}", response_model=FeedResponse)
def get_feed(
    feed_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.MANAGE_POSTS)),
):
    return FeedService(session).get_feed(feed_id, current_user)


@router.delete("/{feed_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_feed(
    feed_id: UUID,
    reason: str = Query(..., min_length=5, max_length=500),
    hard: bool = Query(False),
    request: Request = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(has_capability(Capability.MANAGE_POSTS)),
):
    AdminService(session).moderator_delete_feed(
        actor=current_user,
        feed_id=feed_id,
        reason=reason,
        hard=hard,
        request=request,
    )