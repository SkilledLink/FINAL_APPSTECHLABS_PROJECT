import { useEffect, useState, useCallback } from 'react';
import { overviewService } from '../services/overviewService';
import type {
  ModeratorOverviewStats,
  ModeratorAnalyticsData,
  ModeratorActivityItem,
} from '../types/moderator.types';

export const useOverview = () => {
  const [stats, setStats] = useState<ModeratorOverviewStats | null>(null);
  const [analytics, setAnalytics] = useState<ModeratorAnalyticsData | null>(null);
  const [activity, setActivity] = useState<ModeratorActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, a, ac] = await Promise.all([
        overviewService.getStats(),
        overviewService.getAnalytics(),
        overviewService.getActivity(),
      ]);
      setStats(s);
      setAnalytics(a);
      setActivity(ac);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { stats, analytics, activity, loading, error, refetch: load };
};