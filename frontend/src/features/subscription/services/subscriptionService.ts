// src/features/subscription/services/subscriptionService.ts
import { apiClient } from '../../../api/client';
import type {
  ActiveSubscriptionResponse,
  AIUsageResponse,
  BatchAcceptResponse,
  BatchRejectResponse,
  DeepAnalysisResponse,
  Entitlements,
  ListProposalsResponse,
  PaymentInitiateRequest,
  PaymentInitiateResponse,
  PaymentStatusResponse,
  TierDetail,
  TierListResponse,
} from '../types/subscription.types';

/* ── Typed API error ────────────────────────────────────
 * Preserves the HTTP status (so callers can check `status === 429`)
 * and the server-advertised retry window from the `Retry-After`
 * header (seconds) so the UI can show an accurate countdown.
 */
export class SubscriptionApiError extends Error {
  status?: number;
  detail?: unknown;
  retryAfter?: number; // seconds

  constructor(
    message: string,
    options: {
      status?: number;
      detail?: unknown;
      retryAfter?: number;
    } = {}
  ) {
    super(message);
    this.name = 'SubscriptionApiError';
    this.status = options.status;
    this.detail = options.detail;
    this.retryAfter = options.retryAfter;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }
}

function toMessage(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail ?? err?.response?.data?.message;
  if (!detail) return err?.message || fallback;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => d?.msg ?? JSON.stringify(d)).join(', ');
  }
  return JSON.stringify(detail);
}

/**
 * Parse `Retry-After`. The spec allows either a number of seconds
 * or an HTTP-date. We support both, preferring seconds.
 */
function parseRetryAfter(raw: unknown): number | undefined {
  if (raw == null) return undefined;
  const str = String(raw).trim();

  // Numeric seconds
  const asNumber = Number(str);
  if (Number.isFinite(asNumber) && asNumber >= 0) {
    return Math.ceil(asNumber);
  }

  // HTTP-date
  const asDate = Date.parse(str);
  if (!Number.isNaN(asDate)) {
    const seconds = Math.ceil((asDate - Date.now()) / 1000);
    return seconds > 0 ? seconds : 0;
  }

  return undefined;
}

/** Centralized request wrapper: normalizes all errors into SubscriptionApiError. */
async function request<T>(
  fn: () => Promise<{ data: T }>,
  fallbackMessage: string
): Promise<T> {
  try {
    const { data } = await fn();
    return data;
  } catch (err: any) {
    const status: number | undefined = err?.response?.status;
    const headers = err?.response?.headers ?? {};
    const retryAfter =
      parseRetryAfter(headers['retry-after']) ??
      parseRetryAfter(headers['Retry-After']) ??
      parseRetryAfter(err?.response?.data?.retry_after);

    throw new SubscriptionApiError(toMessage(err, fallbackMessage), {
      status,
      detail: err?.response?.data?.detail,
      retryAfter,
    });
  }
}

export const subscriptionService = {
  /* ── Subscription + entitlements ────────────────────── */

  getActive(): Promise<ActiveSubscriptionResponse> {
    return request(
      () => apiClient.get<ActiveSubscriptionResponse>(
        '/api/v1/professional-subscriptions/me'
      ),
      'Failed to load subscription'
    );
  },

  getEntitlements(): Promise<Entitlements> {
    return request(
      () => apiClient.get<Entitlements>(
        '/api/v1/professional-subscriptions/me/entitlements'
      ),
      'Failed to load entitlements'
    );
  },

  getHistory() {
    return request(
      () => apiClient.get('/api/v1/professional-subscriptions/me/history'),
      'Failed to load subscription history'
    );
  },

  /* ── Tiers ─────────────────────────────────────────── */

  listTiers(): Promise<TierListResponse> {
    return request(
      () => apiClient.get<TierListResponse>('/api/v1/professional-tiers'),
      'Failed to load tiers'
    );
  },

  getTier(tierId: string): Promise<TierDetail> {
    return request(
      () => apiClient.get<TierDetail>(`/api/v1/professional-tiers/${tierId}`),
      'Failed to load tier'
    );
  },

  /* ── Payments ──────────────────────────────────────── */

  initiatePayment(
    payload: PaymentInitiateRequest
  ): Promise<PaymentInitiateResponse> {
    return request(
      () => apiClient.post<PaymentInitiateResponse>(
        '/api/v1/professional-payments/initiate',
        payload
      ),
      'Failed to initiate payment'
    );
  },

  /**
   * Poll MTN MoMo (via our backend) for the current status of a payment.
   *
   * `reference` is the value returned as `payment.reference` from
   * initiatePayment — for MTN this is the UUID sent as X-Reference-Id.
   */
  getPaymentStatus(reference: string): Promise<PaymentStatusResponse> {
    return request(
      () => apiClient.get<PaymentStatusResponse>(
        `/api/v1/professional-payments/status/${reference}`
      ),
      'Failed to check payment status'
    );
  },

  /* ── AI Proposals ──────────────────────────────────── */

  generateProposals(): Promise<{ proposals: unknown[] }> {
    return request(
      () => apiClient.post('/api/v1/ai/profile-proposals/generate'),
      'Failed to generate proposals'
    );
  },

  listProposals(
    status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'superseded' = 'pending'
  ): Promise<ListProposalsResponse> {
    return request(
      () => apiClient.get<ListProposalsResponse>(
        '/api/v1/ai/profile-proposals',
        { params: { status } }
      ),
      'Failed to load proposals'
    );
  },

  acceptProposal(id: string, finalValue?: string) {
    return request(
      () => apiClient.post(
        `/api/v1/ai/profile-proposals/${id}/accept`,
        finalValue ? { final_value: finalValue } : {}
      ),
      'Failed to accept proposal'
    );
  },

  rejectProposal(id: string, reason?: string) {
    return request(
      () => apiClient.post(
        `/api/v1/ai/profile-proposals/${id}/reject`,
        reason ? { reason } : {}
      ),
      'Failed to reject proposal'
    );
  },

  acceptBatch(
    ids: string[],
    finalValues?: Record<string, string>
  ): Promise<BatchAcceptResponse> {
    return request(
      () => apiClient.post<BatchAcceptResponse>(
        '/api/v1/ai/profile-proposals/accept-batch',
        { ids, final_values: finalValues }
      ),
      'Failed to accept proposals'
    );
  },

  rejectBatch(
    ids: string[],
    reason?: string
  ): Promise<BatchRejectResponse> {
    return request(
      () => apiClient.post<BatchRejectResponse>(
        '/api/v1/ai/profile-proposals/reject-batch',
        { ids, reason }
      ),
      'Failed to reject proposals'
    );
  },

  /* ── AI usage ──────────────────────────────────────── */

  getAIUsage(): Promise<AIUsageResponse> {
    return request(
      () => apiClient.get<AIUsageResponse>('/api/v1/ai/usage'),
      'Failed to load AI usage'
    );
  },

  /* ── Deep analysis ─────────────────────────────────── */

  runDeepAnalysis(): Promise<DeepAnalysisResponse> {
    return request(
      () => apiClient.post<DeepAnalysisResponse>(
        '/api/v1/ai/portfolio-deep-analysis',
        {}
      ),
      'Deep analysis failed'
    );
  },
};