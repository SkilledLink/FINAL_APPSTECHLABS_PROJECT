// src/features/subscription/services/subscriptionService.ts
import { apiClient } from '../../../api/client';
import type {
  ActiveSubscriptionResponse,
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

function toMessage(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail ?? err?.response?.data?.message;
  if (!detail) return err?.message || fallback;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => d?.msg ?? JSON.stringify(d)).join(', ');
  }
  return JSON.stringify(detail);
}

export const subscriptionService = {
  /* ── Subscription + entitlements ────────────────────── */

  async getActive(): Promise<ActiveSubscriptionResponse> {
    try {
      const { data } = await apiClient.get<ActiveSubscriptionResponse>(
        '/api/v1/professional-subscriptions/me'
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to load subscription'));
    }
  },

  async getEntitlements(): Promise<Entitlements> {
    try {
      const { data } = await apiClient.get<Entitlements>(
        '/api/v1/professional-subscriptions/me/entitlements'
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to load entitlements'));
    }
  },

  async getHistory() {
    try {
      const { data } = await apiClient.get(
        '/api/v1/professional-subscriptions/me/history'
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to load subscription history'));
    }
  },

  /* ── Tiers ─────────────────────────────────────────── */

  async listTiers(): Promise<TierListResponse> {
    try {
      const { data } = await apiClient.get<TierListResponse>(
        '/api/v1/professional-tiers'
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to load tiers'));
    }
  },

  async getTier(tierId: string): Promise<TierDetail> {
    try {
      const { data } = await apiClient.get<TierDetail>(
        `/api/v1/professional-tiers/${tierId}`
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to load tier'));
    }
  },

  /* ── Payments ──────────────────────────────────────── */

  async initiatePayment(
    payload: PaymentInitiateRequest
  ): Promise<PaymentInitiateResponse> {
    try {
      const { data } = await apiClient.post<PaymentInitiateResponse>(
        '/api/v1/professional-payments/initiate',
        payload
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to initiate payment'));
    }
  },

  /**
   * Poll MTN MoMo (via our backend) for the current status of a payment.
   *
   * `reference` is the value returned as `payment.reference` from
   * initiatePayment — for MTN this is the UUID sent as X-Reference-Id.
   *
   * Backend maps it to the provider's UUID via
   * `payment.provider_transaction_id` before querying MTN.
   */
  async getPaymentStatus(
    reference: string
  ): Promise<PaymentStatusResponse> {
    try {
      const { data } = await apiClient.get<PaymentStatusResponse>(
        `/api/v1/professional-payments/status/${reference}`
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to check payment status'));
    }
  },

  /* ── AI Proposals ──────────────────────────────────── */

  async generateProposals(): Promise<{ proposals: unknown[] }> {
    try {
      const { data } = await apiClient.post(
        '/api/v1/ai/profile-proposals/generate'
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to generate proposals'));
    }
  },

  async listProposals(
    status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'superseded' = 'pending'
  ): Promise<ListProposalsResponse> {
    try {
      const { data } = await apiClient.get<ListProposalsResponse>(
        '/api/v1/ai/profile-proposals',
        { params: { status } }
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to load proposals'));
    }
  },

  async acceptProposal(id: string, finalValue?: string) {
    try {
      const { data } = await apiClient.post(
        `/api/v1/ai/profile-proposals/${id}/accept`,
        finalValue ? { final_value: finalValue } : {}
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to accept proposal'));
    }
  },

  async rejectProposal(id: string, reason?: string) {
    try {
      const { data } = await apiClient.post(
        `/api/v1/ai/profile-proposals/${id}/reject`,
        reason ? { reason } : {}
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to reject proposal'));
    }
  },

  async acceptBatch(
    ids: string[],
    finalValues?: Record<string, string>
  ): Promise<BatchAcceptResponse> {
    try {
      const { data } = await apiClient.post<BatchAcceptResponse>(
        '/api/v1/ai/profile-proposals/accept-batch',
        { ids, final_values: finalValues }
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to accept proposals'));
    }
  },

  async rejectBatch(ids: string[], reason?: string): Promise<BatchRejectResponse> {
    try {
      const { data } = await apiClient.post<BatchRejectResponse>(
        '/api/v1/ai/profile-proposals/reject-batch',
        { ids, reason }
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to reject proposals'));
    }
  },

  /* ── Deep analysis ─────────────────────────────────── */

  async runDeepAnalysis(): Promise<DeepAnalysisResponse> {
    try {
      const { data } = await apiClient.post<DeepAnalysisResponse>(
        '/api/v1/ai/portfolio-deep-analysis',
        {}
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Deep analysis failed'));
    }
  },
};