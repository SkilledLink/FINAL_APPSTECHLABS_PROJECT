import { useState, useEffect } from 'react';
import type{ portfolioApi, PublicPortfolio } from '../api/portfolioApi';

export function usePublicPortfolio(userId: string) {
  const [portfolio, setPortfolio] = useState<PublicPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await portfolioApi.getPublicPortfolio(userId);
        setPortfolio(data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load public portfolio');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId]);

  return { portfolio, loading, error };
}