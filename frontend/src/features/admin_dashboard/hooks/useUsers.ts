import { useEffect, useState, useCallback } from 'react';
import { usersService } from '../services/usersService';
import type { AdminUser, UserStatus } from '../types/admin.types';

export const useUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setUsers(await usersService.getAll()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to load users'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = useCallback(async (id: string, status: UserStatus) => {
    await usersService.updateStatus(id, status);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
  }, []);

  return { users, loading, error, refetch: load, updateStatus };
};