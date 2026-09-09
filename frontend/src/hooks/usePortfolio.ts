import { useState, useEffect, useCallback } from 'react';
import { portfolioApi } from '../api/portfolioApi';
import type { Portfolio } from '../types/portfolio';
import { useAuth } from '../features/auth/hooks/useAuth';

export function usePortfolio() {
  const { user, authLoading, isAuthenticated } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    // Don't fetch if not authenticated or user not loaded
    if (!isAuthenticated() || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching portfolio for user:', user.id);
      
      const data = await portfolioApi.getMy();
      console.log('✅ Portfolio data received:', data);
      setPortfolio(data);
    } catch (err: any) {
      console.error('❌ Error fetching portfolio:', err);
      
      // If 404, it means no portfolio yet – that's fine
      if (err.response?.status === 404) {
        setPortfolio(null);
        setError(null);
      } else {
        // For 400, 500, etc., show error
        setError(err.response?.data?.detail || 'Failed to load portfolio');
      }
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

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

  // Wait for auth to be resolved, then fetch
  useEffect(() => {
    if (!authLoading) {
      fetchPortfolio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  return { portfolio, loading, error, fetchPortfolio, createPortfolio, updatePortfolio, deletePortfolio };
}