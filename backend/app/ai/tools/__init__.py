# app/ai/tools/__init__.py
"""
Controlled backend tools for the AI layer.

Every tool:
  * calls an existing repository or service
  * never executes raw SQL
  * never receives an LLM-generated query string
  * returns a small, typed ToolResult — never an ORM object
"""