import { useEffect, useState, useCallback } from 'react';
import { jobsService } from '../services/jobsService';
import type { AdminJob } from '../types/moderator.types';

export const useJobs = () => {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setJobs(await jobsService.getAll()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to load jobs'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { jobs, loading, error, refetch: load };
};