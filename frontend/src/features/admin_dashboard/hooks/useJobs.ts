import { useEffect, useState, useCallback } from 'react';
import { jobsService } from '../services/jobsService';
import type { AdminJob, JobStatus } from '../types/admin.types';

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

  const updateStatus = useCallback(async (id: string, status: JobStatus) => {
    await jobsService.updateStatus(id, status);
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));
  }, []);

  return { jobs, loading, error, refetch: load, updateStatus };
};