from enum import Enum


class Capability(str, Enum):
    # Users
    VIEW_USERS = "view_users"
    EDIT_USERS = "edit_users"
    SUSPEND_USERS = "suspend_users"
    DELETE_USERS = "delete_users"

    # Professionals
    VIEW_PROFESSIONALS = "view_professionals"
    EDIT_PROFESSIONALS = "edit_professionals"
    SUSPEND_PROFESSIONALS = "suspend_professionals"
    MANAGE_VERIFICATION = "manage_verification"
    MANAGE_KYC = "manage_kyc"

    # Content
    MANAGE_POSTS = "manage_posts"
    MANAGE_COMMENTS = "manage_comments"
    MANAGE_JOBS = "manage_jobs"

    # Platform
    VIEW_DASHBOARD = "view_dashboard"
    VIEW_AUDIT_LOG = "view_audit_log"
    MANAGE_MODERATORS = "manage_moderators"
    MANAGE_ADMINS = "manage_admins"
    MANAGE_PLATFORM_CONFIG = "manage_platform_config"

    # Reserved for future entities
    MANAGE_REPORTS = "manage_reports"
    MANAGE_SERVICES = "manage_services"
    MANAGE_BOOKINGS = "manage_bookings"
    MANAGE_MODERATION = "manage_moderation"