// src/types/portfolio.ts
export interface Specialty {
  id: string;
  name: string;
  description: string | null;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  specialties: Specialty[];
}

export interface Portfolio {
  id: string;
  user_id: string;
  headline: string | null;
  bio: string | null;
  years_experience: number | null;
  business_name: string | null;
  business_description: string | null;
  service_area: string | null;
  phone: string | null;
  is_verified: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user?: any;
  specialties?: Specialty[];
  services?: Service[];
  works?: Work[];
  availabilities?: Availability[];
}

export interface Work {
  id: string;
  portfolio_id: string;
  title: string;
  description: string | null;
  service_category: string | null;
  location: string | null;
  completed_at: string | null;
  duration_value: number | null;
  duration_unit: string | null;
  team_size: number | null;
  client_type: string | null;
  before_image_url: string | null;
  after_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  portfolio_id: string;
  title: string;
  description: string | null;
  category: string | null;
  starting_price: number | null;
  pricing_type: string | null;
  estimated_duration: string | null;
  service_area: string | null;
  is_active: boolean;
  is_emergency_service: boolean;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  portfolio_id: string;
  day_of_week: string;
  start_time: string | null;
  end_time: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicPortfolio {
  professional: any;
  portfolio: Portfolio;
  services: Service[];
  works: Work[];
  availability: Availability[];
  average_rating: number | null;
  total_reviews: number;
}