import logging
import time
from typing import Optional
from google import genai
from app.core.config import settings

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
            http_options={"timeout": 60000}  # 60 seconds
        )
        self.model = "models/gemini-flash-latest"
        self.max_retries = 2
        self.base_delay = 1.0

    def generate_response(self, prompt: str, system_prompt: str) -> str:
        full_prompt = f"{system_prompt}\n\n{prompt}"
        logger.info(f"Sending prompt to Gemini (length: {len(full_prompt)} chars)")

        for attempt in range(self.max_retries + 1):
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=full_prompt,
                    config={
                        "temperature": 0.7,
                        "top_p": 0.95,
                        "top_k": 40,
                        "max_output_tokens": 300,
                    }
                )

                if response and response.text:
                    return response.text.strip()
                else:
                    logger.warning("Gemini returned empty response")
                    return "I'm sorry, I couldn't generate a response. Please try again."

            except Exception as e:
                logger.error(f"Gemini attempt {attempt + 1} failed: {e}")
                if attempt < self.max_retries:
                    time.sleep(self.base_delay * (2 ** attempt))
                else:
                    # Last attempt failed
                    if "Deadline" in str(e) or "timeout" in str(e).lower():
                        return "The AI service is currently slow. Please try again in a few seconds."
                    return "I'm sorry, I encountered an error. Please try again later."