// src/features/user_profile/hooks/useProfessional.ts

import { useState, useEffect, useCallback } from 'react';
import type { Professional } from '../types/user.types';
import { userService } from '../services/userService';

interface UseProfessionalOptions {
  autoFetch?: boolean;
}

interface UseProfessionalReturn {
  professional: Professional | null;
  loading: boolean;
  error: string | null;
  fetchProfessional: (
    professionalId: string
  ) => Promise<Professional | null>;
  fetchMyProfessional: () => Promise<Professional | null>;
  createProfessional: (
    data: Partial<Professional>
  ) => Promise<Professional | null>;
  updateProfessional: (
    data: Partial<Professional>
  ) => Promise<Professional | null>;
}

export const useProfessional = (
  options: UseProfessionalOptions = {}
): UseProfessionalReturn => {
  const { autoFetch = false } = options;
  const [professional, setProfessional] =
    useState<Professional | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfessional = useCallback(
    async (_professionalId: string): Promise<Professional | null> => {
      setLoading(true);
      setError(null);
      try {
        // TODO: wire up to backend
        const data = await userService.getProfessionalByUserId('u1');
        setProfessional(data);
        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch professional';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchMyProfessional = useCallback(
    async (): Promise<Professional | null> => {
      setLoading(true);
      setError(null);
      try {
        // TODO: wire up to backend
        const data = await userService.getProfessionalByUserId('u1');
        setProfessional(data);
        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch professional';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createProfessional = useCallback(
    async (
      data: Partial<Professional>
    ): Promise<Professional | null> => {
      setLoading(true);
      setError(null);
      try {
        // TODO: wire up to backend
        const created = await userService.createProfessional(data);
        setProfessional(created);
        return created;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to create professional';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateProfessional = useCallback(
    async (
      data: Partial<Professional>
    ): Promise<Professional | null> => {
      setLoading(true);
      setError(null);
      try {
        // TODO: wire up to backend
        const updated = await userService.updateProfessional(data);
        setProfessional(updated);
        return updated;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to update professional';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (autoFetch) {
      fetchMyProfessional();
    }
  }, [autoFetch, fetchMyProfessional]);

  return {
    professional,
    loading,
    error,
    fetchProfessional,
    fetchMyProfessional,
    createProfessional,
    updateProfessional,
  };
};