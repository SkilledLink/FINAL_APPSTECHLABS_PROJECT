import google.generativeai as genai
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

print("Available models that support generateContent:")
for model in genai.list_models():
    if "generateContent" in model.supported_generation_methods:
        print(f"  ✓ {model.name}")