# app/ai/scope_guard.py
"""
Fast, LLM-free scope guard for the SkilledLink Assistant.

DEFAULT-DENY policy:
  A message is only allowed through if it either
    (a) matches a short greeting / thanks / bye, or
    (b) contains a strong SkilledLink signal, or
    (c) matches a search-shaped pattern ("find me a ...").

Everything else — coding, math, homework, general knowledge,
jailbreaks, and any ambiguous off-topic text — is refused BEFORE
the LLM is called, so no tokens are spent on it.
"""

from __future__ import annotations

import re
from dataclasses import dataclass


# ─────────────────────────────────────────────────────────────
#  OFF-TOPIC PATTERNS (hard block, checked first)
# ─────────────────────────────────────────────────────────────

_CODE_WORDS = (
    r"(code|coding|program|programming|script|snippet|function|"
    r"class|method|api|endpoint|query|sql|regex|algorithm|"
    r"bug|debug|compile|syntax|variable|loop|array|object|"
    r"python|javascript|typescript|java|rust|golang|php|ruby|"
    r"react|vue|angular|svelte|next\.?js|node|django|flask|"
    r"fastapi|express|tailwind|html|css|scss|bash|shell|"
    r"docker|kubernetes|git|github|gitlab|postgres|mysql|"
    r"mongodb|redis|sqlalchemy|sqlmodel|pydantic|uvicorn|"
    r"pytest|unittest|jest|vite|webpack|npm|yarn|pnpm)"
)
_CODE_HINT = re.compile(rf"\b{_CODE_WORDS}\b", re.I)

_OFF_TOPIC_PATTERNS: list[re.Pattern[str]] = [
    # Fenced code blocks
    re.compile(r"```"),

    # "help me code", "write code", "give me a script", etc.
    re.compile(
        r"\b(help|show|give|write|generate|create|make|build|"
        r"fix|debug|explain|refactor|optimi[sz]e|convert|review|"
        r"complete|finish|rewrite|send|provide|need|want)\b"
        r".{0,40}\b(code|coding|program|script|snippet|function|"
        r"class|method|api|endpoint|query|sql|regex|algorithm)\b",
        re.I,
    ),

    # Any programming language mentioned alone is suspicious
    re.compile(
        r"\b(python|javascript|typescript|java|rust|golang|php|ruby|"
        r"react|vue|angular|svelte|django|flask|fastapi|express|"
        r"tailwind|sqlalchemy|sqlmodel|psycopg|uvicorn|supabase\s+"
        r"(sdk|client|connection|pool|session))\b",
        re.I,
    ),

    # Math expression alone
    re.compile(r"^\s*[\d\s\+\-\*/\(\)\.\^]+\s*\??\s*$"),
    re.compile(
        r"\b(solve|calculate|compute|integrate|differentiate|"
        r"simplify|factor|expand)\b.*\b(equation|integral|"
        r"derivative|matrix|limit|polynomial)\b",
        re.I,
    ),

    # Homework / school
    re.compile(
        r"\b(homework|assignment|essay|thesis|dissertation|"
        r"book report|literature review|exam|quiz)\b",
        re.I,
    ),

    # General knowledge / news / trivia
    re.compile(
        r"\b(who (is|was|are)|what is the capital|"
        r"tell me about (history|science|biology|chemistry|physics)|"
        r"explain (quantum|relativity|photosynthesis|gravity))\b",
        re.I,
    ),
    re.compile(
        r"\b(recipe for|weather in|stock price|crypto price|bitcoin|"
        r"nba|nfl|premier league|world cup|celebrity|movie|"
        r"president of|prime minister of)\b",
        re.I,
    ),

    # Creative writing
    re.compile(
        r"\b(write|compose|create|tell)\b.*\b(poem|song|story|"
        r"essay|joke|rap|lyrics|novel|screenplay|fanfic)\b",
        re.I,
    ),

    # Translation
    re.compile(
        r"\btranslate\b.*\b(to|into)\b.*\b(english|french|spanish|"
        r"german|chinese|japanese|arabic)\b",
        re.I,
    ),

    # Jailbreak / role override
    re.compile(
        r"\b(ignore (all|previous|prior|above) (instructions|rules|"
        r"prompts)|you are now|pretend (to be|you are)|"
        r"act as (a |an )?(?!skilledlink|assistant)|"
        r"forget (your|all) (rules|instructions)|"
        r"developer mode|jailbreak)\b",
        re.I,
    ),
]


# ─────────────────────────────────────────────────────────────
#  IN-SCOPE SIGNALS
# ─────────────────────────────────────────────────────────────

_SKILLEDLINK_TERMS: frozenset[str] = frozenset({
    "skilledlink", "skill link", "skillhub", "skill hub",

    # Trades / roles
    "plumber", "plumbing", "electrician", "electrical", "carpenter",
    "carpentry", "mechanic", "painter", "painting", "welder",
    "mason", "masonry", "tailor", "hairdresser", "barber",
    "cleaner", "cleaning", "driver", "gardener", "roofer",
    "roofing", "roof", "tiler", "tiling", "technician",
    "contractor", "freelancer", "artisan", "handyman",
    "specialist", "expert", "provider", "worker", "professional",

    # Platform actions & features
    "hire", "hiring", "hired", "book", "booking", "quote",
    "quotes", "service", "services", "request", "requests",
    "job", "jobs", "task", "tasks", "gig", "gigs",
    "profile", "profiles", "portfolio", "review", "reviews",
    "rating", "ratings", "verified", "verification",
    "availability", "available", "search", "discovery",
    "dashboard", "account", "signup", "sign up", "register",
    "registration", "login", "log in", "logout", "message",
    "messages", "chat", "notification", "notifications",
    "onboarding", "become a professional", "add a service",
    "add services", "my services", "platform",

    # Locations
    "cameroon", "douala", "yaounde", "yaoundé", "buea", "bamenda",
    "garoua", "maroua", "kribi", "limbe", "bafoussam",
    "ngaoundere", "kumba", "edea", "bertoua",
})

_SHORT_CHAT = re.compile(
    r"^(hi|hello|hey|yo|sup|thanks|thank you|thx|ok|okay|bye|"
    r"goodbye|good (morning|afternoon|evening|night)|bonjour|"
    r"salut|merci|au revoir|bonsoir)[\s!.,?]*$",
    re.I,
)

_SEARCH_PATTERNS = re.compile(
    r"\b(find|search|looking for|look for|recommend|show me|"
    r"where can i find|i need (a |an |someone|somebody)|"
    r"i want (a |an |someone|somebody)|help me find|"
    r"get me (a |an )?)\b",
    re.I,
)


# ─────────────────────────────────────────────────────────────
#  PUBLIC API
# ─────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class ScopeDecision:
    allowed: bool
    reason: str  # "empty" | "greeting" | "off_topic" | "in_scope"
    matched: str | None = None


def check_scope(message: str) -> ScopeDecision:
    text = (message or "").strip()
    if not text:
        return ScopeDecision(False, "empty")

    # 1) Short greeting / thanks / bye.
    if _SHORT_CHAT.match(text):
        return ScopeDecision(True, "greeting")

    # 2) Hard-block off-topic patterns.
    for pattern in _OFF_TOPIC_PATTERNS:
        m = pattern.search(text)
        if m:
            return ScopeDecision(False, "off_topic", matched=m.group(0)[:60])

    lowered = text.lower()
    has_skilledlink = any(t in lowered for t in _SKILLEDLINK_TERMS)
    has_code = bool(_CODE_HINT.search(text))

    # 3) Code signal without a SkilledLink anchor → deny.
    if has_code and not has_skilledlink:
        return ScopeDecision(
            False, "off_topic", matched="code-without-platform-signal"
        )

    # 4) Search-shaped wording → allow.
    if _SEARCH_PATTERNS.search(text):
        return ScopeDecision(True, "in_scope")

    # 5) Strong SkilledLink signal → allow.
    if has_skilledlink:
        return ScopeDecision(True, "in_scope")

    # 6) Very short ambiguous → allow (likely follow-ups).
    if len(text.split()) <= 3:
        return ScopeDecision(True, "in_scope")

    # 7) DEFAULT: DENY. If none of the above matched, this is
    #    off-topic for the platform assistant.
    return ScopeDecision(False, "off_topic", matched="no-skilledlink-signal")


# ─────────────────────────────────────────────────────────────
#  CANNED RESPONSES
# ─────────────────────────────────────────────────────────────

OFF_TOPIC_RESPONSE = (
    "I'm the SkilledLink Assistant, so I can only help with "
    "SkilledLink-related questions — finding professionals, "
    "managing your profile, services, requests, reviews, or "
    "using the platform.\n\n"
    "I can't help with coding, homework, or general questions.\n\n"
    "Try something like:\n"
    "• \"Find me an electrician in Douala\"\n"
    "• \"How do I become a professional?\"\n"
    "• \"What is professional verification?\""
)

GREETING_RESPONSE = (
    "Hi 👋 I'm the SkilledLink Assistant. Tell me what you need — "
    "a professional, a service, or help with your account — and "
    "I'll point you in the right direction."
)

THANKS_RESPONSE = (
    "You're welcome! Let me know if you need help finding a "
    "professional or using SkilledLink."
)

BYE_RESPONSE = "Goodbye! Come back anytime you need a professional. 👋"