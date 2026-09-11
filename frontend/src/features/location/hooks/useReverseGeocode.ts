import { useCallback, useState } from 'react';
import { locationService } from '../services/locationService';
import type { ReverseGeocodeResponse } from '../types/location.types';

export function useReverseGeocode() {
  const [result, setResult] = useState<ReverseGeocodeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reverse = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await locationService.reverse(lat, lng);
      setResult(res);
      return res;
    } catch (err: any) {
      setError(err?.message ?? 'Reverse geocoding failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, error, reverse };
}