import { useEffect, useState, useCallback } from 'react';
import { auditLogsService } from '../services/auditLogsService';
import type { AuditLogFilters } from '../services/auditLogsService';
import type { AuditLog, AuditLogDetail } from '../types/admin.types';

export const useAuditLogs = (filters: AuditLogFilters = {}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // stringify so it's a stable dep
  const filterKey = JSON.stringify(filters);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLogs(await auditLogsService.getAll(filters));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  useEffect(() => {
    load();
  }, [load]);

  const fetchOne = useCallback(
    (id: string) => auditLogsService.getOne(id),
    [],
  );

  return { logs, loading, error, refetch: load, fetchOne };
};