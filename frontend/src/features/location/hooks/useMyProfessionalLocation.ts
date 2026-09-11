import { useCallback, useEffect, useState } from 'react';
import { locationService } from '../services/locationService';
import type {
  ProfessionalLocation,
  ProfessionalLocationInput,
  ServiceArea,
  ServiceAreaInput,
} from '../types/location.types';

export interface UseMyProfessionalLocationResult {
  location: ProfessionalLocation | null;
  serviceAreas: ServiceArea[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setLocation: (input: ProfessionalLocationInput) => Promise<ProfessionalLocation | null>;
  updateLocation: (
    input: Partial<ProfessionalLocationInput>
  ) => Promise<ProfessionalLocation | null>;
  deleteLocation: () => Promise<boolean>;
  createServiceArea: (input: ServiceAreaInput) => Promise<ServiceArea | null>;
  updateServiceArea: (
    areaId: string,
    input: Partial<ServiceAreaInput> & { status?: 'active' | 'paused' }
  ) => Promise<ServiceArea | null>;
  deleteServiceArea: (areaId: string) => Promise<boolean>;
}

export function useMyProfessionalLocation(
  enabled: boolean
): UseMyProfessionalLocationResult {
  const [location, setLocationState] = useState<ProfessionalLocation | null>(null);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const [loc, areas] = await Promise.all([
        locationService.getMyLocation(),
        locationService.listServiceAreas(),
      ]);
      setLocationState(loc);
      setServiceAreas(areas.items);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load your location');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setLocation = useCallback(async (input: ProfessionalLocationInput) => {
    setSaving(true);
    setError(null);
    try {
      const res = await locationService.setMyLocation(input);
      setLocationState(res);
      return res;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save location');
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateLocation = useCallback(
    async (input: Partial<ProfessionalLocationInput>) => {
      setSaving(true);
      setError(null);
      try {
        const res = await locationService.updateMyLocation(input);
        setLocationState(res);
        return res;
      } catch (err: any) {
        setError(err?.message ?? 'Failed to update location');
        return null;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const deleteLocation = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await locationService.deleteMyLocation();
      setLocationState(null);
      return true;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete location');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const createServiceArea = useCallback(async (input: ServiceAreaInput) => {
    setSaving(true);
    setError(null);
    try {
      const res = await locationService.createServiceArea(input);
      setServiceAreas((prev) => [res, ...prev]);
      return res;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create service area');
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateServiceArea = useCallback(
    async (
      areaId: string,
      input: Partial<ServiceAreaInput> & { status?: 'active' | 'paused' }
    ) => {
      setSaving(true);
      setError(null);
      try {
        const res = await locationService.updateServiceArea(areaId, input);
        setServiceAreas((prev) =>
          prev.map((a) => (a.id === areaId ? res : a))
        );
        return res;
      } catch (err: any) {
        setError(err?.message ?? 'Failed to update service area');
        return null;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const deleteServiceArea = useCallback(async (areaId: string) => {
    setSaving(true);
    setError(null);
    try {
      await locationService.deleteServiceArea(areaId);
      setServiceAreas((prev) => prev.filter((a) => a.id !== areaId));
      return true;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete service area');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    location,
    serviceAreas,
    loading,
    saving,
    error,
    refresh,
    setLocation,
    updateLocation,
    deleteLocation,
    createServiceArea,
    updateServiceArea,
    deleteServiceArea,
  };
}