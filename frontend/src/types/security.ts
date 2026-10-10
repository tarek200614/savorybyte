export type SecurityEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'UNAUTHORIZED_ACCESS'
  | 'FORBIDDEN_ACCESS'
  | 'RATE_LIMIT_TRIGGERED'
  | 'VALIDATION_FAILURE'
  | 'SUSPICIOUS_REQUEST'
  | 'CSRF_REJECTED'
  | 'ADMIN_ACTION'
  | 'SECURITY_TEST_RUN';

export type SecuritySeverity = 'INFO' | 'NOTICE' | 'WARNING' | 'HIGH' | 'CRITICAL';

export interface SecurityControlStatus {
  control_id: string;
  name: string;
  category: string;
  status: 'PROTECTED' | 'CONFIGURED' | 'MONITORED' | 'NEEDS_REVIEW';
  summary: string;
  technical_implementation: string;
  verification_method: string;
  last_verified: string | null;
  evidence: string;
}

export interface SecurityStatusResponse {
  overall_posture: string;
  active_defensive_controls: number;
  total_evaluated_controls: number;
  controls: SecurityControlStatus[];
  system_timestamp: string;
  server_environment: string;
}

export interface SecurityEvent {
  id: string;
  event_type: SecurityEventType;
  severity: SecuritySeverity;
  actor_id: string | null;
  actor_email: string | null;
  actor_ip: string | null;
  target_type: string | null;
  target_id: string | null;
  request_id: string | null;
  details: string | null;
  created_at: string;
  updated_at: string;
}

export interface SecurityEventListResponse {
  items: SecurityEvent[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SecurityStats {
  total_events: number;
  events_last_24h: number;
  high_critical_count: number;
  active_lockouts_count: number;
  by_severity: Record<string, number>;
  by_type: Record<string, number>;
}

export interface SecurityTestItem {
  test_id: string;
  name: string;
  category: string;
  target_defense: string;
  attack_simulation: string;
  expected_outcome: string;
}

export interface SecurityTestResult {
  test_id: string;
  name: string;
  category: string;
  passed: boolean;
  status_code: number;
  execution_time_ms: number;
  request_id: string;
  simulated_payload: string;
  evidence: string;
  defense_mechanism: string;
}

export interface SecurityTestRunResponse {
  summary: string;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  results: SecurityTestResult[];
  executed_at: string;
}

export interface ThreatVector {
  id: string;
  name: string;
  category: string;
  severity: string;
  cwe_reference: string | null;
  status: 'PROTECTED' | 'MONITORED' | 'NOT_APPLICABLE' | 'NEEDS_REVIEW';
  description: string;
  impact_surface: string;
  savorybyte_defense: string;
  verification_test: string;
  detection_behavior: string;
}

export interface ArchitectureNode {
  id: string;
  title: string;
  layer: string;
  description: string;
  active_controls: string[];
  threats_addressed: string[];
}

export interface SecurityArchitectureResponse {
  title: string;
  description: string;
  layers: ArchitectureNode[];
}
