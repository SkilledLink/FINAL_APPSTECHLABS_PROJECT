import { useEffect, useState, useCallback } from 'react';
import { overviewService } from '../services/overviewService';
import type { ModeratorOverviewStats } from '../types/moderator.types';

export const useOverview = () => {
  const [stats, setStats] = useState<ModeratorOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await overviewService.getStats());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { stats, loading, error, refetch: load };
};