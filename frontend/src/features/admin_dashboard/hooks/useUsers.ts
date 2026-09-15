import { useEffect, useState, useCallback } from 'react';
import { usersService } from '../services/usersService';
import type { AdminUser } from '../types/admin.types';

export const useUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await usersService.getAll());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  const remove = useCallback(async (id: string, reason: string) => {
    await usersService.remove(id, reason);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: 'deactivated' as any } : u,
      ),
    );
  }, []);

  return { users, loading, error, refetch: load, suspend, reactivate, remove };
};