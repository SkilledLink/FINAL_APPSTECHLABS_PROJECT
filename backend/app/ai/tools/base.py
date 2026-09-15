# app/ai/tools/base.py
from dataclasses import dataclass, field
from typing import Any, Dict, List


@dataclass
class ToolResult:
    """
    Minimal contract every tool returns.

    Fields:
      success : True if the underlying query ran, regardless of hits
      count   : number of results returned
      items   : flat, JSON-safe dicts — no ORM objects
      note    : optional human-readable note (e.g. "no matches")
    """
    success: bool
    count: int
    items: List[Dict[str, Any]] = field(default_factory=list)
    note: str | None = None

    def to_dict(self) -> dict:
        return {
            "success": self.success,
            "count": self.count,
            "items": self.items,
            "note": self.note,
        }

    @classmethod
    def empty(cls, note: str = "no matches") -> "ToolResult":
        return cls(success=True, count=0, items=[], note=note)

    @classmethod
    def failure(cls, note: str = "tool failed") -> "ToolResult":
        return cls(success=False, count=0, items=[], note=note)


def format_tool_result_for_llm(result: ToolResult) -> str:
    """
    Compact plain-text rendering of a ToolResult for the LLM prompt.

    Deliberately terse — every token here costs latency. The LLM only
    needs ids, names, and the few attributes it will mention.
    """
    if not result.success:
        return "TOOL STATUS: failed\nNOTE: " + (result.note or "unknown error")

    if result.count == 0:
        return "TOOL STATUS: ok\nRESULTS: 0\nNOTE: " + (result.note or "no matches found")

    lines = [f"TOOL STATUS: ok", f"RESULTS: {result.count}"]
    for i, item in enumerate(result.items, 1):
        parts = []
        for k, v in item.items():
            if v is None or v == "":
                continue
            parts.append(f"{k}={v}")
        lines.append(f"{i}. " + " | ".join(parts))
    return "\n".join(lines)