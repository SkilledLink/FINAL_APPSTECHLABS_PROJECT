from fastapi import Depends, HTTPException, status

from app.dependencies.current_user import get_current_active_user
from app.enums.admin import Capability
from app.models.user import User


_ADMIN_CAPS: frozenset[Capability] = frozenset(Capability)

_MODERATOR_CAPS: frozenset[Capability] = frozenset({
    Capability.VIEW_USERS,
    Capability.VIEW_PROFESSIONALS,
    Capability.SUSPEND_USERS,
    Capability.SUSPEND_PROFESSIONALS,
    Capability.MANAGE_POSTS,
    Capability.MANAGE_COMMENTS,
    Capability.MANAGE_JOBS,
    Capability.VIEW_AUDIT_LOG,
})


def get_user_capabilities(user: User) -> frozenset[Capability]:
    if getattr(user, "is_admin", False):
        return _ADMIN_CAPS
    if getattr(user, "is_moderator", False):
        return _MODERATOR_CAPS
    return frozenset()


def has_capability(*required: Capability):
    """Dependency factory: route requires ALL listed capabilities."""
    required_set = frozenset(required)

    def _dep(current_user: User = Depends(get_current_active_user)) -> User:
        caps = get_user_capabilities(current_user)
        if not required_set.issubset(caps):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return _dep


def require_admin(
    current_user: User = Depends(get_current_active_user),
) -> User:
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


def require_moderator(
    current_user: User = Depends(get_current_active_user),
) -> User:
    if not (current_user.is_admin or current_user.is_moderator):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Moderator privileges required",
        )
    return current_user