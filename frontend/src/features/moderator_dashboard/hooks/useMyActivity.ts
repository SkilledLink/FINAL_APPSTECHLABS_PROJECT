import { useEffect, useState, useCallback } from 'react';
import { myActivityService } from '../services/myActivityService';
import type { ActivityFilters } from '../services/myActivityService';
import type { ActivityLog, ActivityLogDetail } from '../types/moderator.types';

export const useMyActivity = (filters: ActivityFilters = {}) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterKey = JSON.stringify(filters);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setLogs(await myActivityService.getAll(filters)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to load activity'); }
    finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  useEffect(() => { load(); }, [load]);

  const fetchOne = useCallback((id: string) => myActivityService.getOne(id), []);

  return { logs, loading, error, refetch: load, fetchOne };
};