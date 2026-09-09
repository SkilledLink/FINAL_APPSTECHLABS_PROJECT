import { useState, useEffect, useCallback } from 'react';
import type{ portfolioApi, Availability } from '../api/portfolioApi';

export function useAvailability() {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    try {
      setLoading(true);
      const data = await portfolioApi.getAvailability();
      setAvailability(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, []);

  const setAvailabilityData = useCallback(async (data: Parameters<typeof portfolioApi.setAvailability>[0]) => {
    try {
      const updated = await portfolioApi.setAvailability(data);
      setAvailability(updated);
      return updated;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to set availability');
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, []);

  return { availability, loading, error, fetchAvailability, setAvailabilityData };
}