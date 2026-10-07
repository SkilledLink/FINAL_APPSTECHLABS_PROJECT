# app/ai/intent.py
"""
Intent routing foundation for SkilledLink AI.

Deterministic regex-based classifier. No network calls, no DB calls,
<1 ms per request. Returns a validated Pydantic AIIntent.
"""

import logging
import re
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field

from app.ai.profession_inference import infer_profession_for_search

logger = logging.getLogger(__name__)


# ════════════════════════════════════════════════════════════
#  INTENT TYPE
# ════════════════════════════════════════════════════════════

class IntentType(str, Enum):
    GENERAL_CONVERSATION = "general_conversation"
    GENERAL_GUIDANCE = "general_guidance"
    STATIC_KNOWLEDGE = "static_knowledge"

    PROFESSIONAL_SEARCH = "professional_search"
    SERVICE_SEARCH = "service_search"
    JOB_SEARCH = "job_search"
    POST_SEARCH = "post_search"
    USER_SEARCH = "user_search"
    NEARBY_SEARCH = "nearby_search"

    PROFESSIONAL_DETAILS = "professional_details"
    SERVICE_DETAILS = "service_details"
    JOB_DETAILS = "job_details"
    PORTFOLIO_DETAILS = "portfolio_details"

    IMAGE_ANALYSIS = "image_analysis"
    IMAGE_ASSISTED_SEARCH = "image_assisted_search"
    MULTIMODAL_SEARCH = "multimodal_search"


_RAG_INTENTS = {IntentType.STATIC_KNOWLEDGE}

_DB_INTENTS = {
    IntentType.PROFESSIONAL_SEARCH,
    IntentType.SERVICE_SEARCH,
    IntentType.JOB_SEARCH,
    IntentType.POST_SEARCH,
    IntentType.USER_SEARCH,
    IntentType.NEARBY_SEARCH,
    IntentType.PROFESSIONAL_DETAILS,
    IntentType.SERVICE_DETAILS,
    IntentType.JOB_DETAILS,
    IntentType.PORTFOLIO_DETAILS,
    IntentType.IMAGE_ASSISTED_SEARCH,
    IntentType.MULTIMODAL_SEARCH,
}


class AIIntent(BaseModel):
    intent: IntentType
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str = ""

    query: Optional[str] = None
    profession: Optional[str] = None
    service: Optional[str] = None
    skills: Optional[List[str]] = None
    location: Optional[str] = None
    radius_km: Optional[float] = None
    available_only: Optional[bool] = None
    verified_only: Optional[bool] = None
    min_rating: Optional[float] = None
    entity_id: Optional[str] = None

    has_image: bool = False

    @property
    def requires_rag(self) -> bool:
        return self.intent in _RAG_INTENTS

    @property
    def requires_database(self) -> bool:
        return self.intent in _DB_INTENTS


# ════════════════════════════════════════════════════════════
#  WHITELISTS
# ════════════════════════════════════════════════════════════

_PROFESSION_KEYWORDS = (
    "electrician", "plumber", "carpenter", "mechanic", "painter",
    "mason", "welder", "roofer", "tiler", "gardener", "cleaner",
    "driver", "tailor", "hairdresser", "chef", "cook",
    "developer", "designer", "photographer",
    "électricien", "plombier", "charpentier", "mécanicien",
    "peintre", "menuisier", "soudeur", "jardinier",
)

_CITY_KEYWORDS = (
    "douala", "yaoundé", "yaounde", "bamenda", "bafoussam",
    "garoua", "maroua", "ngaoundéré", "ngaoundere", "bertoua",
    "kribi", "limbe", "buea", "ebolowa", "kumba", "nkongsamba",
    "edéa", "edea",
)


def extract_profession(text: str) -> Optional[str]:
    lower = text.lower()
    for kw in _PROFESSION_KEYWORDS:
        if kw in lower:
            return kw
    return None


def extract_city(text: str) -> Optional[str]:
    lower = text.lower()
    for city in _CITY_KEYWORDS:
        if city in lower:
            if city == "yaounde":
                return "Yaoundé"
            if city == "ngaoundere":
                return "Ngaoundéré"
            if city == "edea":
                return "Edéa"
            return city.capitalize()
    return None


# ════════════════════════════════════════════════════════════
#  PATTERNS
# ════════════════════════════════════════════════════════════

_GENERAL_CONVERSATION_PATTERNS: List[tuple[re.Pattern, str]] = [
    (re.compile(r"^\s*(hi|hello|hey|yo|sup|hola|bonjour|salut)\b", re.I), "greeting"),
    (re.compile(r"^\s*good\s+(morning|afternoon|evening|night)\b", re.I), "greeting"),
    (re.compile(r"^\s*(thanks|thank you|thx|ty|cheers|merci)\b", re.I), "thanks"),
    (re.compile(r"^\s*(bye|goodbye|see you|cya|later|au revoir)\b", re.I), "farewell"),
    (re.compile(r"^\s*(ok(ay)?|k|got it|cool|nice|great|awesome|d'accord)\s*[.!]?\s*$", re.I), "ack"),
    (re.compile(r"^\s*(yes|no|maybe|oui|non)\s*[.!]?\s*$", re.I), "ack"),
    (re.compile(r"\b(who|what)\s+are\s+you\b", re.I), "identity"),
    (re.compile(r"\bwhat('s| is)\s+your\s+name\b", re.I), "identity"),
    (re.compile(r"\bhow\s+are\s+you\b", re.I), "chitchat"),
]


_BARE_PROFESSION_PATTERN = re.compile(
    r"^\s*(?:the\s+|a\s+|an\s+)?"
    r"(?:find\s+|search\s+|show\s+me\s+|show\s+|list\s+|get\s+)?"
    r"(?:electricians?|plumbers?|carpenters?|mechanics?|painters?|"
    r"masons?|welders?|roofers?|tilers?|gardeners?|cleaners?|"
    r"drivers?|tailors?|hairdressers?|chefs?|cooks?|"
    r"developers?|designers?|photographers?|"
    r"électriciens?|plombiers?|charpentiers?|mécaniciens?|"
    r"peintres?|menuisiers?|soudeurs?|jardiniers?|"
    r"professionals?|professionnels?)"
    r"(?:\s+(?:in|at|near|dans|à|près de)\s+\S+)?"
    r"\s*[?.!]?\s*$",
    re.I,
)


_PLATFORM_HOWTO = re.compile(
    r"\bhow\s+(do|does|can|should)\s+(i|we)\s+"
    r"(become|register|sign up|get verified|become verified|"
    r"create an account|create a profile|build a portfolio|"
    r"devenir|créer|s'inscrire|obtenir)\b",
    re.I,
)


_NEAR_ME_SIGNAL = re.compile(
    r"\b(near me|nearby|around me|close to me|close by|"
    r"près de moi|proche de moi|autour de moi|à côté de moi)\b",
    re.I,
)

_SEARCH_VERB_SIGNAL = re.compile(
    r"\b(find|search|show|show me|list|get me|looking for|"
    r"i need|i want|trouve|cherche|montre|je cherche|je veux)\b",
    re.I,
)

_PROFESSION_SIGNAL = re.compile(
    r"\b(electrician|plumber|carpenter|mechanic|painter|mason|"
    r"welder|roofer|tiler|gardener|cleaner|driver|tailor|"
    r"hairdresser|chef|cook|developer|designer|photographer|"
    r"professionals?|professionnels?|"
    r"électricien|plombier|charpentier|mécanicien|peintre|"
    r"menuisier|soudeur|jardinier)\b",
    re.I,
)

_SERVICE_SIGNAL = re.compile(
    r"\b(who offers|who does|who provides|who can do|"
    r"qui propose|qui fait|qui offre)\b",
    re.I,
)

_JOB_SIGNAL = re.compile(
    r"\b(jobs?|job openings?|job vacancies?|hiring|"
    r"emplois?|offres? d'emploi|recrutement)\b",
    re.I,
)

_GENERAL_GUIDANCE_SIGNAL = re.compile(
    r"\b(how should i|what should i|any tips|advice|"
    r"what do you recommend|how can i choose|best way to|"
    r"conseil|astuce|comment choisir)\b",
    re.I,
)

_STATIC_KNOWLEDGE_SIGNAL = re.compile(
    r"\b(what is|what's|what are|how do i|how does|how to|"
    r"explain|tell me about|"
    r"qu'est-ce que|comment|explique|"
    r"skilledlink)\b",
    re.I,
)

_IMAGE_UNDERSTAND_SIGNAL = re.compile(
    r"\b(what is this|what's this|what kind of|what type of|"
    r"can you (?:see|tell)|identify|describe (?:this|the) (?:image|photo|picture)|"
    r"c'est quoi|qu'est-ce que c'est|décris|c'est quel)\b",
    re.I,
)

_IMAGE_SEARCH_SIGNAL = re.compile(
    r"\b(who (?:can|should) (?:fix|repair|do|handle|work on)|"
    r"find (?:someone|a professional|a pro|help)|"
    r"i need (?:someone|a pro)|looking for (?:someone|a professional)|"
    r"qui peut (?:réparer|réparer ceci|faire)|"
    r"trouve(?:-moi)? quelqu'un)\b",
    re.I,
)

_RADIUS_PATTERN = re.compile(
    r"\b(\d+(?:[.,]\d+)?)\s*(?:km|kilometers?|kilomètres?)\b",
    re.I,
)

_MIN_RATING_PATTERN = re.compile(
    r"\b(?:at least|min(?:imum)?|>=?)\s*(\d(?:\.\d)?)\s*(?:stars?|étoiles?)?",
    re.I,
)


# ════════════════════════════════════════════════════════════
#  CLASSIFIER
# ════════════════════════════════════════════════════════════

def _build(
    intent: IntentType,
    confidence: float,
    reason: str,
    *,
    has_image: bool = False,
    profession: Optional[str] = None,
    location: Optional[str] = None,
    query: Optional[str] = None,
    radius_km: Optional[float] = None,
    verified_only: Optional[bool] = None,
    available_only: Optional[bool] = None,
    min_rating: Optional[float] = None,
) -> AIIntent:
    return AIIntent(
        intent=intent,
        confidence=confidence,
        reason=reason,
        has_image=has_image,
        profession=profession,
        location=location,
        query=query,
        radius_km=radius_km,
        verified_only=verified_only,
        available_only=available_only,
        min_rating=min_rating,
    )


def classify(message: str, *, has_image: bool = False) -> AIIntent:
    """
    Classify a chat or search message into an AIIntent.

    Never raises. Always returns a validated AIIntent.
    """
    text = (message or "").strip()
    probe = text[:250] if text else ""

    try:
        # ── 0. Image paths ──────────────────────────────────
        if has_image:
            if _IMAGE_SEARCH_SIGNAL.search(probe) or _SEARCH_VERB_SIGNAL.search(probe):
                return _build(
                    IntentType.IMAGE_ASSISTED_SEARCH, 0.85,
                    "image_with_search_intent",
                    has_image=True, query=text,
                )
            if _IMAGE_UNDERSTAND_SIGNAL.search(probe) or not probe:
                return _build(
                    IntentType.IMAGE_ANALYSIS, 0.80,
                    "image_understanding",
                    has_image=True, query=text,
                )
            profession = extract_profession(probe) or None
            location = extract_city(probe)
            radius = _extract_radius(probe)
            return _build(
                IntentType.MULTIMODAL_SEARCH, 0.70,
                "image_plus_text_search",
                has_image=True,
                profession=profession, location=location,
                radius_km=radius, query=text,
            )

        # ── 1. Empty text ───────────────────────────────────
        if not probe:
            return _build(IntentType.GENERAL_CONVERSATION, 1.0, "empty")

        # ── 2. GENERAL_CONVERSATION (greetings, thanks, etc.) ─
        for pattern, reason in _GENERAL_CONVERSATION_PATTERNS:
            if pattern.search(probe):
                return _build(IntentType.GENERAL_CONVERSATION, 0.95, reason)

        # ── 3. Canonical profession inference (run early) ───
        # This is the single source of truth. It normalizes French
        # keywords and covers "wire my house" → Electrician, etc.
        inferred_profession = infer_profession_for_search(probe)

        # ── 4. Bare profession → search ─────────────────────
        if _BARE_PROFESSION_PATTERN.search(probe) or (
            inferred_profession and len(probe.split()) <= 3
        ):
            # Prefer the canonical name from inference when present
            profession = inferred_profession or extract_profession(probe)
            location = extract_city(probe)
            return _build(
                IntentType.PROFESSIONAL_SEARCH, 0.85, "bare_profession",
                profession=profession, location=location,
                query=probe,
            )

        # ── 5. Platform how-to → STATIC_KNOWLEDGE ───────────
        if _PLATFORM_HOWTO.search(probe):
            return _build(IntentType.STATIC_KNOWLEDGE, 0.80, "platform_howto")

        # ── 6. Signal extraction ────────────────────────────
        has_near_me = bool(_NEAR_ME_SIGNAL.search(probe))
        has_search_verb = bool(_SEARCH_VERB_SIGNAL.search(probe))
        has_profession = bool(_PROFESSION_SIGNAL.search(probe))
        has_service = bool(_SERVICE_SIGNAL.search(probe))
        has_job = bool(_JOB_SIGNAL.search(probe))

        profession = inferred_profession or (
            extract_profession(probe) if has_profession else None
        )

        location = extract_city(probe)
        radius = _extract_radius(probe)
        verified_only = (
            True
            if "verified" in probe.lower() or "vérifié" in probe.lower()
            else None
        )
        available_only = (
            True
            if "available" in probe.lower() or "disponible" in probe.lower()
            else None
        )
        min_rating = _extract_min_rating(probe)

        # ── 7. NEARBY_SEARCH ────────────────────────────────
        if has_near_me and (has_search_verb or has_profession or profession):
            return _build(
                IntentType.NEARBY_SEARCH, 0.88, "near_me_signal",
                profession=profession, location=location,
                radius_km=radius, query=text,
                verified_only=verified_only,
                available_only=available_only,
                min_rating=min_rating,
            )

        # ── 8. PROFESSIONAL_SEARCH (with profession) ────────
        if profession and (
            has_search_verb
            or has_service
            or has_near_me
            or len(probe.split()) >= 2
        ):
            reason = (
                "inferred_profession:" + profession.lower()
                if inferred_profession
                else "search_verb_profession"
            )
            return _build(
                IntentType.PROFESSIONAL_SEARCH,
                0.85 if inferred_profession else 0.85,
                reason,
                profession=profession, location=location,
                radius_km=radius, query=text,
                verified_only=verified_only,
                available_only=available_only,
                min_rating=min_rating,
            )

        # ── 9. SERVICE_SEARCH ───────────────────────────────
        if has_service:
            return _build(
                IntentType.SERVICE_SEARCH, 0.80, "service_query",
                location=location, query=text,
            )

        # ── 10. JOB_SEARCH ──────────────────────────────────
        if has_job:
            return _build(
                IntentType.JOB_SEARCH, 0.75, "job_query",
                location=location, query=text,
            )

        # ── 11. GENERAL_GUIDANCE ────────────────────────────
        if _GENERAL_GUIDANCE_SIGNAL.search(probe):
            return _build(IntentType.GENERAL_GUIDANCE, 0.70, "guidance_signal")

        # ── 12. STATIC_KNOWLEDGE ────────────────────────────
        if _STATIC_KNOWLEDGE_SIGNAL.search(probe):
            return _build(IntentType.STATIC_KNOWLEDGE, 0.60, "knowledge_signal")

        # ── 13. Safe default ────────────────────────────────
        return _build(IntentType.GENERAL_CONVERSATION, 0.30, "default")

    except Exception as e:
        logger.warning("intent.classify failed: %s", e)
        return _build(IntentType.GENERAL_CONVERSATION, 0.0, "classifier_error")


def _extract_radius(text: str) -> Optional[float]:
    m = _RADIUS_PATTERN.search(text)
    if not m:
        return None
    try:
        return float(m.group(1).replace(",", "."))
    except ValueError:
        return None


def _extract_min_rating(text: str) -> Optional[float]:
    m = _MIN_RATING_PATTERN.search(text)
    if not m:
        return None
    try:
        v = float(m.group(1))
        return v if 0 <= v <= 5 else None
    except ValueError:
        return None