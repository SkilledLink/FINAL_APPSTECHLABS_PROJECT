import { useState, useEffect, useCallback } from 'react';
import {
  portfolioApi,
  Portfolio,
  Work,
  Service,
  Availability,
  Category,
} from '../../../api/portfolioApi';
import { useAuth } from '../../auth/hooks/useAuth';

// ---------- Portfolio ----------
export function usePortfolio() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await portfolioApi.getMy();
      setPortfolio(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createPortfolio = useCallback(async (data: Parameters<typeof portfolioApi.create>[0]) => {
    try {
      const newPortfolio = await portfolioApi.create(data);
      setPortfolio(newPortfolio);
      return newPortfolio;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to create portfolio');
    }
  }, []);

  const updatePortfolio = useCallback(async (data: Parameters<typeof portfolioApi.update>[0]) => {
    try {
      const updated = await portfolioApi.update(data);
      setPortfolio(updated);
      return updated;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to update portfolio');
    }
  }, []);

  const deletePortfolio = useCallback(async () => {
    try {
      await portfolioApi.delete();
      setPortfolio(null);
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to delete portfolio');
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPortfolio();
    }
  }, [user, fetchPortfolio]);

  return {
    portfolio,
    loading,
    error,
    fetchPortfolio,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
  };
}
