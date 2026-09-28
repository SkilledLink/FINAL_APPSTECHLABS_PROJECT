// services/aiService.ts
import type { MatchRecommendation, ImageAnalysis } from '../types/ai.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.68.67:8000';

/** Raw shape returned by the backend /chat/ endpoint */
interface BackendProfessionalCard {
  id: string;
  user_id: string;
  name: string;
  profession: string;
  headline: string | null;
  city: string | null;
  country: string | null;
  years_of_experience: number | null;
  rating: number | null;
  total_reviews: number;
  is_verified: boolean;
  available: boolean;
  profile_image_url: string | null;
  distance_km: number | null;
  profile_url: string;
}

interface BackendChatResponse {
  response: string;
  sources: unknown[] | null;
  results?: BackendProfessionalCard[] | null;
  image_analysis?: ImageAnalysis | null;
  redirect_url?: string | null;
}

export interface ChatResponse {
  response: string;
  sources: unknown[];
  recommendations: MatchRecommendation[];
  redirectUrl?: string;
  imageAnalysis?: ImageAnalysis;
}

function getAccessToken(): string | null {
  return (
    localStorage.getItem('access_token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token')
  );
}

/** Map a backend ProfessionalCard into the frontend MatchRecommendation. */
function toRecommendation(card: BackendProfessionalCard): MatchRecommendation {
  const locationParts = [card.city, card.country].filter(Boolean) as string[];
  const location = locationParts.length > 0 ? locationParts.join(', ') : '—';

  return {
    id: card.id,
    name: card.name,
    type: 'worker',
    trade: card.profession,
    location,
    bio: card.headline ?? '',
    isVerified: card.is_verified,
    rating: card.rating ?? undefined,
    reviewCount: card.total_reviews,
    isAvailable: card.available,
    distanceKm: card.distance_km ?? undefined,
    profileImageUrl: card.profile_image_url ?? undefined,
  };
}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('You must be logged in to use the AI Assistant.');
  }

  const res = await fetch(`${API_URL}/chat/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    let errorMessage = 'Failed to get a response from the AI Assistant.';
    try {
      const errorData = await res.json();
      if (typeof errorData.detail === 'string') errorMessage = errorData.detail;
    } catch {
      // keep default
    }
    throw new Error(errorMessage);
  }

  const data: BackendChatResponse = await res.json();

  return {
    response: data.response,
    sources: data.sources ?? [],
    recommendations: (data.results ?? []).map(toRecommendation),
    redirectUrl: data.redirect_url ?? undefined,
    imageAnalysis: data.image_analysis ?? undefined,
  };
}
