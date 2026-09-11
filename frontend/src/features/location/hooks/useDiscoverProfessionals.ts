import { useCallback, useEffect, useRef, useState } from 'react';
import { locationService } from '../services/locationService';
import type {
  DiscoverParams,
  DiscoverProfessional,
  PublicLocation,
} from '../types/location.types';

export interface UseDiscoverProfessionalsResult {
  professionals: DiscoverProfessional[];
  total: number;
  searchCenter: PublicLocation | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDiscoverProfessionals(
  params: DiscoverParams
): UseDiscoverProfessionalsResult {
  const [professionals, setProfessionals] = useState<DiscoverProfessional[]>([]);
  const [total, setTotal] = useState(0);
  const [searchCenter, setSearchCenter] = useState<PublicLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestId = useRef(0);

  // Destructure to primitive-ish values so the effect only fires on real changes.
  const {
    lat = null,
    lng = null,
    radiusKm = 10,
    profession = '',
    verifiedOnly = false,
    availableOnly = true,
    skip = 0,
    limit = 20,
  } = (params as any) || {};

  const hasLocation = lat !== null && lng !== null;

  const fetch_ = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    try {
      const res = await locationService.discover({
        location: hasLocation ? { lat, lng } : null,
        radiusKm,
        profession: profession || undefined,
        verifiedOnly,
        availableOnly,
        skip,
        limit,
      });
      if (id !== requestId.current) return;
      setProfessionals(res.items);
      setTotal(res.total);
      setSearchCenter(res.search_center ?? null);
    } catch (err: any) {
      if (id !== requestId.current) return;
      setError(err?.message ?? 'Failed to load professionals');
      setProfessionals([]);
      setTotal(0);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [lat, lng, radiusKm, profession, verifiedOnly, availableOnly, skip, limit, hasLocation]);

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