import { useEffect, useState, useCallback } from 'react';
import { professionalsService } from '../services/professionalsService';
import type { AdminProfessional, AdminProfessionalDetail } from '../types/admin.types';

export const useProfessionals = () => {
  const [professionals, setProfessionals] = useState<AdminProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProfessionals(await professionalsService.getAll());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load professionals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const fetchOne = useCallback(
    (id: string) => professionalsService.getOne(id),
    [],
  );

  const verify = useCallback(
    async (
      id: string,
      newStatus: 'manual_approved' | 'manual_rejected',
      reason: string,
    ) => {
      await professionalsService.verify(id, newStatus, reason);
      setProfessionals((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                verificationStatus: newStatus,
                isVerified: newStatus === 'manual_approved',
              }
            : p,
        ),
      );
    },
    [],
  );

  const suspend = useCallback(async (id: string, reason: string) => {
    await professionalsService.suspend(id, reason);
    setProfessionals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'suspended' } : p)),
    );
  }, []);

  const reactivate = useCallback(async (id: string, reason: string) => {
    await professionalsService.reactivate(id, reason);
    setProfessionals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'active' } : p)),
    );
  }, []);

  const flag = useCallback(async (id: string, reason: string, notes?: string) => {
    await professionalsService.flag(id, reason, notes);
    setProfessionals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFlagged: true } : p)),
    );
  }, []);

  const unflag = useCallback(async (id: string, reason: string) => {
    await professionalsService.unflag(id, reason);
    setProfessionals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFlagged: false } : p)),
    );
  }, []);

  const updateTrustScore = useCallback(
    async (id: string, newScore: number, reason: string) => {
      await professionalsService.updateTrustScore(id, newScore, reason);
      setProfessionals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, trustScore: newScore } : p)),
      );
    },
    [],
  );

  const remove = useCallback(
    async (
      id: string,
      reason: string,
      deletionType: 'self' | 'admin' | 'gdpr' | 'ban' = 'admin',
    ) => {
      await professionalsService.remove(id, reason, deletionType);
      setProfessionals((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: 'deleted' }
            : p,
        ),
      );
    },
    [],
  );

  return {
    professionals,
    loading,
    error,
    refetch: load,
    fetchOne,
    verify,
    suspend,
    reactivate,
    flag,
    unflag,
    updateTrustScore,
    remove,
  };
};