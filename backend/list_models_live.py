# list_models_live.py
"""
List every model the current key + SDK can actually use.
Run:  python list_models_live.py
"""
from app.core.config import settings
from google import genai


def main():
    key = settings.GEMINI_API_KEY or ""
    if not key:
        print("GEMINI_API_KEY is empty")
        return

    client = genai.Client(api_key=key)

    print("=" * 70)
    print("MODELS AVAILABLE TO THIS KEY")
    print("=" * 70)

    try:
        models = list(client.models.list())
    except Exception as e:
        print(f"list failed: {type(e).__name__}: {e}")
        return

    # Group by capability hint based on name
    generative = []
    embedding = []
    other = []

    for m in models:
        name = getattr(m, "name", "") or ""
        if "embedding" in name.lower():
            embedding.append(name)
        elif any(k in name.lower() for k in ("flash", "pro", "gemini")):
            generative.append(name)
        else:
            other.append(name)

    print("\n--- GENERATIVE (chat + vision) ---")
    for n in sorted(generative):
        print(f"  {n}")

    print("\n--- EMBEDDING ---")
    for n in sorted(embedding):
        print(f"  {n}")

    print("\n--- OTHER ---")
    for n in sorted(other):
        print(f"  {n}")

    print()
    print("=" * 70)
    print("Copy the exact name of the model you want (including 'models/' prefix)")
    print("=" * 70)


if __name__ == "__main__":
    main()