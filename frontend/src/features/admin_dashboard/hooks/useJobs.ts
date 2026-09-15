import { useEffect, useState, useCallback } from 'react';
import { jobsService } from '../services/jobsService';
import type { AdminJob } from '../types/admin.types';

export const useJobs = () => {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setJobs(await jobsService.getAll());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = useCallback(async (id: string, reason: string, hard = false) => {
    await jobsService.remove(id, reason, hard);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }, []);

  return { jobs, loading, error, refetch: load, remove };
};