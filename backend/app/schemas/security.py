import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict

from app.models.security import SecurityEventType, SecuritySeverity
from app.schemas.user import UserOut


class SecurityEventBase(BaseModel):
    event_type: SecurityEventType
    severity: SecuritySeverity = SecuritySeverity.INFO
    actor_email: str | None = None
    actor_ip: str | None = None
    target_type: str | None = None
    target_id: str | None = None
    request_id: str | None = None
    details: str | None = None


class SecurityEventCreate(SecurityEventBase):
    actor_id: uuid.UUID | None = None


class SecurityEventOut(SecurityEventBase):
    id: uuid.UUID
    actor_id: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime
    actor: UserOut | None = None

    model_config = ConfigDict(from_attributes=True)


class SecurityEventListResponse(BaseModel):
    items: list[SecurityEventOut]
    total: int
    page: int
    page_size: int
    total_pages: int


class SecurityStatsOut(BaseModel):
    total_events: int
    events_last_24h: int
    high_critical_count: int
    active_lockouts_count: int
    by_severity: dict[str, int]
    by_type: dict[str, int]
    recent_activity_trend: list[dict[str, Any]]


class SecurityControlStatus(BaseModel):
    control_id: str
    name: str
    category: str
    status: str  # 'PROTECTED' | 'CONFIGURED' | 'MONITORED' | 'NEEDS_REVIEW'
    summary: str
    technical_implementation: str
    verification_method: str
    last_verified: datetime | None = None
    evidence: str


class SecurityStatusOut(BaseModel):
    overall_posture: str
    active_defensive_controls: int
    total_evaluated_controls: int
    controls: list[SecurityControlStatus]
    system_timestamp: datetime
    server_environment: str


class SecurityTestItem(BaseModel):
    test_id: str
    name: str
    category: str
    target_defense: str
    attack_simulation: str
    expected_outcome: str


class SecurityTestResultOut(BaseModel):
    test_id: str
    name: str
    category: str
    passed: bool
    status_code: int
    execution_time_ms: float
    request_id: str
    simulated_payload: str
    evidence: str
    defense_mechanism: str


class SecurityTestRunResponse(BaseModel):
    summary: str
    total_tests: int
    passed_tests: int
    failed_tests: int
    results: list[SecurityTestResultOut]
    executed_at: datetime


class ThreatVector(BaseModel):
    id: str
    name: str
    category: str
    severity: str
    cwe_reference: str | None = None
    status: str  # 'PROTECTED' | 'MONITORED' | 'NOT_APPLICABLE' | 'NEEDS_REVIEW'
    description: str
    impact_surface: str
    savorybyte_defense: str
    verification_test: str
    detection_behavior: str


class ArchitectureNode(BaseModel):
    id: str
    title: str
    layer: str
    description: str
    active_controls: list[str]
    threats_addressed: list[str]


class SecurityArchitectureOut(BaseModel):
    title: str
    description: str
    layers: list[ArchitectureNode]
