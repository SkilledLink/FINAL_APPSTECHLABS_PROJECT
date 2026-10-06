// src/features/portfolio/types/portfolio.types.ts
// Mirrors the backend Pydantic schemas exactly.

/* ───────────────────────── enums ───────────────────────── */

export type PricingType =
  | 'fixed'
  | 'hourly'
  | 'daily'
  | 'monthly'
  | 'starting_from'
  | 'negotiable';

export type DurationUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months';

export type ClientType =
  | 'individual'
  | 'household'
  | 'business'
  | 'organization'
  | 'government'
  | 'professional'
  | 'contractor'
  | 'ngo';

export type AvailabilityDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

/* ───────────────────────── enum constants ───────────────────────── */

export const PRICING_TYPES: PricingType[] = [
  'fixed',
  'hourly',
  'daily',
  'monthly',
  'starting_from',
  'negotiable',
];

export const DURATION_UNITS: DurationUnit[] = [
  'minutes',
  'hours',
  'days',
  'weeks',
  'months',
];

export const CLIENT_TYPES: ClientType[] = [
  'individual',
  'household',
  'business',
  'organization',
  'government',
  'professional',
  'contractor',
  'ngo',
];

export const AVAILABILITY_DAYS: AvailabilityDay[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

/* ───────────────────────── portfolio ───────────────────────── */

export interface Portfolio {
  id: string;
  user_id: string;

  headline?: string | null;
  tagline?: string | null;
  bio?: string | null;
  mission_statement?: string | null;

  business_name?: string | null;
  business_description?: string | null;
  years_experience?: number | null;
  years_in_business?: number | null;
  team_size?: number | null;

  cover_image_url?: string | null;
  intro_video_url?: string | null;

  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;

  website_url?: string | null;
  linkedin_url?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;

  country?: string | null;
  region?: string | null;
  city?: string | null;
  service_area?: string | null;
  service_radius_km?: number | null;
  travels_to_client: boolean;
  works_remotely: boolean;

  license_number?: string | null;
  license_authority?: string | null;
  insurance_provider?: string | null;

  currency: string;
  payment_methods?: string[] | null;
  accepts_negotiation: boolean;

  tags?: string[] | null;
  languages?: string[] | null;

  average_rating?: number | null;
  total_reviews: number;

  is_verified: boolean;
  is_public: boolean;
  is_featured: boolean;
  featured_until?: string | null;

  created_at: string;
  updated_at: string;

  user?: PortfolioAuthor | null;
  specialties?: Specialty[];
  services?: Service[];
  works?: Work[];
  availabilities?: Availability[];
}

export interface PortfolioAuthor {
  id: string;
  email?: string;
  username?: string | null;
  first_name: string;
  last_name: string;
  bio?: string | null;
  location?: string | null;
  profile_image_url?: string | null;
  banner_image_url?: string | null;
  account_type?: string;
  status?: string;
  is_admin?: boolean;
  is_moderator?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PortfolioCreateInput {
  headline?: string;
  tagline?: string;
  bio?: string;
  mission_statement?: string;
  business_name?: string;
  business_description?: string;
  years_experience?: number;
  years_in_business?: number;
  team_size?: number;
  cover_image_url?: string;
  intro_video_url?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website_url?: string;
  linkedin_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  country?: string;
  region?: string;
  city?: string;
  service_area?: string;
  service_radius_km?: number;
  travels_to_client?: boolean;
  works_remotely?: boolean;
  license_number?: string;
  license_authority?: string;
  insurance_provider?: string;
  currency?: string;
  payment_methods?: string[];
  accepts_negotiation?: boolean;
  tags?: string[];
  languages?: string[];
  is_public?: boolean;
  specialty_ids?: string[];
}

export type PortfolioUpdateInput = Partial<PortfolioCreateInput>;

/* ───────────────────────── services ───────────────────────── */

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface Service {
  id: string;
  portfolio_id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  starting_price?: number | null;
  pricing_type?: PricingType | null;
  estimated_duration?: string | null;
  service_area?: string | null;
  is_active: boolean;
  is_emergency_service: boolean;
  banner_image_url?: string | null;
  gallery?: string[] | null;
  whats_included?: string[] | null;
  whats_excluded?: string[] | null;
  warranty_days?: number | null;
  lead_time_days?: number | null;
  promo_price?: number | null;
  promo_until?: string | null;
  faqs?: ServiceFAQ[] | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceCreateInput {
  title: string;
  description?: string;
  category?: string;
  starting_price?: number;
  pricing_type?: PricingType;
  estimated_duration?: string;
  service_area?: string;
  is_active?: boolean;
  is_emergency_service?: boolean;
  banner_image_url?: string;
  gallery?: string[];
  whats_included?: string[];
  whats_excluded?: string[];
  warranty_days?: number;
  lead_time_days?: number;
  promo_price?: number;
  promo_until?: string;
  faqs?: ServiceFAQ[];
}

export type ServiceUpdateInput = Partial<ServiceCreateInput>;

/* ───────────────────────── works ───────────────────────── */

export interface Work {
  id: string;
  portfolio_id: string;
  title: string;
  description?: string | null;
  service_category?: string | null;
  location?: string | null;
  completed_at?: string | null;
  duration_value?: number | null;
  duration_unit?: DurationUnit | null;
  team_size?: number | null;
  client_type?: ClientType | null;
  gallery?: string[] | null;
  cost?: number | null;
  client_name?: string | null;
  client_testimonial?: string | null;
  rating?: number | null;
  service_id?: string | null;
  before_image_url?: string | null;
  after_image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkCreateInput {
  title: string;
  description?: string;
  service_category?: string;
  location?: string;
  completed_at?: string;
  duration_value?: number;
  duration_unit?: DurationUnit;
  team_size?: number;
  client_type?: ClientType;
  gallery?: string[];
  cost?: number;
  client_name?: string;
  client_testimonial?: string;
  rating?: number;
  service_id?: string;
}

export type WorkUpdateInput = Partial<WorkCreateInput>;

/* ───────────────────────── availability ───────────────────────── */

export interface Availability {
  id: string;
  day_of_week: AvailabilityDay;
  start_time?: string | null;
  end_time?: string | null;
  is_available: boolean;
  break_start?: string | null;
  break_end?: string | null;
  timezone?: string | null;
  notes?: string | null;
}

export interface AvailabilityInput {
  day_of_week: AvailabilityDay;
  start_time?: string;
  end_time?: string;
  is_available?: boolean;
  break_start?: string;
  break_end?: string;
  timezone?: string;
  notes?: string;
}

/* ───────────────────────── categories & specialties ───────────────────────── */

export interface Specialty {
  id: string;
  name: string;
  description?: string | null;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  specialties: Specialty[];
}

/* ───────────────────────── public portfolio ───────────────────────── */

export interface PublicPortfolio {
  professional: PortfolioAuthor;
  portfolio: Portfolio;
  services: Service[];
  works: Work[];
  availability: Availability[];
  average_rating?: number | null;
  total_reviews: number;
}

/* ───────────────────────── AI usage ───────────────────────── */

export interface AIUsageItem {
  feature_key: string;
  feature_name: string;
  usage_count: number;
  usage_limit: number;
  remaining: number;
  period_start: string;
  period_end: string;
}

export interface AIUsageResponse {
  items: AIUsageItem[];
  total: number;
}