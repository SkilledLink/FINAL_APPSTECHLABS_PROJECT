# diagnose_gemini.py
"""
Gemini multi-model diagnostic.
Tests text + vision against several candidate models to find
which ones respond reliably from your network.
Run:  python diagnose_gemini.py
"""
import sys
import time
import traceback

from app.core.config import settings


CANDIDATE_MODELS = [
    "models/gemini-2.5-flash",
    "models/gemini-3.6-flash",
    "models/gemini-3.8-flash",
    "models/gemini-flash-latest",
]

# Increase per-call timeout — 60s gives slow links room to breathe.
CLIENT_TIMEOUT_MS = 60_000


def header(title: str):
    print("\n" + "=" * 70)
    print(title)
    print("=" * 70)


def test_text(client, model: str) -> tuple[bool, str, float]:
    """Returns (ok, msg, seconds)."""
    start = time.perf_counter()
    try:
        resp = client.models.generate_content(
            model=model,
            contents="Reply with the single word: OK",
        )
        elapsed = time.perf_counter() - start
        text = (resp.text or "").strip()
        return True, f"text={text!r}", elapsed
    except Exception as e:
        elapsed = time.perf_counter() - start
        return False, f"{type(e).__name__}: {str(e)[:120]}", elapsed


def test_vision(client, model: str) -> tuple[bool, str, float]:
    """Vision call with a tiny 1x1 JPEG."""
    from google.genai import types

    tiny_jpeg = bytes.fromhex(
        "ffd8ffe000104a46494600010100000100010000ffdb004300080606070605080707"
        "070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c23"
        "1c1c2837292c30313434341f27393d38323c2e333432"
        "ffc0000b080001000101011100ffc4001f00000105010101010101000000000000"
        "00000102030405060708090a0b"
        "ffc400b5100002010303020403050504040000017d010203000411051221314106"
        "13516107227114328191a1082342b1c11552d1f02433627282090a161718191a25"
        "262728292a3435363738393a434445464748494a535455565758595a6364656667"
        "68696a737475767778797a838485868788898a92939495969798999aa2a3a4a5a6"
        "a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae1"
        "e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9fa"
        "ffda000c03010002110311003f00fefe28a28a00ffd9"
    )
    start = time.perf_counter()
    try:
        resp = client.models.generate_content(
            model=model,
            contents=[
                types.Part.from_bytes(data=tiny_jpeg, mime_type="image/jpeg"),
                "Describe this image in one word.",
            ],
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=64,
            ),
        )
        elapsed = time.perf_counter() - start
        return True, f"vision={resp.text!r}", elapsed
    except Exception as e:
        elapsed = time.perf_counter() - start
        return False, f"{type(e).__name__}: {str(e)[:120]}", elapsed


def main():
    header("CONFIG")
    print(f"GEMINI_API_KEY      : prefix={settings.GEMINI_API_KEY[:6]!r} len={len(settings.GEMINI_API_KEY)}")
    print(f"GEMINI_CHAT_MODEL   : {settings.GEMINI_CHAT_MODEL}")
    print(f"GEMINI_IMAGE_MODEL  : {getattr(settings, 'GEMINI_IMAGE_MODEL', '(not set)')}")

    try:
        from google import genai
        import google.genai as genai_module
        print(f"google-genai version: {getattr(genai_module, '__version__', 'unknown')}")
    except Exception:
        print("❌ cannot import google-genai")
        traceback.print_exc()
        return

    key = settings.GEMINI_API_KEY or ""
    if not key:
        print("\n❌ GEMINI_API_KEY empty.")
        return

    client = genai.Client(
        api_key=key,
        http_options={"timeout": CLIENT_TIMEOUT_MS},
    )

    results = {}

    # ── Text tests across all candidates ───────────────────
    header("TEXT CALLS — one per candidate model")
    for model in CANDIDATE_MODELS:
        ok, msg, secs = test_text(client, model)
        mark = "✅" if ok else "❌"
        print(f"{mark} {model:40}  {secs:5.2f}s  {msg}")
        results[model] = ok

    working = [m for m, ok in results.items() if ok]
    if not working:
        print("\n❌ No text model responded. This is a network or key issue.")
        print("   Try: ping generativelanguage.googleapis.com")
        print("   Or:  curl -v https://generativelanguage.googleapis.com")
        return

    print(f"\n✅ Text working on: {working}")

    # ── Vision test on the first working model ─────────────
    header(f"VISION CALL — using {working[0]}")
    ok, msg, secs = test_vision(client, working[0])
    print(f"{'✅' if ok else '❌'} {working[0]:40}  {secs:5.2f}s  {msg}")

    # ── JSON-mode vision test ──────────────────────────────
    if ok:
        header(f"JSON-MODE VISION — using {working[0]}")
        from google.genai import types
        tiny_jpeg = bytes.fromhex(
            "ffd8ffe000104a46494600010100000100010000ffdb004300080606070605080707"
            "070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c23"
            "1c1c2837292c30313434341f27393d38323c2e333432"
            "ffc0000b080001000101011100ffc4001f00000105010101010101000000000000"
            "00000102030405060708090a0b"
            "ffc400b5100002010303020403050504040000017d010203000411051221314106"
            "13516107227114328191a1082342b1c11552d1f02433627282090a161718191a25"
            "262728292a3435363738393a434445464748494a535455565758595a6364656667"
            "68696a737475767778797a838485868788898a92939495969798999aa2a3a4a5a6"
            "a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae1"
            "e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9fa"
            "ffda000c03010002110311003f00fefe28a28a00ffd9"
        )
        start = time.perf_counter()
        try:
            resp = client.models.generate_content(
                model=working[0],
                contents=[
                    types.Part.from_bytes(data=tiny_jpeg, mime_type="image/jpeg"),
                    'Return strict JSON: {"description": "one word"}',
                ],
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    max_output_tokens=64,
                    response_mime_type="application/json",
                ),
            )
            secs = time.perf_counter() - start
            print(f"✅ JSON-mode ok  {secs:.2f}s  {resp.text!r}")
        except Exception as e:
            secs = time.perf_counter() - start
            print(f"❌ JSON-mode failed  {secs:.2f}s  {type(e).__name__}: {str(e)[:150]}")

    header("SUMMARY")
    print("Working text models:")
    for m in working:
        print(f"  - {m}")
    print()
    print("Recommendation: set GEMINI_CHAT_MODEL and GEMINI_IMAGE_MODEL")
    print(f"to the fastest model in the working list — likely {working[0]!r}.")


if __name__ == "__main__":
    try:
        main()
    except Exception:
        traceback.print_exc()
        sys.exit(1)