import logging
from typing import List
from google import genai
from app.core.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Shared embedding service used by both AI Search (indexing + query)
    and the Chatbot (RAG). Do not change without testing both.
    """
    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
            http_options={"timeout": 60000}  # 60 seconds
        )
        self.model = "models/gemini-embedding-2"
        self.dimension = 768

    def generate_embedding(self, text: str) -> List[float]:
        """
        Convert text to a 768-dim vector using Gemini.
        Raises Exception if the API call fails.
        """
        if not text or not text.strip():
            raise ValueError("Cannot embed empty text")

        try:
            response = self.client.models.embed_content(
                model=self.model,
                contents=text,
                config={"output_dimensionality": self.dimension}
            )
            embedding = response.embeddings[0].values
            logger.debug(f"Generated embedding of length {len(embedding)}")
            return embedding
        except Exception as e:
            logger.error(f"Gemini embedding error: {e}")
            raise