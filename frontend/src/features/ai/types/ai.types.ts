// types/ai.types.ts
export type UserRole = 'hirer' | 'worker' | null;

export interface Profile {
  id: string;
  name: string;
  role: 'hirer' | 'worker';
  trade: string;
  location: string;
  rating: number;
  review_count: number;
  hourly_rate: number;
  is_verified: boolean;
  is_available: boolean;
  bio: string;
  skills: string[];
}

export interface Job {
  id: string;
  hirer_id?: string;
  hirer_name: string;
  trade_needed: string;
  location: string;
  status: 'open' | 'closed';
  created_at: string;
  title: string;
  description: string;
  budget?: number;
}

export interface MatchRecommendation {
  id: string;
  name: string;
  trade?: string;
  title?: string;
  type: 'worker' | 'job';
  location: string;
  bio: string;
  isVerified: boolean;
  rating?: number;
  reviewCount?: number;
  hourlyRate?: number;
  budget?: number;
  isAvailable?: boolean;
  skills?: string[];
  description?: string;
  /** From backend: distance in km when a location search ran */
  distanceKm?: number;
  /** From backend: profile image URL */
  profileImageUrl?: string;
}

export interface ActionCard {
  label: string;
  action: string;
  payload?: Record<string, unknown>;
}

/** Structured image analysis returned by /chat/ when an image was sent */
export interface ImageAnalysis {
  description: string;
  possible_profession: string | null;
  possible_services: string[];
  skills: string[];
  work_category: string | null;
  search_terms: string[];
  confidence: number;
  language: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  recommendations?: MatchRecommendation[];
  actionCards?: ActionCard[];
  /** Deep link to /discovery with search params — present on search responses */
  redirectUrl?: string;
  /** Structured image analysis — present when user attached an image */
  imageAnalysis?: ImageAnalysis;
  /** Total result count (may exceed recommendations length) */
  totalResults?: number;
}