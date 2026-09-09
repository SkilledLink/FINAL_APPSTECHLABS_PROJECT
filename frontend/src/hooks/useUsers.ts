import { useState, useEffect, useCallback, useRef } from 'react';
import { userApi } from '../api/userApi';
import type { User } from '../types/user';
import { useAuth } from '../features/auth/hooks/useAuth';

interface UseUsersOptions {
  skip?: number;
  limit?: number;
  search?: string;
}

export function useUsers(options?: UseUsersOptions) {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const fetchingRef = useRef(false);

  const fetchUsers = useCallback(async (opts?: UseUsersOptions) => {
    // Guard: only fetch if authenticated and not already fetching
    if (!isAuthenticated() || !user || fetchingRef.current) {
      setLoading(false);
      return;
    }

    const params = { ...options, ...opts };
    try {
      fetchingRef.current = true;
      setLoading(true);
      const response = await userApi.listUsers({
        skip: params.skip || 0,
        limit: params.limit || 50,
        search: params.search || undefined,
      });
      setUsers(response.items);
      setTotal(response.total);
      setError(null);
    } catch (err: any) {
      // If 401, let the interceptor handle it; just set error and don't retry
      setError(err.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [options, isAuthenticated, user]);

  useEffect(() => {
    // Only fetch once auth is resolved and user exists
    if (isAuthenticated() && user) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [fetchUsers, isAuthenticated, user]);

  return { users, loading, error, total, fetchUsers };
}