// src/features/user_profile/types/user.types.ts

export type AccountType = 'standard' | 'professional' | 'business';
export type AccountStatus = 'active' | 'suspended' | 'deleted';

export interface User {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  bio?: string;
  location?: string;
  accountType: AccountType;
  status: AccountStatus;
  isEmailVerified: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  deletedAt?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface Professional {
  id: string;
  userId: string;
  profession: string;
  bio?: string;
  skills: string[];
  yearsOfExperience?: number;
  services: string[];
  hourlyRate?: number;
  country?: string;
  region?: string;
  city?: string;
  available: boolean;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  completedJobs: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  professional?: Professional;
}

export type UserTab =
  | 'overview'
  | 'work'
  | 'services'
  | 'posts'
  | 'reviews';