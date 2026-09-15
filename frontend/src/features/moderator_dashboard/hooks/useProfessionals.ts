import { useEffect, useState, useCallback } from 'react';
import { professionalsService } from '../services/professionalsService';
import type { AdminProfessional, ProfessionalStatus } from '../types/moderator.types';

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

  const updateStatus = useCallback(async (id: string, status: ProfessionalStatus) => {
    await professionalsService.updateStatus(id, status);
    setProfessionals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status, verified: status === 'verified' } : p)),
    );
  }, []);

  const warn = useCallback(async (id: string) => {
    await professionalsService.warn(id);
    setProfessionals((prev) => prev.map((p) => (p.id === id ? { ...p, warnings: p.warnings + 1 } : p)));
  }, []);

  return { professionals, loading, error, refetch: load, updateStatus, warn };
};