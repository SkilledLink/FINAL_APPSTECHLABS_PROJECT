import { useEffect, useState, useCallback, useRef } from 'react';
import { usersService } from '../services/usersService';
import type { AdminUser, AdminUserDetail } from '../types/moderator.types';

const BATCH_SIZE = 3;

export const useUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
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
    setUsers([]);
    setTotal(0);

    let skip = 0;
    let accumulated: AdminUser[] = [];
    let grandTotal: number | null = null;

    try {
      while (true) {
        if (runId !== runIdRef.current) return;

        const { items, total: t } = await usersService.getPage(skip, BATCH_SIZE);

        if (runId !== runIdRef.current) return;
        if (grandTotal === null) grandTotal = t;
        if (items.length === 0) break;

        accumulated = accumulated.concat(items);
        setUsers(accumulated);
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
      setError(e instanceof Error ? e.message : 'Failed to load users');
    } finally {
      if (runId === runIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fetchOne = useCallback((id: string) => usersService.getOne(id), []);

  const suspend = useCallback(async (id: string, reason: string) => {
    await usersService.suspend(id, reason);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'suspended' } : u)),
    );
  }, []);

  const reactivate = useCallback(async (id: string, reason: string) => {
    await usersService.reactivate(id, reason);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'active' } : u)),
    );
  }, []);

  return {
    users,
    total,
    loading,
    loadingMore,
    error,
    refetch: load,
    fetchOne,
    suspend,
    reactivate,
  };
};