import logging
from typing import Dict, List, Optional
from uuid import UUID
from sqlmodel import Session

from app.core.config import settings
from app.services.llm_service import LLMService
from app.services.knowledge_service import KnowledgeService
from app.repositories.chat_log_repository import ChatLogRepository

logger = logging.getLogger(__name__)

# System prompt that instructs the bot
SYSTEM_PROMPT = """You are 'SkilledLink Assistant', an AI helper for SkilledLink, a platform connecting skilled workers (electricians, plumbers, carpenters, mechanics, etc.) with customers in Cameroon.

Your role is to answer user questions based on the provided knowledge base context. Follow these guidelines:
- Use the context to answer accurately and helpfully.
- Write a fresh, concise, and friendly response in your own words – do NOT copy the context verbatim.
- If the context doesn't fully answer the question, use your general knowledge but indicate that it's general guidance.
- Keep responses to 2-4 sentences unless the user asks for more detail.
- If you don't know the answer, say so clearly and suggest contacting support.
- Respond in the same language as the user's question (English or French).

Never invent professionals, services, prices, ratings, reviews, availability, verification status, or platform features. If information is unavailable, say so clearly instead of guessing."""

class ChatService:
    def __init__(self, session: Session):
        self.session = session
        self.knowledge_service = KnowledgeService(session)
        self.llm_service = LLMService()
        self.chat_log_repo = ChatLogRepository(session)

    def process_message(self, user_id: UUID, message: str) -> Dict[str, any]:
        """
        Process a user message and return the bot's response.
        """
        try:
            # 1. Retrieve relevant context (RAG)
            context_docs = self.knowledge_service.retrieve_context(message, limit=3)

            # 2. Build the prompt with context
            prompt = self._build_prompt(message, context_docs)

            # 3. Generate response
            response = self.llm_service.generate_response(prompt, SYSTEM_PROMPT)

            # 4. Extract sources from context
            sources = [doc["title"] for doc in context_docs if doc.get("title")]

            # 5. Log the interaction
            self.chat_log_repo.create_log(
                user_id=user_id,
                message=message,
                response=response,
                sources=sources if sources else None
            )

            # 6. Commit the log
            self.session.commit()

            return {
                "response": response,
                "sources": sources
            }

        except Exception as e:
            self.session.rollback()
            logger.error(f"Chat processing failed for user {user_id}: {e}")
            raise

    def _build_prompt(self, message: str, context_docs: List[Dict[str, str]]) -> str:
        """
        Build the prompt to send to the LLM.
        """
        parts = []

        # Add context if available
        if context_docs:
            parts.append("Here is relevant information from our knowledge base:\n")
            for i, doc in enumerate(context_docs, 1):
                parts.append(f"--- Document {i}: {doc.get('title', 'Untitled')} ---")
                parts.append(doc.get("content", ""))
                parts.append("")
            parts.append("Now, answer the user's question below using the above context. Write a fresh answer in your own words – do not copy the context directly.\n")

        # Add the user's message
        parts.append(f"User's question: {message}")

        return "\n".join(parts)