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

function toMessage(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail ?? err?.response?.data?.message;
  if (!detail) return err?.message || fallback;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => d?.msg ?? JSON.stringify(d)).join(', ');
  }
  return JSON.stringify(detail);
}

/** Normalize /professionals/ list response → DiscoverResponse */
function normalizeListResponse(data: any): DiscoverResponse {
  const items: DiscoverProfessional[] = (data.items ?? []).map((p: any) => ({
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
    // no public_location / distance_km
  }));

  return {
    items,
    total: data.total ?? 0,
    page: data.page ?? 1,
    size: data.size ?? items.length,
    search_center: null,
  };
}

export const locationService = {
  async search(
    q: string,
    limit = 8,
    country?: string
  ): Promise<LocationSearchResponse> {
    try {
      const { data } = await apiClient.get<LocationSearchResponse>(
        '/locations/search',
        { params: { q, limit, country: country || undefined } }
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Location search failed'));
    }
  },

  async reverse(lat: number, lng: number): Promise<ReverseGeocodeResponse> {
    try {
      const { data } = await apiClient.get<ReverseGeocodeResponse>(
        '/locations/reverse',
        { params: { lat, lng } }
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Reverse geocoding failed'));
    }
  },

  // ─── Unified discover — no location → /professionals/ (list)
  //                    with location → /professionals/nearby (distance) ───
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
        const { data } = await apiClient.get<DiscoverResponse>(
          '/professionals/nearby',
          {
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
          }
        );
        return data;
      }

      // No location — use plain list endpoint
      const page = Math.floor(skip / limit) + 1;
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
      return normalizeListResponse(data);
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to load professionals'));
    }
  },

  // Legacy method — still used if anything calls it directly
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
      const { data } = await apiClient.get<DiscoverResponse>(
        '/professionals/nearby',
        { params }
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Nearby search failed'));
    }
  },

  // ─── Professional's own location ────────────────────────
  async getMyLocation(): Promise<ProfessionalLocation | null> {
    try {
      const { data } = await apiClient.get<ProfessionalLocation>(
        '/professionals/me/location'
      );
      return data;
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      throw new Error(toMessage(err, 'Failed to load your location'));
    }
  },

  async setMyLocation(
    input: ProfessionalLocationInput
  ): Promise<ProfessionalLocation> {
    try {
      const { data } = await apiClient.put<ProfessionalLocation>(
        '/professionals/me/location',
        input
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to save your location'));
    }
  },

  async updateMyLocation(
    input: Partial<ProfessionalLocationInput>
  ): Promise<ProfessionalLocation> {
    try {
      const { data } = await apiClient.patch<ProfessionalLocation>(
        '/professionals/me/location',
        input
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
        '/professionals/me/service-areas'
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to load service areas'));
    }
  },

  async createServiceArea(input: ServiceAreaInput): Promise<ServiceArea> {
    try {
      const { data } = await apiClient.post<ServiceArea>(
        '/professionals/me/service-areas',
        input
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to create service area'));
    }
  },

  async updateServiceArea(
    areaId: string,
    input: Partial<ServiceAreaInput> & { status?: 'active' | 'paused' }
  ): Promise<ServiceArea> {
    try {
      const { data } = await apiClient.patch<ServiceArea>(
        `/professionals/me/service-areas/${areaId}`,
        input
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