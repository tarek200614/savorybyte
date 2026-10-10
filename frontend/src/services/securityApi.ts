import {
  SecurityArchitectureResponse,
  SecurityEventListResponse,
  SecurityStats,
  SecurityStatusResponse,
  SecurityTestItem,
  SecurityTestRunResponse,
  ThreatVector,
} from '../types/security';
import { apiRequest } from './api';

export const securityApi = {
  /**
   * Fetch live security posture & evaluated defensive controls
   */
  async getStatus(): Promise<SecurityStatusResponse> {
    return apiRequest<SecurityStatusResponse>('/security/status');
  },

  /**
   * Fetch audit trail security events with filtering and pagination
   */
  async getEvents(params: {
    page?: number;
    pageSize?: number;
    severity?: string;
    eventType?: string;
    search?: string;
  } = {}): Promise<SecurityEventListResponse> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.pageSize) query.append('page_size', params.pageSize.toString());
    if (params.severity) query.append('severity', params.severity);
    if (params.eventType) query.append('event_type', params.eventType);
    if (params.search) query.append('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<SecurityEventListResponse>(`/security/events${qs}`);
  },

  /**
   * Fetch security events aggregated statistics
   */
  async getEventStats(): Promise<SecurityStats> {
    return apiRequest<SecurityStats>('/security/events/stats');
  },

  /**
   * Fetch test lab catalog
   */
  async getTestsCatalog(): Promise<SecurityTestItem[]> {
    return apiRequest<SecurityTestItem[]>('/security/tests/catalog');
  },

  /**
   * Execute defensive security test suite in real-time
   */
  async runTests(testId?: string): Promise<SecurityTestRunResponse> {
    const qs = testId ? `?test_id=${encodeURIComponent(testId)}` : '';
    return apiRequest<SecurityTestRunResponse>(`/security/tests/run${qs}`, {
      method: 'POST',
    });
  },

  /**
   * Fetch threat knowledge matrix
   */
  async getThreatMatrix(): Promise<ThreatVector[]> {
    return apiRequest<ThreatVector[]>('/security/threat-matrix');
  },

  /**
   * Fetch security architecture and data flow nodes
   */
  async getArchitecture(): Promise<SecurityArchitectureResponse> {
    return apiRequest<SecurityArchitectureResponse>('/security/architecture');
  },

  /**
   * Reset in-memory brute force lockouts and rate limits (Admin only)
   */
  async resetBruteForce(): Promise<{ status: string; message: string }> {
    return apiRequest<{ status: string; message: string }>('/security/brute-force/reset', {
      method: 'POST',
    });
  },
};
