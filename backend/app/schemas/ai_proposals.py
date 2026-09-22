# app/schemas/ai_proposals.py

from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.enums.ai_proposal import ProposalStatus


# ─── SINGLE-ITEM ─────────────────────────────────────────────────

class AIProposalResponse(BaseModel):
    id: UUID
    professional_id: UUID
    feature_key: str
    field_path: str
    current_value: Optional[str] = None
    proposed_value: str
    reason: Optional[str] = None
    impact: str
    status: ProposalStatus
    accepted_value: Optional[str] = None
    accepted_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    expires_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GenerateProposalsResponse(BaseModel):
    proposals: List[AIProposalResponse]
    provider: str
    model: str
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None


class AcceptProposalRequest(BaseModel):
    final_value: Optional[str] = Field(None, min_length=1)


class AcceptProposalResponse(BaseModel):
    proposal: AIProposalResponse
    applied_to: str
    new_value: str


class RejectProposalRequest(BaseModel):
    reason: Optional[str] = Field(None, max_length=500)


class ListProposalsResponse(BaseModel):
    items: List[AIProposalResponse]
    total: int


# ─── BATCH ───────────────────────────────────────────────────────

class BatchAcceptRequest(BaseModel):
    ids: List[UUID] = Field(..., min_length=1)
    final_values: Optional[Dict[str, str]] = None


class BatchRejectRequest(BaseModel):
    ids: List[UUID] = Field(..., min_length=1)
    reason: Optional[str] = Field(None, max_length=500)


class BatchItemResult(BaseModel):
    proposal_id: UUID
    field_path: Optional[str] = None
    applied_to: Optional[str] = None
    new_value: Optional[str] = None
    error: Optional[str] = None


class BatchAcceptResponse(BaseModel):
    accepted: List[BatchItemResult]
    failed: List[BatchItemResult]
    total_accepted: int
    total_failed: int


class BatchRejectResponse(BaseModel):
    rejected: List[BatchItemResult]
    failed: List[BatchItemResult]
    total_rejected: int
    total_failed: int


# ─── BULK ────────────────────────────────────────────────────────

class AcceptAllRequest(BaseModel):
    feature_key: Optional[str] = Field(
        None,
        description="Limit to one feature. Omit to accept all features.",
    )
    final_values: Optional[Dict[str, str]] = None


class RejectAllRequest(BaseModel):
    feature_key: Optional[str] = None
    reason: Optional[str] = Field(None, max_length=500)