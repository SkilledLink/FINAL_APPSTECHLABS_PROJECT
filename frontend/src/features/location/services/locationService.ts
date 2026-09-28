// src/features/location/services/locationService.ts
import axios from 'axios';
import { apiClient } from '../../../api/client';
import type {
  DiscoverParams,
  DiscoverProfessional,
  DiscoverResponse,
  LocationSearchResponse,
  NearbyProfessional,
  ProfessionalLocation,
  ProfessionalLocationInput,
  ReverseGeocodeResponse,
  ServiceArea,
  ServiceAreaInput,
  ServiceAreaListResponse,
} from '../types/location.types';

/* ───────────────────────── Public HTTP client (no 401 logout) ───────────────────────── */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.68.67:8000';

const publicHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

publicHttp.interceptors.request.use(config => {
  try {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = config.headers ?? {};

      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    /* ignore */
  }
  return config;
});

/* ───────────────────────── Helpers ───────────────────────── */

function toMessage(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail ?? err?.response?.data?.message;
  if (!detail) return err?.message || fallback;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => d?.msg ?? JSON.stringify(d)).join(', ');
  }
  return JSON.stringify(detail);
}

/**
 * Normalize a single professional from any of the list endpoints.
 * Preserves public_location + distance_km when the backend sends them.
 */
function normalizeProfessional(p: any): DiscoverProfessional {
  const rawLoc = p?.public_location ?? p?.location ?? null;

  const public_location =
    rawLoc && rawLoc.latitude != null && rawLoc.longitude != null
      ? {
          latitude: Number(rawLoc.latitude),
          longitude: Number(rawLoc.longitude),
          display_name:
            rawLoc.display_name ??
            rawLoc.location_name ??
            [rawLoc.city, rawLoc.region, rawLoc.country].filter(Boolean).join(', ') ??
            '',
          city: rawLoc.city ?? null,
          region: rawLoc.region ?? null,
          country: rawLoc.country ?? null,
        }
      : null;

  const distance_km =
    typeof p?.distance_km === 'number'
      ? p.distance_km
      : typeof p?.distance === 'number'
        ? p.distance
        : null;

  return {
    id: p.id,
    profession: p.profession,
    headline: p.headline,
    company_name: p.company_name,
    years_of_experience: p.years_of_experience,
    skills: p.skills,
    services: p.services,
    hourly_rate: p.hourly_rate,
    currency: p.currency ?? 'XAF',
    available: p.available,
    is_verified: p.is_verified,
    rating: p.rating ?? 0,
    total_reviews: p.total_reviews ?? 0,
    completed_jobs: p.completed_jobs ?? 0,
    profile_completeness: p.profile_completeness,
    user: p.user,
    city: p.city,
    region: p.region,
    country: p.country,
    public_location,
    distance_km,
  } as DiscoverProfessional;
}

function normalizeListResponse(data: any): DiscoverResponse {
  const rawItems = Array.isArray(data) ? data : (data?.items ?? data?.results ?? []);

  const items = rawItems.map(normalizeProfessional);

  return {
    items,
    total: data?.total ?? items.length,
    page: data?.page ?? 1,
    size: data?.size ?? items.length,
    search_center: data?.search_center ?? null,
  };
}

function normalizeSearchResponse(data: any): LocationSearchResponse {
  if (Array.isArray(data)) return { results: data };
  if (Array.isArray(data?.results)) return { results: data.results };
  if (Array.isArray(data?.items)) return { results: data.items };
  return { results: [] };
}

/* ───────────────────────── Service ───────────────────────── */

export const locationService = {
  async search(q: string, limit = 8, country?: string): Promise<LocationSearchResponse> {
    try {
      const { data } = await publicHttp.get('/locations/search', {
        params: { q, limit, country: country || undefined },
      });
      return normalizeSearchResponse(data);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw new Error('Location search is temporarily unavailable.');
      }
      throw new Error(toMessage(err, 'Location search failed'));
    }
  },

  async reverse(lat: number, lng: number): Promise<ReverseGeocodeResponse> {
    try {
      const { data } = await publicHttp.get('/locations/reverse', {
        params: { lat, lng },
      });
      return data;
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw new Error('Reverse geocoding is temporarily unavailable.');
      }
      throw new Error(toMessage(err, 'Reverse geocoding failed'));
    }
  },

  /* ─── Discover ─── */

  async discover(params: DiscoverParams = {}): Promise<DiscoverResponse> {
    const {
      location,
      radiusKm = 10,
      profession,
      verifiedOnly = false,
      availableOnly = true,
      skip = 0,
      limit = 20,
    } = params;

    try {
      if (location) {
        const { data } = await apiClient.get('/professionals/nearby', {
          params: {
            lat: location.lat,
            lng: location.lng,
            radius_km: radiusKm,
            skip,
            limit,
            profession: profession || undefined,
            available_only: availableOnly,
            verified_only: verifiedOnly,
          },
        });

        /* Dev diagnostic — remove when done debugging */
        if (import.meta.env.DEV) {
          console.debug(
            '[discover:nearby] raw response shape =',
            Array.isArray(data) ? 'array' : 'object',
            '\nfirst item keys =',
            data?.items?.[0]
              ? Object.keys(data.items[0])
              : data?.[0]
                ? Object.keys(data[0])
                : 'empty',
            '\nfirst item =',
            data?.items?.[0] ?? data?.[0] ?? null,
          );
        }

        return normalizeListResponse(data);
      }

      const { data } = await apiClient.get('/professionals/', {
        params: {
          skip,
          limit,
          profession: profession || undefined,
          verified_only: verifiedOnly,
          available_only: availableOnly,
          sort: 'rating_desc',
        },
      });

      if (import.meta.env.DEV) {
        console.debug(
          '[discover:list] raw response shape =',
          Array.isArray(data) ? 'array' : 'object',
          '\nfirst item keys =',
          data?.items?.[0]
            ? Object.keys(data.items[0])
            : data?.[0]
              ? Object.keys(data[0])
              : 'empty',
          '\nfirst item =',
          data?.items?.[0] ?? data?.[0] ?? null,
        );
      }

      return normalizeListResponse(data);
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to load professionals'));
    }
  },

  async findNearby(params: {
    lat: number;
    lng: number;
    radius_km?: number;
    skip?: number;
    limit?: number;
    profession?: string;
    available_only?: boolean;
    verified_only?: boolean;
  }): Promise<DiscoverResponse> {
    try {
      const { data } = await apiClient.get('/professionals/nearby', {
        params,
      });
      return normalizeListResponse(data);
    } catch (err) {
      throw new Error(toMessage(err, 'Nearby search failed'));
    }
  },

  /* ─── Professional's own location ─── */

  async getMyLocation(): Promise<ProfessionalLocation | null> {
    try {
      const { data } = await apiClient.get<ProfessionalLocation>('/professionals/me/location');
      return data;
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      throw new Error(toMessage(err, 'Failed to load your location'));
    }
  },

  async setMyLocation(input: ProfessionalLocationInput): Promise<ProfessionalLocation> {
    try {
      const { data } = await apiClient.put<ProfessionalLocation>(
        '/professionals/me/location',
        input,
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to save your location'));
    }
  },

  async updateMyLocation(input: Partial<ProfessionalLocationInput>): Promise<ProfessionalLocation> {
    try {
      const { data } = await apiClient.patch<ProfessionalLocation>(
        '/professionals/me/location',
        input,
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to update your location'));
    }
  },

  async deleteMyLocation(): Promise<void> {
    try {
      await apiClient.delete('/professionals/me/location');
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to delete your location'));
    }
  },

  async listServiceAreas(): Promise<ServiceAreaListResponse> {
    try {
      const { data } = await apiClient.get<ServiceAreaListResponse>(
        '/professionals/me/service-areas',
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to load service areas'));
    }
  },

  async createServiceArea(input: ServiceAreaInput): Promise<ServiceArea> {
    try {
      const { data } = await apiClient.post<ServiceArea>('/professionals/me/service-areas', input);
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to create service area'));
    }
  },

  async updateServiceArea(
    areaId: string,
    input: Partial<ServiceAreaInput> & { status?: 'active' | 'paused' },
  ): Promise<ServiceArea> {
    try {
      const { data } = await apiClient.patch<ServiceArea>(
        `/professionals/me/service-areas/${areaId}`,
        input,
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to update service area'));
    }
  },

  async deleteServiceArea(areaId: string): Promise<void> {
    try {
      await apiClient.delete(`/professionals/me/service-areas/${areaId}`);
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to delete service area'));
    }
  },
};

export type { NearbyProfessional };
