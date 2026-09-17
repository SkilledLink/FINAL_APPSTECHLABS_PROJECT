import { useEffect, useState, useCallback, useRef } from 'react';
import { administratorsService } from '../services/administratorsService';
import type { Administrator } from '../types/admin.types';

const BATCH_SIZE = 5;

export const useAdministrators = () => {
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runIdRef = useRef(0);

  const load = useCallback(async () => {
    const runId = ++runIdRef.current;

    setLoading(true);
    setLoadingMore(false);
    setError(null);
    setAdministrators([]);
    setTotal(0);

    let skip = 0;
    let accumulated: Administrator[] = [];
    let grandTotal: number | null = null;

    try {
      while (true) {
        if (runId !== runIdRef.current) return;

        const { items, total: t } = await administratorsService.getPage(skip, BATCH_SIZE);

        if (runId !== runIdRef.current) return;

        if (grandTotal === null) grandTotal = t;
        if (items.length === 0) break;

        accumulated = accumulated.concat(items);
        setAdministrators(accumulated);
        setTotal(grandTotal);

        if (skip === 0) {
          setLoading(false);
          if (grandTotal > accumulated.length) setLoadingMore(true);
        }

        skip += items.length;

        if (
          grandTotal !== null &&
          (accumulated.length >= grandTotal || items.length < BATCH_SIZE)
        ) {
          break;
        }
      }
    } catch (e) {
      if (runId !== runIdRef.current) return;
      setError(
        e instanceof Error ? e.message : 'Failed to load administrators',
      );
    } finally {
      if (runId === runIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateRole = useCallback(
    async (id: string, isAdmin: boolean, reason: string) => {
      await administratorsService.updateRole(id, isAdmin, reason);
      setAdministrators((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, isAdmin, role: isAdmin ? 'admin' : 'moderator' }
            : a,
        ),
      );
    },
    [],
  );

  return {
    administrators,
    total,
    loading,
    loadingMore,
    error,
    refetch: load,
    updateRole,
  };
};