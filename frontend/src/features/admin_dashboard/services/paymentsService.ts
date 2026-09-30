// src/features/admin/services/paymentsService.ts
import { api } from '../api/api';
import type {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  ProfessionalPaymentAdmin,
} from '../types/admin.types';

const toNumber = (v: unknown): number => {
  if (v === null || v === undefined) return 0;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const mapPayment = (p: any): ProfessionalPaymentAdmin => ({
  id: p.id,
  userId: p.user_id,
  professionalId: p.professional_id ?? undefined,
  tierId: p.tier_id,
  subscriptionId: p.subscription_id ?? undefined,
  reference: p.reference,
  provider: (p.provider ?? '') as PaymentProvider | string,
  providerTransactionId: p.provider_transaction_id ?? undefined,
  amount: toNumber(p.amount),
  currency: p.currency ?? 'XAF',
  status: (p.status ?? 'PENDING') as PaymentStatus | string,
  paymentMethod: (p.payment_method ?? '') as PaymentMethod | string,
  description: p.description ?? undefined,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
  paidAt: p.paid_at ?? undefined,
  failedAt: p.failed_at ?? undefined,
  providerResponse: p.provider_response ?? null,
  extraMetadata: p.extra_metadata ?? null,
});

export interface PaymentsPage {
  items: ProfessionalPaymentAdmin[];
  total: number;
}

export interface PaymentFilters {
  professionalId?: string;
  status?: PaymentStatus;
  provider?: PaymentProvider;
}

export const paymentsService = {
  async getPage(
    skip: number,
    limit: number,
    filters: PaymentFilters = {},
  ): Promise<PaymentsPage> {
    const params: Record<string, unknown> = { skip, limit };
    if (filters.professionalId) params.professional_id = filters.professionalId;

    const { data } = await api.get(
      '/api/v1/professional-payments/admin/all',
      { params },
    );
    return {
      items: (data.items ?? []).map(mapPayment),
      total: data.total ?? 0,
    };
  },

  async getAll(limit = 500): Promise<ProfessionalPaymentAdmin[]> {
    const { items } = await this.getPage(0, limit);
    return items;
  },

  async refund(id: string, reason: string): Promise<ProfessionalPaymentAdmin> {
    const { data } = await api.post(
      `/api/v1/professional-payments/admin/${id}/refund`,
      { reason },
    );
    return mapPayment(data);
  },
};