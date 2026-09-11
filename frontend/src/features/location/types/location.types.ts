export type LocationType = 'home' | 'office' | 'workshop' | 'other';
export type ServiceAreaStatus = 'active' | 'paused';

export interface LocationSearchResult {
  display_name: string;
  latitude: number;
  longitude: number;
  country?: string | null;
  country_code?: string | null;
  region?: string | null;
  city?: string | null;
  area?: string | null;
  postcode?: string | null;
  osm_type?: string | null;
  osm_id?: string | null;
  place_type?: string | null;
}

export interface LocationSearchResponse {
  results: LocationSearchResult[];
}

export interface ReverseGeocodeResponse {
  display_name: string;
  latitude: number;
  longitude: number;
  country?: string | null;
  country_code?: string | null;
  region?: string | null;
  city?: string | null;
  area?: string | null;
  postcode?: string | null;
}

export interface ProfessionalLocation {
  id: string;
  professional_id: string;
  latitude: number;
  longitude: number;
  location_name: string;
  location_type: LocationType;
  is_primary: boolean;
  country?: string | null;
  country_code?: string | null;
  region?: string | null;
  city?: string | null;
  area?: string | null;
  postcode?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalLocationInput {
  latitude: number;
  longitude: number;
  location_name: string;
  location_type?: LocationType;
  is_primary?: boolean;
  country?: string | null;
  country_code?: string | null;
  region?: string | null;
  city?: string | null;
  area?: string | null;
  postcode?: string | null;
}

export interface ServiceArea {
  id: string;
  professional_id: string;
  center_latitude: number;
  center_longitude: number;
  radius_km: number;
  area_name: string;
  status: ServiceAreaStatus;
  created_at: string;
  updated_at: string;
}

export interface ServiceAreaInput {
  center_latitude: number;
  center_longitude: number;
  radius_km: number;
  area_name: string;
}

export interface ServiceAreaListResponse {
  items: ServiceArea[];
  total: number;
}

export interface PublicLocation {
  display_name: string;
  latitude: number;
  longitude: number;
  city?: string | null;
  region?: string | null;
  country?: string | null;
}

export interface NearbyProfessionalUser {
  id: string;
  username?: string | null;
  first_name: string;
  last_name: string;
  profile_image_url?: string | null;
}

/** Unified shape — used by both the location-aware nearby endpoint
 *  and the plain list endpoint. Only nearby responses carry
 *  `distance_km` and `public_location`. */
export interface DiscoverProfessional {
  id: string;
  profession: string;
  headline?: string | null;
  company_name?: string | null;
  years_of_experience?: number | null;
  skills?: string[] | null;
  services?: string[] | null;
  hourly_rate?: number | null;
  currency: string;
  available: boolean;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  completed_jobs: number;
  profile_completeness?: number;
  user: NearbyProfessionalUser;
  /** Present only when returned by /nearby */
  public_location?: PublicLocation | null;
  distance_km?: number | null;
  /** Present only when returned by /professionals/ list */
  city?: string | null;
  region?: string | null;
  country?: string | null;
}

export interface DiscoverResponse {
  items: DiscoverProfessional[];
  total: number;
  page: number;
  size: number;
  search_center?: PublicLocation | null;
}

export interface DiscoverParams {
  /** When null → calls /professionals/ list endpoint. When set → /nearby */
  location?: { lat: number; lng: number } | null;
  radiusKm?: number;
  profession?: string;
  verifiedOnly?: boolean;
  availableOnly?: boolean;
  skip?: number;
  limit?: number;
}

/** Legacy aliases kept for compatibility with existing components */
export type NearbyProfessional = DiscoverProfessional;
export type NearbyProfessionalListResponse = DiscoverResponse;
export type NearbySearchParams = DiscoverParams & { lat: number; lng: number };