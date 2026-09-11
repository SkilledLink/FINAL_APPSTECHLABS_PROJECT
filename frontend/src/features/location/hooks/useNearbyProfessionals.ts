import { useCallback, useEffect, useRef, useState } from 'react';
import { locationService } from '../services/locationService';
import type {
  NearbyProfessional,
  NearbySearchParams,
  PublicLocation,
} from '../types/location.types';

export interface UseNearbyProfessionalsResult {
  professionals: NearbyProfessional[];
  total: number;
  searchCenter: PublicLocation | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useNearbyProfessionals(
  params: NearbySearchParams | null
): UseNearbyProfessionalsResult {
  const [professionals, setProfessionals] = useState<NearbyProfessional[]>([]);
  const [total, setTotal] = useState(0);
  const [searchCenter, setSearchCenter] = useState<PublicLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestId = useRef(0);

  const fetch_ = useCallback(async () => {
    if (!params) {
      setProfessionals([]);
      setTotal(0);
      setSearchCenter(null);
      return;
    }

    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const res = await locationService.findNearby(params);
      if (id !== requestId.current) return;
      setProfessionals(res.items);
      setTotal(res.total);
      setSearchCenter(res.search_center);
    } catch (err: any) {
      if (id !== requestId.current) return;
      setError(err?.message ?? 'Nearby search failed');
      setProfessionals([]);
      setTotal(0);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [
    params?.lat,
    params?.lng,
    params?.radius_km,
    params?.skip,
    params?.limit,
    params?.profession,
    params?.available_only,
    params?.verified_only,
  ]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  return {
    professionals,
    total,
    searchCenter,
    loading,
    error,
    refresh: fetch_,
  };
}