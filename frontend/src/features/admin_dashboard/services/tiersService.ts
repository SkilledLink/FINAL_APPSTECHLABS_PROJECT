// src/features/admin/services/tiersService.ts
import { api } from '../api/api';
import type {
  ProfessionalTier,
  ProfessionalTierDetail,
  TierCreatePayload,
  TierFeature,
  TierFeatureCreatePayload,
  TierFeatureUpdatePayload,
  TierFeatureType,
  TierUpdatePayload,
} from '../types/admin.types';

const toNumber = (v: unknown): number => {
  if (v === null || v === undefined) return 0;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const mapFeature = (f: any): TierFeature => ({
  id: f.id,
  tierId: f.tier_id,
  featureKey: f.feature_key,
  featureName: f.feature_name,
  featureDescription: f.feature_description ?? undefined,
  featureType: (f.feature_type ?? 'boolean') as TierFeatureType,
  featureValue: f.feature_value ?? null,
  isEnabled: !!f.is_enabled,
  createdAt: f.created_at,
  updatedAt: f.updated_at,
});

const mapTier = (t: any): ProfessionalTier => ({
  id: t.id,
  name: t.name,
  level: t.level,
  description: t.description ?? undefined,
  price: toNumber(t.price),
  currency: t.currency,
  durationDays: t.duration_days,
  isActive: !!t.is_active,
  isPublic: !!t.is_public,
  displayOrder: t.display_order ?? 0,
  badgeName: t.badge_name ?? undefined,
  badgeCode: t.badge_code ?? undefined,
  badgeIcon: t.badge_icon ?? undefined,
  badgeColor: t.badge_color ?? undefined,
  badgeSecondaryColor: t.badge_secondary_color ?? undefined,
  badgeShape: t.badge_shape ?? undefined,
  badgeDescription: t.badge_description ?? undefined,
  createdAt: t.created_at,
  updatedAt: t.updated_at,
});

const mapTierDetail = (t: any): ProfessionalTierDetail => ({
  ...mapTier(t),
  features: (t.features ?? []).map(mapFeature),
});

export interface TiersPage {
  items: ProfessionalTierDetail[];
  total: number;
}

export const tiersService = {
  async listPublic(): Promise<TiersPage> {
    const { data } = await api.get('/api/v1/professional-tiers');
    return {
      items: (data.items ?? []).map(mapTierDetail),
      total: data.total ?? 0,
    };
  },

  async listAdmin(params: {
    skip?: number;
    limit?: number;
    includeInactive?: boolean;
  } = {}): Promise<TiersPage> {
    const { data } = await api.get('/api/v1/professional-tiers/admin/all', {
      params: {
        skip: params.skip ?? 0,
        limit: params.limit ?? 50,
        include_inactive: params.includeInactive ?? true,
      },
    });
    return {
      items: (data.items ?? []).map(mapTierDetail),
      total: data.total ?? 0,
    };
  },

  async get(id: string): Promise<ProfessionalTierDetail> {
    const { data } = await api.get(`/api/v1/professional-tiers/${id}`);
    return mapTierDetail(data);
  },

  async create(payload: TierCreatePayload): Promise<ProfessionalTier> {
    const { data } = await api.post(
      '/api/v1/professional-tiers/admin',
      payload,
    );
    return mapTier(data);
  },

  async update(
    id: string,
    payload: TierUpdatePayload,
  ): Promise<ProfessionalTier> {
    const { data } = await api.patch(
      `/api/v1/professional-tiers/admin/${id}`,
      payload,
    );
    return mapTier(data);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/v1/professional-tiers/admin/${id}`);
  },

  // ── Features ─────────────────────────────────────────
  async createFeature(
    tierId: string,
    payload: TierFeatureCreatePayload,
  ): Promise<TierFeature> {
    const { data } = await api.post(
      `/api/v1/professional-tiers/admin/${tierId}/features`,
      payload,
    );
    return mapFeature(data);
  },

  async updateFeature(
    featureId: string,
    payload: TierFeatureUpdatePayload,
  ): Promise<TierFeature> {
    const { data } = await api.patch(
      `/api/v1/professional-tiers/admin/features/${featureId}`,
      payload,
    );
    return mapFeature(data);
  },

  async removeFeature(featureId: string): Promise<void> {
    await api.delete(
      `/api/v1/professional-tiers/admin/features/${featureId}`,
    );
  },
};