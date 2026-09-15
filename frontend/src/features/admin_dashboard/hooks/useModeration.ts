import { useEffect, useState, useCallback } from 'react';
import { moderationService } from '../services/moderationService';
import type { ModerationReport, ReportStatus } from '../types/admin.types';

export const useModeration = () => {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setReports(await moderationService.getAll()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to load reports'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = useCallback(async (id: string, status: ReportStatus) => {
    await moderationService.updateStatus(id, status);
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }, []);

  return { reports, loading, error, refetch: load, updateStatus };
};