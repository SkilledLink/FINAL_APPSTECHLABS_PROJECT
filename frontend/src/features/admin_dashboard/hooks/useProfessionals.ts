import { useEffect, useState, useCallback, useRef } from 'react';
import { professionalsService } from '../services/professionalsService';
import type { AdminProfessional, AdminProfessionalDetail } from '../types/admin.types';

const BATCH_SIZE = 5;

export const useProfessionals = () => {
  const [professionals, setProfessionals] = useState<AdminProfessional[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runIdRef = useRef(0);

  const load = useCallback(async () => {
    const runId = ++runIdRef.current;

    setLoading(true);
    setLoadingMore(false);
    setError(null);
    setProfessionals([]);
    setTotal(0);

    let skip = 0;
    let accumulated: AdminProfessional[] = [];
    let grandTotal: number | null = null;

    try {
      while (true) {
        if (runId !== runIdRef.current) return;

        const { items, total: t } = await professionalsService.getPage(skip, BATCH_SIZE);

        if (runId !== runIdRef.current) return;

        if (grandTotal === null) grandTotal = t;
        if (items.length === 0) break;

        accumulated = accumulated.concat(items);
        setProfessionals(accumulated);
        setTotal(grandTotal);

        if (skip === 0) {
          setLoading(false);
          if (grandTotal > accumulated.length) setLoadingMore(true);
        }

        skip += items.length;

        if (
          grandTotal !== null &&
          (accumulated.length >= grandTotal || items.length < BATCH_SIZE)
        ) {
          break;
        }
      }
    } catch (e) {
      if (runId !== runIdRef.current) return;
      setError(e instanceof Error ? e.message : 'Failed to load professionals');
    } finally {
      if (runId === runIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
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
        prev.map((p) => (p.id === id ? { ...p, status: 'deleted' } : p)),
      );
    },
    [],
  );

  return {
    professionals,
    total,
    loading,
    loadingMore,
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