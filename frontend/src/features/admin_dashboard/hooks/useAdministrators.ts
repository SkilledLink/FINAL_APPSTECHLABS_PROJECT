import { useEffect, useState, useCallback } from 'react';
import { administratorsService } from '../services/administratorsService';
import type { Administrator } from '../types/admin.types';

export const useAdministrators = () => {
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setAdministrators(await administratorsService.getAll()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to load administrators'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { administrators, loading, error, refetch: load };
};