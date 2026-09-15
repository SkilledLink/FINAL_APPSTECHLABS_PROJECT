# app/ai/__init__.py
"""
SkilledLink AI package.

Public surface:
- AIGateway : provider-agnostic text generation
- providers : Groq (primary), Gemini (fallback)
"""

from app.ai.gateway import AIGateway

__all__ = ["AIGateway"]