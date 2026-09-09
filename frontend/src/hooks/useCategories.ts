import { useState, useEffect } from 'react';
import type{ portfolioApi, Category } from '../api/portfolioApi';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await portfolioApi.getCategories();
        setCategories(data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { categories, loading, error };
}