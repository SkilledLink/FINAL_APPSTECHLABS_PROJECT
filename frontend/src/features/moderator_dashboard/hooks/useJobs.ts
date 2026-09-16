import { useEffect, useState, useCallback } from 'react';
import { jobsService } from '../services/jobsService';
import type { AdminJob, AdminJobDetail } from '../types/moderator.types';

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

  const fetchOne = useCallback((id: string) => jobsService.getOne(id), []);

  const remove = useCallback(async (id: string, reason: string) => {
    await jobsService.remove(id, reason);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }, []);

  const removeComment = useCallback(async (jobId: string, commentId: string, reason: string) => {
    await jobsService.removeComment(commentId, reason);
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, comments: Math.max(0, j.comments - 1) } : j)));
  }, []);

  return { jobs, loading, error, refetch: load, fetchOne, remove, removeComment };
};