// src/features/admin/hooks/useTiers.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { tiersService } from '../services/tiersService';
import type {
  ProfessionalTier,
  ProfessionalTierDetail,
  TierCreatePayload,
  TierFeature,
  TierFeatureCreatePayload,
  TierFeatureUpdatePayload,
  TierUpdatePayload,
} from '../types/admin.types';

export const useTiers = () => {
  const [tiers, setTiers] = useState<ProfessionalTierDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const runIdRef = useRef(0);

  const load = useCallback(async () => {
    const runId = ++runIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const { items, total: t } = await tiersService.listAdmin({
        skip: 0,
        limit: 100,
        includeInactive: true,
      });
      if (runId !== runIdRef.current) return;
      setTiers(items);
      setTotal(t);
    } catch (e) {
      if (runId !== runIdRef.current) return;
      setError(e instanceof Error ? e.message : 'Failed to load tiers');
    } finally {
      if (runId === runIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refreshOne = useCallback(async (id: string) => {
    const detail = await tiersService.get(id);
    setTiers((prev) => prev.map((t) => (t.id === id ? detail : t)));
    return detail;
  }, []);

  const createTier = useCallback(
    async (payload: TierCreatePayload) => {
      const tier = await tiersService.create(payload);
      const detail = await tiersService.get(tier.id);
      setTiers((prev) =>
        [...prev, detail].sort(
          (a, b) =>
            a.displayOrder - b.displayOrder || a.level - b.level,
        ),
      );
      setTotal((n) => n + 1);
      return detail;
    },
    [],
  );

  const updateTier = useCallback(
    async (id: string, payload: TierUpdatePayload) => {
      await tiersService.update(id, payload);
      const detail = await tiersService.get(id);
      setTiers((prev) => prev.map((t) => (t.id === id ? detail : t)));
      return detail;
    },
    [],
  );

  const deleteTier = useCallback(async (id: string) => {
    await tiersService.remove(id);
    setTiers((prev) => prev.filter((t) => t.id !== id));
    setTotal((n) => Math.max(0, n - 1));
  }, []);

  // ── Features ───────────────────────────────────────────
  const createFeature = useCallback(
    async (tierId: string, payload: TierFeatureCreatePayload) => {
      const feature = await tiersService.createFeature(tierId, payload);
      setTiers((prev) =>
        prev.map((t) =>
          t.id === tierId
            ? { ...t, features: [...t.features, feature] }
            : t,
        ),
      );
      return feature;
    },
    [],
  );

  const updateFeature = useCallback(
    async (
      tierId: string,
      featureId: string,
      payload: TierFeatureUpdatePayload,
    ) => {
      const updated = await tiersService.updateFeature(featureId, payload);
      setTiers((prev) =>
        prev.map((t) =>
          t.id === tierId
            ? {
                ...t,
                features: t.features.map((f) =>
                  f.id === featureId ? updated : f,
                ),
              }
            : t,
        ),
      );
      return updated;
    },
    [],
  );

  const deleteFeature = useCallback(
    async (tierId: string, featureId: string) => {
      await tiersService.removeFeature(featureId);
      setTiers((prev) =>
        prev.map((t) =>
          t.id === tierId
            ? {
                ...t,
                features: t.features.filter((f) => f.id !== featureId),
              }
            : t,
        ),
      );
    },
    [],
  );

  return {
    tiers,
    total,
    loading,
    error,
    refetch: load,
    refreshOne,
    createTier,
    updateTier,
    deleteTier,
    createFeature,
    updateFeature,
    deleteFeature,
  };
};