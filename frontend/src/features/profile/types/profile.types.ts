// src/features/profile/types/profile.types.ts

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

  visibility?: 'public' | 'private';
  deactivatedAt?: string | null;
  suspendedAt?: string | null;
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
  viewerRelation?: ViewerRelation;
}

export type ProfileTab =
  | 'overview'
  | 'work'
  | 'services'
  | 'media'
  | 'posts'
  | 'reviews';

export type ProfileStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'not_found'
  | 'private'
  | 'blocked'
  | 'blocked_by'
  | 'deactivated'
  | 'suspended'
  | 'unauthenticated'
  | 'error';

export interface ViewerRelation {
  isFollowing: boolean;
  followsYou: boolean;
  isMutual: boolean;
  hasRequestedFollow: boolean;
  isBlocked: boolean;
  isBlockedBy: boolean;
  isMuted: boolean;
  canFollow: boolean;
  canMessage: boolean;
  canRequestService: boolean;
  canViewWork: boolean;
}

// ── Media grid ─────────────────────────────────────────────────
export interface FeedThumbnail {
  feedId: string;
  title: string;
  thumbnailUrl: string;
  mediaType: 'image' | 'video';
  mediaCount: number;
  createdAt: string;
}

export interface FeedThumbnailPage {
  items: FeedThumbnail[];
  total: number;
}