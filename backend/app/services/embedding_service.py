import logging
from typing import List
import openai
from openai import OpenAI
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.EMBEDDING_MODEL
        self.timeout = 5.0  # seconds

    def generate_embedding(self, text: str) -> List[float]:
        """
        Convert text to a vector embedding using OpenAI.
        Raises Exception if the API call fails or times out.
        """
        if not text or not text.strip():
            # Return a zero vector? Better to raise or handle upstream.
            # We'll raise a ValueError so the caller can handle it.
            raise ValueError("Cannot embed empty text")

        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=text,
                timeout=self.timeout
            )
            # Extract the embedding list
            embedding = response.data[0].embedding
            logger.debug(f"Generated embedding of length {len(embedding)}")
            return embedding
        except openai.APIError as e:
            logger.error(f"OpenAI API error: {e}")
            raise
        except openai.APITimeoutError as e:
            logger.error(f"OpenAI timeout: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error generating embedding: {e}")
            raise