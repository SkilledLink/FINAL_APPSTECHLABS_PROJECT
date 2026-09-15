import { useEffect, useState, useCallback } from 'react';
import { auditLogsService } from '../services/auditLogsService';
import type { AuditLog } from '../types/moderator.types';

export const useAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setLogs(await auditLogsService.getAll()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to load audit logs'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { logs, loading, error, refetch: load };
};