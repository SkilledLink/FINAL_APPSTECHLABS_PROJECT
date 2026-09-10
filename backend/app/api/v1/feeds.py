from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlmodel import Session

from app.dependencies.current_user import get_current_user, get_current_active_user
from app.database.session import get_session
from app.models.user import User
from app.schemas.feed import (
    FeedResponse,
    FeedCreate,
    FeedUpdate,
    FeedListResponse,
    FeedMediaResponse,
    FeedLikeResponse,
    FeedCommentCreate,
    FeedCommentResponse,
    HashtagResponse,
)
from app.services.feed_service import FeedService

router = APIRouter(prefix="/feeds", tags=["Feeds"])


# ═══════════════════════════════════════════════════════════
# ADMIN MODERATION — must be declared BEFORE /{feed_id}
# ═══════════════════════════════════════════════════════════

@router.get("/admin/all", response_model=FeedListResponse)
def admin_list_all_feeds(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    hashtag: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(
        None, description="Filter by status: published, draft, archived, reported"
    ),
    include_deleted: bool = Query(True, description="Include soft‑deleted feeds"),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """
    **Admin only.** List all feeds, including soft‑deleted ones.
    Use this to review content that may violate community standards.
    """
    service = FeedService(session)
    return service.list_feeds_for_admin(
        current_user=current_user,
        skip=skip,
        limit=limit,
        search=search,
        hashtag=hashtag,
        status_filter=status_filter,
        include_deleted=include_deleted,
    )


@router.delete("/admin/{feed_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_force_delete_feed(
    feed_id: UUID,
    hard: bool = Query(False, description="Permanently delete (cannot be undone)"),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """
    **Admin only.** Force‑delete any feed.
    Use `hard=true` to permanently remove the record.
    """
    if not (current_user.is_admin or current_user.is_moderator):
        raise HTTPException(status_code=403, detail="Admin access required")

    service = FeedService(session)
    service.delete_feed(feed_id, current_user, hard=hard)


# ═══════════════════════════════════════════════════════════
# PUBLIC / OWNER ENDPOINTS
# ═══════════════════════════════════════════════════════════

@router.post("", response_model=FeedResponse, status_code=status.HTTP_201_CREATED)
def create_feed(
    title: str = Form(..., max_length=200),
    description: str = Form(...),
    status_field: str = Form("published", alias="status"),
    is_public: bool = Form(True),
    hashtags: Optional[str] = Form(None, description="Comma-separated list, e.g. 'python,tech'"),
    media: Optional[UploadFile] = File(None, description="Image or video file"),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    hashtag_list: List[str] = []
    if hashtags:
        hashtag_list = [h.strip() for h in hashtags.split(",") if h.strip()]

    data = FeedCreate(
        title=title,
        description=description,
        status=status_field,
        is_public=is_public,
        hashtags=hashtag_list,
    )

    service = FeedService(session)
    return service.create_feed(current_user, data, media_file=media)


@router.get("", response_model=FeedListResponse)
def list_feeds(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user_id: Optional[UUID] = Query(None),
    search: Optional[str] = Query(None),
    hashtag: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = FeedService(session)
    return service.list_feeds(
        current_user,
        skip=skip,
        limit=limit,
        user_id=user_id,
        search=search,
        hashtag=hashtag,
    )


@router.get("/trending-hashtags", response_model=List[HashtagResponse])
def get_trending_hashtags(
    limit: int = Query(20, ge=1, le=50),
    session: Session = Depends(get_session),
):
    service = FeedService(session)
    return service.get_trending_hashtags(limit)


@router.get("/{feed_id}", response_model=FeedResponse)
def get_feed(
    feed_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    service = FeedService(session)
    return service.get_feed(feed_id, current_user)


@router.put("/{feed_id}", response_model=FeedResponse)
def update_feed(
    feed_id: UUID,
    data: FeedUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = FeedService(session)
    return service.update_feed(feed_id, data, current_user)


@router.delete("/{feed_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_feed(
    feed_id: UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = FeedService(session)
    service.delete_feed(feed_id, current_user, hard=False)


# ═══════════════════════════════════════════════════════════
# Media
# ═══════════════════════════════════════════════════════════

@router.post("/{feed_id}/media", response_model=FeedMediaResponse)
def upload_feed_media(
    feed_id: UUID,
    media: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = FeedService(session)
    return service.upload_feed_media(feed_id, media, current_user)


@router.delete("/media/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_feed_media(
    media_id: UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = FeedService(session)
    service.delete_feed_media(media_id, current_user)


# ═══════════════════════════════════════════════════════════
# Likes
# ═══════════════════════════════════════════════════════════

@router.post("/{feed_id}/like", response_model=FeedLikeResponse)
def toggle_like(
    feed_id: UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = FeedService(session)
    return service.toggle_like(feed_id, current_user)


# ═══════════════════════════════════════════════════════════
# Comments
# ═══════════════════════════════════════════════════════════

@router.post("/{feed_id}/comments", response_model=FeedCommentResponse)
def create_comment(
    feed_id: UUID,
    data: FeedCommentCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = FeedService(session)
    return service.create_comment(feed_id, data, current_user)


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: UUID,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    service = FeedService(session)
    service.delete_comment(comment_id, current_user)