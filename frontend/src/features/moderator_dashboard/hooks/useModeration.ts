import { useEffect, useState, useCallback } from 'react';
import { moderationService } from '../services/moderationService';
import type { ModerationReport, ReportStatus } from '../types/moderator.types';

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

  const assign = useCallback(async (id: string, moderatorName: string) => {
    await moderationService.assign(id, moderatorName);
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, assignedTo: moderatorName, status: 'reviewing' } : r)),
    );
  }, []);

  return { reports, loading, error, refetch: load, updateStatus, assign };
};