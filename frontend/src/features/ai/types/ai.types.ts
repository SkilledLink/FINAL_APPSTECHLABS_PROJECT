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
}

export interface ActionCard {
  label: string;
  action: string;
  payload?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  recommendations?: MatchRecommendation[];
  actionCards?: ActionCard[];
}