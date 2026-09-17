// src/features/ai/services/aiSearchService.ts
import type { DiscoverProfessional } from '../../location/types/location.types';

/* ── Backend response shapes ─────────────────────────────── */

interface BackendProfessionalCard {
  id: string;
  user_id: string;
  name: string;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  profession: string;
  headline?: string | null;
  company_name?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  distance_km?: number | null;
  years_of_experience?: number | null;
  skills?: string[] | null;
  services?: string[] | null;
  hourly_rate?: number | null;
  currency?: string;
  rating?: number | null;
  total_reviews: number;
  completed_jobs?: number;
  is_verified: boolean;
  available: boolean;
  profile_image_url?: string | null;
  profile_url: string;
}

interface BackendImageAnalysis {
  description: string;
  possible_profession: string | null;
  possible_services: string[];
  skills: string[];
  work_category: string | null;
  search_terms: string[];
  confidence: number;
  language: string;
}

interface BackendSearchMetadata {
  total: number;
  returned: number;
  strategy: string;
  had_location: boolean;
  filters_applied: string[];
}

interface BackendAISearchResponse {
  query?: string | null;
  intent: string;
  total: number;
  results: BackendProfessionalCard[];
  explanation?: string | null;
  image_analysis?: BackendImageAnalysis | null;
  search_metadata?: BackendSearchMetadata | null;
}

/* ── Frontend-facing types ───────────────────────────────── */

export interface AISearchImageAnalysis {
  description: string;
  possibleProfession: string | null;
  possibleServices: string[];
  confidence: number;
}

export interface AISearchResult {
  query?: string;
  intent: string;
  total: number;
  professionals: DiscoverProfessional[];
  explanation?: string;
  imageAnalysis?: AISearchImageAnalysis;
  strategy?: string;
}

export interface AISearchParams {
  query?: string;
  image?: File | null;
  city?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  verifiedOnly?: boolean;
  availableOnly?: boolean;
  minRating?: number;
  limit?: number;
}

/* ── Config ──────────────────────────────────────────────── */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getAccessToken(): string | null {
  try {
    return (
      localStorage.getItem('access_token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token')
    );
  } catch {
    return null;
  }
}

/* ── Mapper — backend card → DiscoverProfessional ────────── */

function toDiscoverProfessional(
  card: BackendProfessionalCard,
): DiscoverProfessional {
  const displayName =
    [card.first_name, card.last_name].filter(Boolean).join(' ').trim() ||
    card.name ||
    'Professional';

  const locationLabel =
    [card.city, card.country].filter(Boolean).join(', ') || null;

  const publicLocation =
    card.city || card.country
      ? {
          display_name: locationLabel ?? '',
          latitude: 0,
          longitude: 0,
          city: card.city ?? null,
          region: card.region ?? null,
          country: card.country ?? null,
        }
      : null;

  return {
    id: card.id,
    profession: card.profession,
    headline: card.headline ?? null,
    company_name: card.company_name ?? null,
    years_of_experience: card.years_of_experience ?? null,
    skills: card.skills ?? null,
    services: card.services ?? null,
    hourly_rate: card.hourly_rate ?? null,
    currency: card.currency ?? 'XAF',
    available: card.available,
    is_verified: card.is_verified,
    rating: card.rating ?? 0,
    total_reviews: card.total_reviews ?? 0,
    completed_jobs: card.completed_jobs ?? 0,
    user: {
      id: card.user_id,
      username: card.username ?? null,
      first_name: card.first_name ?? displayName,
      last_name: card.last_name ?? '',
      profile_image_url: card.profile_image_url ?? null,
    },
    city: card.city ?? null,
    region: card.region ?? null,
    country: card.country ?? null,
    public_location: publicLocation,
    distance_km: card.distance_km ?? null,
  };
}

/* ── Service ─────────────────────────────────────────────── */

export const aiSearchService = {
  async search(params: AISearchParams): Promise<AISearchResult> {
    const formData = new FormData();

    if (params.query) formData.append('query', params.query);
    if (params.city) formData.append('city', params.city);
    if (params.latitude != null)
      formData.append('latitude', String(params.latitude));
    if (params.longitude != null)
      formData.append('longitude', String(params.longitude));
    if (params.radiusKm != null)
      formData.append('radius_km', String(params.radiusKm));
    if (params.verifiedOnly) formData.append('verified_only', 'true');
    if (params.availableOnly) formData.append('available_only', 'true');
    if (params.minRating != null)
      formData.append('min_rating', String(params.minRating));
    formData.append('limit', String(params.limit ?? 20));
    if (params.image) formData.append('image', params.image);

    // ── Send via fetch (not axios) ─────────────────────────
    // axios/apiClient typically sets a default
    // `Content-Type: application/json` header on every request.
    // That header would override the multipart boundary the browser
    // needs for FormData, and FastAPI would fail to parse the body.
    //
    // Using raw fetch avoids that entirely: we set only Authorization
    // and let the browser set Content-Type to
    // `multipart/form-data; boundary=...` automatically.
    const token = getAccessToken();

    const res = await fetch(`${API_BASE_URL}/ai/search`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    if (!res.ok) {
      let detail = 'AI search failed.';
      try {
        const errBody = await res.json();
        if (typeof errBody?.detail === 'string') {
          detail = errBody.detail;
        }
      } catch {
        // Body wasn't JSON — keep the default message
      }

      // Preserve the shape `.response.data.detail` that the hook
      // and other callers may rely on.
      const error = new Error(detail) as Error & {
        response?: { data?: { detail: string } };
      };
      error.response = { data: { detail } };
      throw error;
    }

    const data = (await res.json()) as BackendAISearchResponse;

    return {
      query: data.query ?? undefined,
      intent: data.intent,
      total: data.total,
      professionals: (data.results ?? []).map(toDiscoverProfessional),
      explanation: data.explanation ?? undefined,
      strategy: data.search_metadata?.strategy,
      imageAnalysis: data.image_analysis
        ? {
            description: data.image_analysis.description,
            possibleProfession: data.image_analysis.possible_profession,
            possibleServices: data.image_analysis.possible_services ?? [],
            confidence: data.image_analysis.confidence,
          }
        : undefined,
    };
  },
};