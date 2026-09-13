from app.services.moderation.provider import ProviderResult


SAFE_MAX = 5
REVIEW_MAX = 8
FAILURE_SEVERITY = 7


def decide(severity: int) -> str:
    if severity <= SAFE_MAX:
        return "safe"
    if severity <= REVIEW_MAX:
        return "review"
    return "unsafe"


def combine(results: list[ProviderResult]) -> ProviderResult:
    """Aggregate multiple provider results into one.

    Rules:
      1. Any failure forces severity >= FAILURE_SEVERITY.
      2. Overall severity = max across valid results.
      3. Confidence = min confidence among items at that max severity.
      4. Categories = union of valid results' categories.
      5. Description/reason taken from the highest-severity valid result.
    """
    if not results:
        return ProviderResult.failure("no_results")

    failures = [r for r in results if r.error]
    valid = [r for r in results if not r.error]

    chosen = None
    max_sev = 0
    min_conf = 0

    if valid:
        max_sev = max(r.severity for r in valid)
        top = [r for r in valid if r.severity == max_sev]
        min_conf = min(r.confidence for r in top)
        chosen = max(top, key=lambda r: r.confidence)

    if failures and max_sev < FAILURE_SEVERITY:
        max_sev = FAILURE_SEVERITY
        min_conf = 0

    if not valid and not failures:
        return ProviderResult.failure("no_results")

    categories = sorted({c for r in valid for c in r.categories})

    provider = chosen.provider if chosen else (failures[0].provider if failures else "")
    model = chosen.model if chosen else (failures[0].model if failures else "")

    error_msg = None
    if failures and not valid:
        error_msg = failures[0].error

    return ProviderResult(
        severity=max_sev,
        confidence=min_conf,
        description=(chosen.description if chosen else "Moderation failed"),
        reason=(chosen.reason if chosen else "Automated check failed"),
        categories=categories,
        raw=None,
        provider=provider,
        model=model,
        error=error_msg,
    )