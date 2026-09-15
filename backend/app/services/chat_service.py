# app/services/chat_service.py
import logging
from typing import Dict, List
from uuid import UUID

from sqlmodel import Session

from app.core.config import settings
from app.ai.gateway import AIGateway
from app.ai.intent import AIIntent, IntentType, classify
from app.ai.perf import timed
from app.ai.schemas import (
    ImageAnalysis,
    ProfessionalSearchParams,
    ProfessionalSearchResult,
)
from app.services.knowledge_service import KnowledgeService
from app.services.professional_search_service import ProfessionalSearchService
from app.services.image_analysis_service import ImageAnalysisService
from app.repositories.chat_log_repository import ChatLogRepository

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are 'SkilledLink Assistant', an AI helper for SkilledLink, a platform connecting skilled workers (electricians, plumbers, carpenters, mechanics, etc.) with customers in Cameroon.

Your role is to answer user questions based on the provided knowledge base context. Follow these guidelines:
- Use the context to answer accurately and helpfully.
- Write a fresh, concise, and friendly response in your own words – do NOT copy the context verbatim.
- If the context doesn't fully answer the question, use your general knowledge but indicate that it's general guidance.
- Keep responses to 2-4 sentences unless the user asks for more detail.
- If you don't know the answer, say so clearly and suggest contacting support.
- Respond in the same language as the user's question (English or French).

Never invent professionals, services, prices, ratings, reviews, availability, verification status, or platform features. If information is unavailable, say so clearly instead of guessing."""


SEARCH_FORMAT_SYSTEM_PROMPT = """You are 'SkilledLink Assistant'. You ran a
real database search on behalf of the user.

Rules:
- Use ONLY the data in the TOOL RESULT section.
- Never invent professionals, cities, ratings, reviews, availability.
- If RESULTS is 0, say so honestly and suggest broadening the search.
- Keep the response under 4 lines. The actual result cards are
  rendered by the frontend from structured data — you are only
  writing the lead-in sentence.
- Respond in the same language as the user's question."""


IMAGE_FORMAT_SYSTEM_PROMPT = """You are 'SkilledLink Assistant'. You have
just analyzed an image on behalf of the user.

Rules:
- Frame every hypothesis as uncertain. Say "appears to show" or
  "looks like", not "is" or "definitely".
- Describe what is visible factually.
- Suggest the type of professional that would be appropriate.
- Never claim the image proves a specific diagnosis.
- Keep the response under 4 sentences.
- Respond in the same language as the user's question."""


class ChatService:
    def __init__(self, session: Session):
        self.session = session
        self.knowledge_service = KnowledgeService(session)
        self.search_service = ProfessionalSearchService(session)
        self.image_service = ImageAnalysisService()
        self.chat_log_repo = ChatLogRepository(session)
        self.gateway = AIGateway()

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
        try:
            ai_intent = self._classify(message, has_image=bool(image_bytes))

            # ── Image paths ────────────────────────────────
            if ai_intent.intent in (
                IntentType.IMAGE_ANALYSIS,
                IntentType.IMAGE_ASSISTED_SEARCH,
                IntentType.MULTIMODAL_SEARCH,
            ):
                return self._handle_image(
                    user_id, message, ai_intent,
                    image_bytes=image_bytes, image_mime=image_mime,
                )

            # ── Search paths ───────────────────────────────
            if ai_intent.intent in (
                IntentType.PROFESSIONAL_SEARCH,
                IntentType.NEARBY_SEARCH,
                IntentType.SERVICE_SEARCH,
            ):
                return self._handle_search(user_id, message, ai_intent)

            # ── Knowledge ──────────────────────────────────
            if ai_intent.intent == IntentType.STATIC_KNOWLEDGE:
                return self._handle_rag(user_id, message)

            # ── Other database intents — honest template ──
            if ai_intent.requires_database:
                return self._handle_database_pending(user_id, message, ai_intent)

            # ── General conversation / guidance ────────────
            return self._handle_llm_only(user_id, message)

        except Exception as e:
            self.session.rollback()
            logger.error("Chat processing failed for user %s: %s", user_id, e)
            raise

    # ────────────────────────────────────────────────────────
    #  CLASSIFY
    # ────────────────────────────────────────────────────────

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
    #  HANDLERS
    # ────────────────────────────────────────────────────────

    def _handle_llm_only(self, user_id: UUID, message: str) -> Dict[str, any]:
        prompt = self._build_prompt(message, [])
        with timed("llm"):
            response = self.gateway.generate_text_sync(
                prompt=prompt, system_prompt=SYSTEM_PROMPT,
            )
        self.chat_log_repo.create_log(
            user_id=user_id, message=message, response=response, sources=None,
        )
        self.session.commit()
        return {"response": response, "sources": []}

    def _handle_rag(self, user_id: UUID, message: str) -> Dict[str, any]:
        with timed("rag"):
            context_docs = self.knowledge_service.retrieve_context(
                message, limit=settings.RAG_TOP_K,
            )
        prompt = self._build_prompt(message, context_docs)
        with timed("llm"):
            response = self.gateway.generate_text_sync(
                prompt=prompt, system_prompt=SYSTEM_PROMPT,
            )
        sources = [d["title"] for d in context_docs if d.get("title")]
        self.chat_log_repo.create_log(
            user_id=user_id, message=message, response=response,
            sources=sources if sources else None,
        )
        self.session.commit()
        return {"response": response, "sources": sources}

    def _handle_search(
        self, user_id: UUID, message: str, ai_intent: AIIntent
    ) -> Dict[str, any]:
        params = ProfessionalSearchParams(
            query=ai_intent.query or message,
            profession=ai_intent.profession,
            location=None,  # we don't have coordinates in chat yet
            city=ai_intent.location,
            radius_km=ai_intent.radius_km,
            verified_only=bool(ai_intent.verified_only),
            available_only=bool(ai_intent.available_only),
            min_rating=ai_intent.min_rating,
            limit=settings.AI_TOOL_PROFESSIONAL_LIMIT,
        )

        with timed("search"):
            result: ProfessionalSearchResult = self.search_service.search(params)

        if result.metadata.total == 0:
            response = (
                "I couldn't find any matching professionals. "
                "Try a different profession, city, or a broader search."
            )
            self.chat_log_repo.create_log(
                user_id=user_id, message=message, response=response, sources=None,
            )
            self.session.commit()
            return {"response": response, "sources": []}

        # LLM writes the lead-in sentence only; frontend renders cards.
        prompt = self._build_search_prompt(message, result)
        with timed("llm"):
            response = self.gateway.generate_text_sync(
                prompt=prompt, system_prompt=SEARCH_FORMAT_SYSTEM_PROMPT,
            )
        self.chat_log_repo.create_log(
            user_id=user_id, message=message, response=response, sources=None,
        )
        self.session.commit()
        return {
            "response": response,
            "sources": [],
            "results": [c.model_dump(mode="json") for c in result.professionals],
        }

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
            return self._handle_llm_only(user_id, message)

        with timed("image"):
            analysis: ImageAnalysis = self.image_service.analyze(
                image_bytes, image_mime, user_text=message,
            )

        # Image understanding only — no DB search requested.
        if ai_intent.intent == IntentType.IMAGE_ANALYSIS:
            prompt = self._build_image_prompt(message, analysis)
            with timed("llm"):
                response = self.gateway.generate_text_sync(
                    prompt=prompt, system_prompt=IMAGE_FORMAT_SYSTEM_PROMPT,
                )
            self.chat_log_repo.create_log(
                user_id=user_id, message=message, response=response, sources=None,
            )
            self.session.commit()
            return {
                "response": response,
                "sources": [],
                "image_analysis": analysis.model_dump(mode="json"),
            }

        # Image-assisted search — use image hypotheses to search.
        params = ProfessionalSearchParams(
            query=(
                ai_intent.query
                or " ".join(analysis.search_terms)
                or analysis.description
            ),
            profession=analysis.possible_profession or ai_intent.profession,
            city=ai_intent.location,
            radius_km=ai_intent.radius_km,
            limit=settings.AI_TOOL_PROFESSIONAL_LIMIT,
        )
        with timed("search"):
            result = self.search_service.search(params)

        if result.metadata.total == 0:
            response = (
                "The image suggests this might involve "
                f"{analysis.possible_profession or 'a specialist'}, but I "
                "couldn't find a matching professional. Try broadening the "
                "location or profession."
            )
            self.chat_log_repo.create_log(
                user_id=user_id, message=message, response=response, sources=None,
            )
            self.session.commit()
            return {
                "response": response,
                "sources": [],
                "image_analysis": analysis.model_dump(mode="json"),
            }

        prompt = self._build_image_search_prompt(message, analysis, result)
        with timed("llm"):
            response = self.gateway.generate_text_sync(
                prompt=prompt, system_prompt=IMAGE_FORMAT_SYSTEM_PROMPT,
            )
        self.chat_log_repo.create_log(
            user_id=user_id, message=message, response=response, sources=None,
        )
        self.session.commit()
        return {
            "response": response,
            "sources": [],
            "results": [c.model_dump(mode="json") for c in result.professionals],
            "image_analysis": analysis.model_dump(mode="json"),
        }

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
        response = templates.get(
            ai_intent.intent,
            "That feature isn't connected to the chat yet.",
        )
        self.chat_log_repo.create_log(
            user_id=user_id, message=message, response=response, sources=None,
        )
        self.session.commit()
        return {"response": response, "sources": []}

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
                parts.append(f"--- Document {i}: {doc.get('title', 'Untitled')} ---")
                parts.append(doc.get("content", ""))
                parts.append("")
            parts.append(
                "Now, answer the user's question below using the above context. "
                "Write a fresh answer in your own words – do not copy the context directly.\n"
            )
        parts.append(f"User's question: {message}")
        return "\n".join(parts)

    def _build_search_prompt(
        self, message: str, result: ProfessionalSearchResult
    ) -> str:
        lines = [
            f"User's question: {message}",
            "",
            "--- TOOL RESULT ---",
            f"RESULTS: {result.metadata.total}",
            f"STRATEGY: {result.metadata.strategy}",
        ]
        for i, c in enumerate(result.professionals[:5], 1):
            parts = [c.name]
            if c.profession: parts.append(c.profession)
            if c.city: parts.append(c.city)
            if c.rating: parts.append(f"{c.rating}★")
            if c.is_verified: parts.append("verified")
            lines.append(f"{i}. " + " | ".join(parts))
        lines.append("--- END TOOL RESULT ---")
        lines.append("")
        lines.append("Write the lead-in sentence only.")
        return "\n".join(lines)

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
            if c.city: parts.append(c.city)
            if c.rating: parts.append(f"{c.rating}★")
            lines.append(f"{i}. " + " | ".join(p for p in parts if p))
        lines.append("--- END TOOL RESULT ---")
        lines.append("")
        lines.append("Write a short lead-in. Frame image interpretation as uncertain.")
        return "\n".join(lines)