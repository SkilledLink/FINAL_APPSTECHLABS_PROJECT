import logging
from typing import List

from google import genai

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Module-level singleton client ────────────────────────────
_gemini_client: genai.Client | None = None


def _client() -> genai.Client:
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
            http_options={"timeout": 60000},
        )
    return _gemini_client


class EmbeddingService:
    """
    Shared embedding service used by both AI Search (indexing + query)
    and the Chatbot (RAG). Do not change without testing both.
    """

    def __init__(self):
        self.client = _client()
        self.model = "models/gemini-embedding-2"
        self.dimension = 768

    def generate_embedding(self, text: str) -> List[float]:
        if not text or not text.strip():
            raise ValueError("Cannot embed empty text")

        try:
            response = self.client.models.embed_content(
                model=self.model,
                contents=text,
                config={"output_dimensionality": self.dimension},
            )
            embedding = response.embeddings[0].values
            logger.debug("Generated embedding of length %d", len(embedding))
            return embedding
        except Exception as e:
            logger.error("Gemini embedding error: %s", e)
            raise