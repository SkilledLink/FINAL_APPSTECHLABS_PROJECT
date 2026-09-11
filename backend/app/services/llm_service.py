import logging
import time
from google import genai
from google.genai import types
from app.core.config import settings

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
            http_options={"timeout": 60000}  # 60s
        )
        self.model = "models/gemini-flash-latest"
        self.max_retries = 2
        self.base_delay = 1.0

    def generate_response(self, prompt: str, system_prompt: str) -> str:
        full_prompt = f"{system_prompt}\n\n{prompt}"
        logger.info(
            f"Sending prompt to Gemini (length: {len(full_prompt)} chars)"
        )

        last_error = None

        for attempt in range(self.max_retries + 1):
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=full_prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.7,
                        top_p=0.95,
                        top_k=40,
                        max_output_tokens=2048,
                        thinking_config=types.ThinkingConfig(
                            thinking_budget=0
                        ),
                    ),
                )

                if response and response.text:
                    return response.text.strip()

                logger.warning("Gemini returned empty response")
                return "I'm sorry, I couldn't generate a response. Please try again."

            except Exception as e:
                error_message = str(e)
                last_error = e

                logger.error(
                    f"Gemini attempt {attempt + 1} failed: {error_message}"
                )

                # Do not retry when the Gemini quota has been exhausted.
                if (
                    "429" in error_message
                    or "RESOURCE_EXHAUSTED" in error_message
                    or "quota" in error_message.lower()
                ):
                    logger.warning(
                        "Gemini quota exhausted. Skipping remaining retries."
                    )
                    return (
                        "The AI assistant has temporarily reached its usage "
                        "limit. Please try again later."
                    )

                # Retry temporary service failures.
                if (
                    "503" in error_message
                    or "UNAVAILABLE" in error_message
                ):
                    if attempt < self.max_retries:
                        delay = self.base_delay * (2 ** attempt)
                        logger.info(
                            f"Gemini temporarily unavailable. "
                            f"Retrying in {delay:.1f}s..."
                        )
                        time.sleep(delay)
                        continue

                    return (
                        "The AI service is temporarily overloaded. "
                        "Please try again in a moment."
                    )

                # Retry timeout/deadline errors.
                if (
                    "Deadline" in error_message
                    or "timeout" in error_message.lower()
                ):
                    if attempt < self.max_retries:
                        delay = self.base_delay * (2 ** attempt)
                        logger.info(
                            f"Gemini request timed out. "
                            f"Retrying in {delay:.1f}s..."
                        )
                        time.sleep(delay)
                        continue

                    return (
                        "The AI service is currently slow. "
                        "Please try again in a few seconds."
                    )

                # Retry other unexpected errors only if attempts remain.
                if attempt < self.max_retries:
                    delay = self.base_delay * (2 ** attempt)
                    logger.info(
                        f"Retrying Gemini request in {delay:.1f}s..."
                    )
                    time.sleep(delay)

        logger.error(f"All Gemini attempts failed: {last_error}")
        return "I'm sorry, I encountered an error. Please try again later."
