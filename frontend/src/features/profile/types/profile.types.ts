export type UserRole =
  | "CLIENT"
  | "PROFESSIONAL"
  | "COMPANY"
  | "ADMIN"
  | "MODERATOR";

export type ProfileTab = "overview" | "work" | "services" | "posts" | "reviews";

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

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  endorsements: number;
}

export interface ExperienceItem {
  id: string;
  title: string;
  companyName: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  tradeTitle?: string;
  headline?: string;
  email: string;
  role: UserRole;
  avatar: string;
  coverImage?: string;
  followersCount?: string;
  yearsInTrade?: number;
  isVerified: boolean;
  hourlyRate?: number;
  rating?: number;
  reviewCount?: number;
  location: string;
  bio: string;
  services?: ServiceItem[];
  featuredProjects?: BeforeAfterProject[];
  createdAt?: string;
  companyMeta?: { teamSize?: number };
  completedJobsCount?: number;
  skills?: SkillItem[];
  experience?: ExperienceItem[];
}
