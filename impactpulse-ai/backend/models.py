"""
ImpactPulse AI — Pydantic Data Models
Defines request/response schemas, organization verification, and task structures.
"""

from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid


def generate_id() -> str:
    """Generate a short unique ID."""
    return uuid.uuid4().hex[:12]


# ── Organization Model (Authorized Enterprise Client) ────────────────────────

class Organization(BaseModel):
    id: str = Field(default_factory=generate_id)
    org_name: str
    business_email: str
    verified: bool = True                          # Verified tick mark
    verification_badge: str = "Verified Enterprise Partner"
    industry: str = "AI Research & Civic Tech"
    registration_id: str = Field(default_factory=lambda: f"ORG-US-{uuid.uuid4().hex[:6].upper()}")
    paypal_account_email: str
    escrow_balance: float = 0.0
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# ── Task Batch (Created & Escrow-Funded by Authorized Organizations) ──────────

class TaskBatch(BaseModel):
    id: str = Field(default_factory=generate_id)
    client_email: str
    organization_name: str = "Verified Enterprise"
    is_verified_org: bool = True
    title: str
    description: str
    verification_criteria: str = "Objective verifiable proof complying with task guidelines."
    task_type: str = "image"                       # image | text | audio
    num_tasks: int
    price_per_task: float = 2.00
    currency: str = "USD"
    total_cost: float = 0.0
    platform_fee: float = 0.0
    worker_payout_per_task: float = 1.60
    paypal_order_id: Optional[str] = None
    paypal_approve_url: Optional[str] = None
    status: str = "pending"                         # pending | funded | active | completed
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class Task(BaseModel):
    id: str = Field(default_factory=generate_id)
    batch_id: str
    organization_name: str = "Verified Enterprise"
    is_verified_org: bool = True
    title: str
    description: str
    verification_criteria: Optional[str] = None
    task_type: str = "image"                       # image | text | audio
    currency: str = "USD"
    status: str = "pending"                         # pending | available | claimed | submitted | needs_review | approved | rejected | appealed | paid
    worker_email: Optional[str] = None
    submission_url: Optional[str] = None
    submission_text: Optional[str] = None
    verification_result: Optional[dict] = None
    fraud_flagged: bool = False
    quality_tier: Optional[str] = None              # high | moderate | insufficient | fraudulent
    needs_manual_review: bool = False
    appeal_text: Optional[str] = None
    appeal_status: Optional[str] = "none"           # none | pending | approved | rejected
    appeal_resolved_by: Optional[str] = None
    appeal_resolved_at: Optional[str] = None
    payout_id: Optional[str] = None
    payout_amount: float = 1.60
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class Worker(BaseModel):
    email: str
    full_name: str = "Contributor"
    paypal_email: str = ""
    total_earned: float = 0.0
    tasks_completed: int = 0
    tasks_rejected: int = 0
    fraud_incidents: int = 0
    rating: float = 5.0
    verified_contributor: bool = True


class PayoutRecord(BaseModel):
    id: str = Field(default_factory=generate_id)
    task_id: str
    worker_email: str
    amount: float
    currency: str = "USD"
    payout_batch_id: Optional[str] = None
    status: str = "success"                        # success | pending | failed | retry_pending
    failure_reason: Optional[str] = None
    retry_count: int = 0
    last_retry_at: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())



# ── External Online Task Model ───────────────────────────────────────────────

class ExternalTask(BaseModel):
    id: str = Field(default_factory=generate_id)
    title: str
    platform: str
    category: str
    estimated_pay: str
    reward_amount: float = 3.50
    currency: str = "USD"
    payout_method: str = "Direct PayPal Payout"
    difficulty: str = "Intermediate"
    description: str
    url: str
    required_skills: List[str] = []
    source: str = "External Aggregator"
    status: str = "available"                    # available | submitted | verified | paid
    worker_email: Optional[str] = None
    worker_paypal: Optional[str] = None
    submission_proof: Optional[str] = None
    verification_result: Optional[dict] = None
    payout_batch_id: Optional[str] = None


# ── AI Provider Configuration Schema ──────────────────────────────────────────

class AiProviderConfig(BaseModel):
    active_provider: str = "default_gemini"      # default_gemini | local_model | custom_cloud
    gemini_model: str = "gemini-3.8-flash"
    has_gemini_key: bool = False
    local_endpoint: str = "http://localhost:11434/v1"
    local_model_name: str = "llama3.2"
    custom_provider: str = "openai"
    custom_model_name: str = "gpt-4o-mini"
    has_custom_key: bool = False
    custom_base_url: str = "https://api.openai.com/v1"


# ── API Request Schemas ──────────────────────────────────────────────────────

class BatchCreateRequest(BaseModel):
    client_email: str
    organization_name: str = "Verified Enterprise"
    title: str
    description: str
    verification_criteria: Optional[str] = "Must submit unambiguous evidence meeting task standards."
    task_type: str = "image"
    num_tasks: int = Field(ge=1, le=1000)
    price_per_task: float = Field(ge=0.50, default=2.00)
    currency: Optional[str] = "USD"


class OrganizationAuthRequest(BaseModel):
    org_name: str
    business_email: str
    paypal_account_email: str
    industry: Optional[str] = "AI & Digital Services"


class WorkerAuthRequest(BaseModel):
    email: str
    full_name: Optional[str] = "Contributor"


class TaskClaimRequest(BaseModel):
    worker_email: str


class TextSubmissionRequest(BaseModel):
    worker_email: str
    submission_text: str
    ai_provider: Optional[str] = None


class ExternalTaskClaimAndSubmitRequest(BaseModel):
    task_id: str
    worker_email: str
    paypal_email: str
    submission_proof: str
    proof_type: str = "text"                     # text | image
    reward_amount: float = Field(default=3.50, ge=0.50)
    currency: Optional[str] = "USD"
    ai_provider: Optional[str] = None            # default_gemini | local_model | custom_cloud


class ApiKeysUpdateRequest(BaseModel):
    paypal_client_id: Optional[str] = None
    paypal_client_secret: Optional[str] = None
    gemini_api_key: Optional[str] = None
    gemini_model: Optional[str] = "gemini-3.8-flash"
    ai_provider: Optional[str] = "default_gemini"
    local_endpoint: Optional[str] = "http://localhost:11434/v1"
    local_model_name: Optional[str] = "llama3.2"
    custom_provider: Optional[str] = "openai"
    custom_api_key: Optional[str] = None
    custom_model_name: Optional[str] = "gpt-4o-mini"
    custom_base_url: Optional[str] = "https://api.openai.com/v1"


class TaskAppealRequest(BaseModel):
    worker_email: str
    appeal_reason: str
    supporting_evidence: Optional[str] = None


class TaskManualReviewRequest(BaseModel):
    reviewer_email: str
    decision: str                                # "approve" | "reject"
    review_notes: Optional[str] = "Manual review decision applied."


class PayoutRetryRequest(BaseModel):
    payout_id: str
    paypal_email: Optional[str] = None


