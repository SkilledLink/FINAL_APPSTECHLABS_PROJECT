from app.services.moderation.provider import ProviderResult


class VideoModerator:
    """Stub. Video analysis is deferred; the caption text is already
    moderated by TextModerator. Return None so the orchestrator skips it."""

    def moderate(self, media_url: str, duration_seconds: float | None = None) -> ProviderResult | None:
        return None