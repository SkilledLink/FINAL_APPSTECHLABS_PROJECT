// src/features/profile/hooks/useProfessional.ts

import { useState, useEffect, useCallback } from 'react';
import type { Professional } from '../types/profile.types';

interface UseProfessionalOptions {
  autoFetch?: boolean;
}

interface UseProfessionalReturn {
  professional: Professional | null;
  loading: boolean;
  error: string | null;
  fetchProfessional: (professionalId: string) => Promise<Professional | null>;
  fetchMyProfessional: () => Promise<Professional | null>;
  createProfessional: (data: Partial<Professional>) => Promise<Professional | null>;
  updateProfessional: (data: Partial<Professional>) => Promise<Professional | null>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useProfessional = (options: UseProfessionalOptions = {}): UseProfessionalReturn => {
  const { autoFetch = false } = options;
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchProfessional = useCallback(async (professionalId: string): Promise<Professional | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/professionals/${professionalId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch professional: ${response.status}`);
      }

      const data = await response.json();
      setProfessional(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch professional';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyProfessional = useCallback(async (): Promise<Professional | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/professionals/me`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 404) {
        // No professional profile yet – not an error
        setProfessional(null);
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch professional: ${response.status}`);
      }

      const data = await response.json();
      setProfessional(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch professional';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProfessional = useCallback(async (data: Partial<Professional>): Promise<Professional | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/professionals/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create professional: ${response.status}`);
      }

      const created = await response.json();
      setProfessional(created);
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create professional';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfessional = useCallback(async (data: Partial<Professional>): Promise<Professional | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/professionals/me`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update professional: ${response.status}`);
      }

      const updated = await response.json();
      setProfessional(updated);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update professional';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount if enabled
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