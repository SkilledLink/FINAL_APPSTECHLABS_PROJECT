# app/services/moderation/video_moderator.py
from app.services.moderation.provider import ProviderResult


class VideoModerator:
    """
    Video moderation is not implemented.

    Rather than silently skip video (which would let unmoderated video
    go live), every video post is flagged for manual review.

    Severity 6 → REVIEW band in decision.py (SAFE_MAX=5, REVIEW_MAX=8).

    When real video moderation is added (frame extraction + Gemini
    vision, or direct video input), replace this stub.
    """

    def moderate(
        self,
        media_url: str,
        duration_seconds: float | None = None,
    ) -> ProviderResult:
        return ProviderResult(
            severity=6,
            confidence=50,
            description="Video content requires manual review",
            reason="Automated video moderation is not implemented",
            categories=[],
            raw={"media_url": media_url, "duration_seconds": duration_seconds},
            provider="internal",
            model="video_stub",
        )