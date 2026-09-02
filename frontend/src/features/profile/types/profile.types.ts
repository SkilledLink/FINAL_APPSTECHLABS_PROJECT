export type UserRole = 'CLIENT' | 'PROFESSIONAL' | 'COMPANY' | 'ADMIN' | 'MODERATOR';

export type ProfileTab = 'overview' | 'work' | 'services' | 'posts' | 'reviews';

export interface ServiceItem {
  id: string;
  name: string;
  priceLabel: string;
  responseNotice?: string;
  description?: string;
}

export interface BeforeAfterProject {
  id: string;
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  tradeTitle: string;
  email: string;
  role: UserRole;
  avatar: string;
  coverImage?: string;
  followersCount: string;
  yearsInTrade: number;
  isVerified: boolean;
  hourlyRate?: number;
  rating: number;
  reviewCount: number;
  location: string;
  bio: string;
  services: ServiceItem[];
  featuredProjects: BeforeAfterProject[];
}