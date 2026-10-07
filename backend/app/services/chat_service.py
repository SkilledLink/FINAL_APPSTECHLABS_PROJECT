# app/services/chat_service.py
import logging
import time
from typing import Dict, List
from urllib.parse import urlencode
from uuid import UUID

from sqlmodel import Session

from app.core.config import settings
from app.ai.gateway import AIGateway
from app.ai.intent import AIIntent, IntentType, classify
from app.ai.perf import timed
from app.ai.scope_guard import (
    BYE_RESPONSE,
    GREETING_RESPONSE,
    OFF_TOPIC_RESPONSE,
    THANKS_RESPONSE,
    check_scope,
)
from app.ai.schemas import (
    ImageAnalysis,
    ProfessionalCard,
    ProfessionalSearchParams,
    ProfessionalSearchResult,
)
from app.repositories.search_repository import SearchRepository
from app.services.knowledge_service import KnowledgeService
from app.services.professional_search_service import ProfessionalSearchService
from app.services.image_analysis_service import ImageAnalysisService
from app.repositories.chat_log_repository import ChatLogRepository

logger = logging.getLogger(__name__)

DISCOVERY_PATH = "/discovery"


# ── RAG system prompt — SkilledLink ONLY ───────────────────
SYSTEM_PROMPT = """You are 'SkilledLink Assistant', the ONLY in-app AI helper for SkilledLink — a platform that connects customers with skilled professionals (electricians, plumbers, carpenters, mechanics, etc.) in Cameroon.

════════ STRICT SCOPE ════════
You ONLY answer questions about:
  • SkilledLink features, accounts, profiles, onboarding
  • Finding, hiring, or messaging skilled professionals
  • Professional services, portfolios, verification, reviews
  • Service requests, quotes, bookings, communication
  • Platform safety, privacy, and how-to guidance

If the question is not about SkilledLink, reply with EXACTLY this one sentence and nothing else:
  "I'm the SkilledLink Assistant and I can only help with SkilledLink-related questions."

════════ GROUNDING ════════
- Use the provided context as your source of truth.
- Write a fresh, concise, friendly answer in your own words.
- NEVER invent professionals, services, prices, ratings, reviews, availability, or features.
- If the context doesn't answer the question, say so honestly.

════════ STYLE ════════
- 2–4 sentences unless asked for more detail.
- If listing steps, provide the full list.
- Respond in the user's language (English or French)."""


IMAGE_FORMAT_SYSTEM_PROMPT = """You are 'SkilledLink Assistant'. You have
just analyzed an image on behalf of the user.

Rules:
- Frame every hypothesis as uncertain. Say "appears to show" or
  "looks like", not "is" or "definitely".
- Describe what is visible factually.
- Suggest the type of professional that would be appropriate.
- Never claim the image proves a specific diagnosis.
- Keep the response under 4 sentences.
- Respond in the user's language (English or French)."""


class ChatService:
    def __init__(self, session: Session):
        self.session = session
        self.knowledge_service = KnowledgeService(session)
        self.search_service = ProfessionalSearchService(session)
        self.image_service = ImageAnalysisService()
        self.chat_log_repo = ChatLogRepository(session)
        self.gateway = AIGateway()
        self.search_repo = SearchRepository(session)

    # ────────────────────────────────────────────────────────
    #  ENTRY POINT
    # ────────────────────────────────────────────────────────

    def process_message(
        self,
        user_id: UUID,
        message: str,
        *,
        image_bytes: bytes | None = None,
        image_mime: str | None = None,
    ) -> Dict[str, any]:
        t0 = time.perf_counter()
        try:
            # ── STEP 0: scope guard — ZERO tokens ─────────
            scope = check_scope(message)
            logger.info(
                "chat.scope allowed=%s reason=%s matched=%r user=%s",
                scope.allowed, scope.reason, scope.matched, user_id,
            )

            if not scope.allowed:
                if scope.reason == "empty":
                    return self._finalize(
                        user_id, message, "Please type a message.",
                    )
                return self._finalize(
                    user_id, message, OFF_TOPIC_RESPONSE,
                )

            # ── STEP 1: canned greeting — ZERO tokens ─────
            canned = self._canned_reply(message, scope.reason)
            if canned is not None:
                return self._finalize(user_id, message, canned)

            # ── STEP 2: classify intent ───────────────────
            ai_intent = self._classify(message, has_image=bool(image_bytes))

            # ── Image paths ──────────────────────────────
            if ai_intent.intent in (
                IntentType.IMAGE_ANALYSIS,
                IntentType.IMAGE_ASSISTED_SEARCH,
                IntentType.MULTIMODAL_SEARCH,
            ):
                return self._handle_image(
                    user_id, message, ai_intent,
                    image_bytes=image_bytes, image_mime=image_mime,
                )

            # ── Search paths ─────────────────────────────
            if ai_intent.intent in (
                IntentType.PROFESSIONAL_SEARCH,
                IntentType.NEARBY_SEARCH,
                IntentType.SERVICE_SEARCH,
            ):
                return self._handle_search(user_id, message, ai_intent)

            # ── Knowledge / RAG ──────────────────────────
            if ai_intent.intent == IntentType.STATIC_KNOWLEDGE:
                return self._handle_rag(user_id, message)

            # ── Other DB intents — honest template ───────
            if ai_intent.requires_database:
                return self._handle_database_pending(user_id, message, ai_intent)

            # ── Fallback: try RAG before refusing ────────
            logger.info(
                "chat.routing_to_rag intent=%s reason=fallback",
                ai_intent.intent.value,
            )
            return self._handle_rag(user_id, message)

        except Exception as e:
            self.session.rollback()
            logger.error("Chat processing failed for user %s: %s", user_id, e)
            raise
        finally:
            logger.info(
                "chat.total user=%s elapsed_ms=%d",
                user_id, int((time.perf_counter() - t0) * 1000),
            )

    # ────────────────────────────────────────────────────────
    #  HELPERS
    # ────────────────────────────────────────────────────────

    def _finalize(
        self,
        user_id: UUID,
        message: str,
        response: str,
        sources: List[str] | None = None,
        results: list | None = None,
        image_analysis: dict | None = None,
        redirect_url: str | None = None,
    ) -> Dict[str, any]:
        self.chat_log_repo.create_log(
            user_id=user_id,
            message=message,
            response=response,
            sources=sources if sources else None,
        )
        self.session.commit()
        payload: Dict[str, any] = {
            "response": response,
            "sources": sources or [],
        }
        if results is not None:
            payload["results"] = results
        if image_analysis is not None:
            payload["image_analysis"] = image_analysis
        if redirect_url is not None:
            payload["redirect_url"] = redirect_url
        return payload

    def _canned_reply(self, message: str, reason: str) -> str | None:
        if reason != "greeting":
            return None
        m = message.strip().lower().rstrip("!.,? ")
        if m in {"bye", "goodbye", "au revoir", "bonsoir"}:
            return BYE_RESPONSE
        if m in {"thanks", "thank you", "thx", "merci"}:
            return THANKS_RESPONSE
        return GREETING_RESPONSE

    def _classify(self, message: str, has_image: bool) -> AIIntent:
        if not getattr(settings, "CHAT_INTENT_ENABLED", True):
            return AIIntent(
                intent=IntentType.GENERAL_CONVERSATION,
                confidence=0.0,
                reason="classifier_disabled",
                has_image=has_image,
            )

        with timed("intent"):
            result = classify(message, has_image=has_image)

        logger.info(
            "chat.intent intent=%s confidence=%.2f reason=%s image=%s",
            result.intent.value, result.confidence, result.reason, has_image,
        )
        return result

    # ────────────────────────────────────────────────────────
    #  PLURALIZATION
    # ────────────────────────────────────────────────────────

    def _pluralize(self, word: str) -> str:
        """
        Naive but correct-in-practice pluralization for trade names.

        electrician → electricians
        plumber     → plumbers
        handyman    → handymen
        tiler       → tilers
        roofer      → roofers
        """
        w = (word or "").strip()
        if not w:
            return "professionals"
        lower = w.lower()
        if lower.endswith("man"):
            return f"{w[:-3]}men"
        if lower.endswith("y") and not lower.endswith(("ay", "ey", "oy", "uy")):
            return f"{w[:-1]}ies"
        if lower.endswith(("s", "x", "ch", "sh", "z")):
            return f"{w}es"
        return f"{w}s"

    # ────────────────────────────────────────────────────────
    #  HANDLERS
    # ────────────────────────────────────────────────────────

    def _handle_rag(self, user_id: UUID, message: str) -> Dict[str, any]:
        with timed("rag"):
            context_docs = self.knowledge_service.retrieve_context(
                message, limit=settings.RAG_TOP_K,
            )

        logger.info(
            "chat.rag retrieved=%d query=%r",
            len(context_docs), message[:80],
        )

        if not context_docs:
            return self._finalize(
                user_id, message,
                "I don't have information about that. Try asking about "
                "finding professionals, your profile, services, "
                "verification, or how SkilledLink works.",
            )

        prompt = self._build_prompt(message, context_docs)
        with timed("llm_rag"):
            response = self.gateway.generate_text_sync(
                prompt=prompt,
                system_prompt=SYSTEM_PROMPT,
                model=getattr(
                    settings, "GROQ_CHAT_MODEL_RAG",
                    settings.GROQ_CHAT_MODEL_FAST,
                ),
                max_tokens=400,
            )

        sources = [d["title"] for d in context_docs if d.get("title")]
        return self._finalize(
            user_id, message, response, sources=sources or None,
        )

    def _handle_search(
        self, user_id: UUID, message: str, ai_intent: AIIntent
    ) -> Dict[str, any]:
        """
        Run a strict profession-scoped search.

        KEY FIX: when the classifier inferred a canonical profession,
        search by that name — not by the raw user sentence. The raw
        sentence contains filler tokens ("I", "someone", "my") that
        the repository's token-AND matcher treats as required terms
        and therefore returns zero rows.
        """
        profession = ai_intent.profession
        raw_query = (ai_intent.query or message).strip()

        # Search by canonical profession when we have one; fall back
        # to the raw sentence otherwise.
        search_query = profession or raw_query

        logger.info(
            "chat.search_start profession=%r search_query=%r raw_query=%r city=%r",
            profession, search_query[:80], raw_query[:80], ai_intent.location,
        )

        with timed("search"):
            rows = self.search_repo.hybrid_search(
                query=search_query,
                city=ai_intent.location,
                limit=settings.AI_TOOL_PROFESSIONAL_LIMIT,
                verified=bool(ai_intent.verified_only) or None,
                min_tier_level=None,
            )

        # Post-filter with the classifier's authoritative profession
        # (the repo's own resolver is substring-based and looser).
        if profession:
            needle = profession.strip().lower()
            rows = [r for r in rows if self._row_matches_profession(r, needle)]

        # ── Empty state — honest, profession-aware ───────────
        if not rows:
            label = self._pluralize(profession or "professional")
            where = f" in {ai_intent.location}" if ai_intent.location else ""
            response = (
                f"I couldn't find any {label.lower()}{where} available "
                f"right now. Try a different city, or check back soon."
            )
            logger.info(
                "chat.search_empty profession=%r city=%r",
                profession, ai_intent.location,
            )
            return self._finalize(user_id, message, response)

        # ── Map dict rows to ProfessionalCard objects ────────
        cards: List[ProfessionalCard] = [
            self._row_to_card(r) for r in rows
        ]

        # ── Templated lead-in — correct singular / plural ────
        n = len(cards)
        singular = profession or raw_query or "professional"
        plural = self._pluralize(singular)
        where = f" in {ai_intent.location}" if ai_intent.location else ""

        if n == 1:
            response = (
                f"I found 1 {singular.lower()}{where} that matches your request."
            )
        else:
            response = (
                f"I found {n} {plural.lower()}{where} that match your request."
            )

        logger.info(
            "chat.search_ok profession=%r hits=%d",
            profession, n,
        )

        return self._finalize(
            user_id,
            message,
            response,
            results=[c.model_dump(mode="json") for c in cards],
            redirect_url=self._build_redirect_url(
                query=ai_intent.query or message,
                profession=profession,
                city=ai_intent.location,
                radius_km=ai_intent.radius_km,
                verified_only=ai_intent.verified_only,
                available_only=ai_intent.available_only,
                min_rating=ai_intent.min_rating,
            ),
        )

    # ────────────────────────────────────────────────────────
    #  row matching + mapping
    # ────────────────────────────────────────────────────────

    def _row_matches_profession(self, row: Dict[str, any], needle: str) -> bool:
        """
        True when a search row matches the classifier's profession.

        Accepts:
          • profession string equal to `needle`
          • profession string contains `needle` (or vice versa)
          • any skill or service contains `needle`
        """
        prof = (row.get("profession") or "").strip().lower()
        if prof == needle or needle in prof or prof in needle:
            return True
        for field in ("skills", "services"):
            values = row.get(field) or []
            for s in values:
                if isinstance(s, str) and needle in s.strip().lower():
                    return True
        return False

    def _row_to_card(self, row: Dict[str, any]) -> ProfessionalCard:
        """Convert a SearchRepository row dict into the public card."""
        first = (row.get("first_name") or "").strip()
        last = (row.get("last_name") or "").strip()
        display = (
            f"{first} {last}".strip()
            or row.get("profession")
            or "Professional"
        )

        return ProfessionalCard(
            id=row["id"],
            user_id=row["user_id"],
            name=display,
            first_name=first or None,
            last_name=last or None,
            username=None,
            profession=row.get("profession") or "",
            headline=row.get("bio"),
            company_name=None,
            city=row.get("city"),
            region=row.get("region"),
            country=row.get("country"),
            distance_km=None,
            years_of_experience=row.get("years_of_experience"),
            skills=row.get("skills"),
            services=row.get("services"),
            hourly_rate=row.get("hourly_rate"),
            currency="XAF",
            rating=row.get("rating"),
            total_reviews=row.get("total_reviews") or 0,
            completed_jobs=row.get("completed_jobs") or 0,
            is_verified=bool(row.get("is_verified")),
            available=bool(row.get("available")),
            profile_image_url=row.get("profile_image_url"),
            profile_url=f"/profile/{row['user_id']}",
        )

    def _search_lead_in(
        self, result: ProfessionalSearchResult, ai_intent: AIIntent
    ) -> str:
        """Legacy helper — kept for compatibility with image handler."""
        n = result.metadata.total
        where = f" in {ai_intent.location}" if ai_intent.location else ""
        what = ai_intent.profession or ai_intent.query or "professionals"
        if n == 1:
            return f"I found 1 {what}{where} that matches your request."
        return f"I found {n} {what}{where} that match your request."

    def _handle_image(
        self,
        user_id: UUID,
        message: str,
        ai_intent: AIIntent,
        *,
        image_bytes: bytes | None,
        image_mime: str | None,
    ) -> Dict[str, any]:
        if not image_bytes or not image_mime:
            return self._finalize(user_id, message, OFF_TOPIC_RESPONSE)

        with timed("image"):
            analysis: ImageAnalysis = self.image_service.analyze(
                image_bytes, image_mime, user_text=message,
            )

        if ai_intent.intent == IntentType.IMAGE_ANALYSIS:
            prompt = self._build_image_prompt(message, analysis)
            with timed("llm_image"):
                response = self.gateway.generate_text_sync(
                    prompt=prompt,
                    system_prompt=IMAGE_FORMAT_SYSTEM_PROMPT,
                    max_tokens=180,
                )
            return self._finalize(
                user_id, message, response,
                image_analysis=analysis.model_dump(mode="json"),
            )

        # Image-assisted search
        effective_query = (
            ai_intent.query
            or " ".join(analysis.search_terms)
            or analysis.description
        )
        effective_profession = (
            analysis.possible_profession or ai_intent.profession
        )

        params = ProfessionalSearchParams(
            query=effective_query,
            profession=effective_profession,
            city=ai_intent.location,
            radius_km=ai_intent.radius_km,
            limit=settings.AI_TOOL_PROFESSIONAL_LIMIT,
        )
        with timed("search"):
            result = self.search_service.search(params)

        if result.metadata.total == 0:
            return self._finalize(
                user_id, message,
                "The image suggests this might involve "
                f"{analysis.possible_profession or 'a specialist'}, but "
                "I couldn't find a matching professional. Try broadening "
                "the location or profession.",
                image_analysis=analysis.model_dump(mode="json"),
            )

        prompt = self._build_image_search_prompt(message, analysis, result)
        with timed("llm_image_search"):
            response = self.gateway.generate_text_sync(
                prompt=prompt,
                system_prompt=IMAGE_FORMAT_SYSTEM_PROMPT,
                max_tokens=180,
            )

        return self._finalize(
            user_id, message, response,
            results=[c.model_dump(mode="json") for c in result.professionals],
            image_analysis=analysis.model_dump(mode="json"),
            redirect_url=self._build_redirect_url(
                query=effective_query,
                profession=effective_profession,
                city=ai_intent.location,
                radius_km=ai_intent.radius_km,
            ),
        )

    def _handle_database_pending(
        self, user_id: UUID, message: str, ai_intent: AIIntent
    ) -> Dict[str, any]:
        templates = {
            IntentType.JOB_SEARCH:
                "Job search isn't available in the chat yet. Check the Jobs section.",
            IntentType.POST_SEARCH:
                "Post search isn't available in the chat yet. Browse the Feed.",
            IntentType.USER_SEARCH:
                "User search isn't available in the chat yet. Try the Search page.",
            IntentType.PROFESSIONAL_DETAILS:
                "Open the professional's profile from the Search page for details.",
            IntentType.SERVICE_DETAILS:
                "Open the service from a professional's profile.",
            IntentType.JOB_DETAILS:
                "Open the job from the Jobs section.",
            IntentType.PORTFOLIO_DETAILS:
                "Open the professional's portfolio from their profile.",
        }
        return self._finalize(
            user_id, message,
            templates.get(
                ai_intent.intent,
                "That feature isn't connected to the chat yet.",
            ),
        )

    # ────────────────────────────────────────────────────────
    #  REDIRECT URL BUILDER
    # ────────────────────────────────────────────────────────

    def _build_redirect_url(
        self,
        *,
        query: str | None = None,
        profession: str | None = None,
        city: str | None = None,
        radius_km: float | None = None,
        verified_only: bool | None = None,
        available_only: bool | None = None,
        min_rating: float | None = None,
    ) -> str:
        params: Dict[str, str] = {}
        if query:
            params["query"] = query.strip()
        if profession:
            params["profession"] = profession.strip()
        if city:
            params["city"] = city.strip()
        if radius_km is not None:
            params["radius_km"] = str(radius_km)
        if verified_only:
            params["verified_only"] = "true"
        if available_only:
            params["available_only"] = "true"
        if min_rating is not None:
            params["min_rating"] = str(min_rating)

        qs = urlencode(params)
        return f"{DISCOVERY_PATH}?{qs}" if qs else DISCOVERY_PATH

    # ────────────────────────────────────────────────────────
    #  PROMPT BUILDERS
    # ────────────────────────────────────────────────────────

    def _build_prompt(
        self, message: str, context_docs: List[Dict[str, str]]
    ) -> str:
        parts: List[str] = []
        if context_docs:
            parts.append("Here is relevant information from our knowledge base:\n")
            for i, doc in enumerate(context_docs, 1):
                parts.append(
                    f"--- Document {i}: {doc.get('title', 'Untitled')} ---"
                )
                parts.append(doc.get("content", ""))
                parts.append("")
            parts.append(
                "Answer the user's question below using ONLY the above context. "
                "Write a fresh answer in your own words. "
                "If the question is NOT about SkilledLink, refuse in one short sentence.\n"
            )
        parts.append(f"User's question: {message}")
        return "\n".join(parts)

    def _build_image_prompt(self, message: str, analysis: ImageAnalysis) -> str:
        return (
            f"User wrote: {message or '(no text)'}\n\n"
            f"--- IMAGE ANALYSIS ---\n"
            f"description: {analysis.description}\n"
            f"possible_profession: {analysis.possible_profession}\n"
            f"possible_services: {', '.join(analysis.possible_services)}\n"
            f"confidence: {analysis.confidence}\n"
            f"--- END IMAGE ANALYSIS ---\n\n"
            f"Describe what you see and suggest an appropriate professional. "
            f"Frame it as uncertain."
        )

    def _build_image_search_prompt(
        self,
        message: str,
        analysis: ImageAnalysis,
        result: ProfessionalSearchResult,
    ) -> str:
        lines = [
            f"User wrote: {message or '(no text)'}",
            "",
            f"Image appears to show: {analysis.description}",
            f"Possible profession: {analysis.possible_profession}",
            "",
            "--- TOOL RESULT ---",
            f"RESULTS: {result.metadata.total}",
        ]
        for i, c in enumerate(result.professionals[:5], 1):
            parts = [c.name, c.profession or ""]
            if c.city:
                parts.append(c.city)
            if c.rating:
                parts.append(f"{c.rating}★")
            lines.append(f"{i}. " + " | ".join(p for p in parts if p))
        lines.append("--- END TOOL RESULT ---")
        lines.append("")
        lines.append("Write a short lead-in. Frame image interpretation as uncertain.")
        return "\n".join(lines)