import { useEffect, useState, useCallback } from 'react';
import { professionalsService } from '../services/professionalsService';
import type { AdminProfessional, AdminProfessionalDetail } from '../types/moderator.types';

export const useProfessionals = () => {
  const [professionals, setProfessionals] = useState<AdminProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setProfessionals(await professionalsService.getAll()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to load professionals'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fetchOne = useCallback((id: string) => professionalsService.getOne(id), []);

  const suspend = useCallback(async (id: string, reason: string) => {
    await professionalsService.suspend(id, reason);
    setProfessionals((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'suspended' } : p)));
  }, []);

  const reactivate = useCallback(async (id: string, reason: string) => {
    await professionalsService.reactivate(id, reason);
    setProfessionals((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'active' } : p)));
  }, []);

  return { professionals, loading, error, refetch: load, fetchOne, suspend, reactivate };
};