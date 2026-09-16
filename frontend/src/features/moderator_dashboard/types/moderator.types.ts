// ============ Overview (reuses /admin/dashboard) ============
export interface ModeratorOverviewStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalProfessionals: number;
  verifiedProfessionals: number;
  pendingProfessionals: number;
  totalFeeds: number;
  totalJobs: number;
  totalAdmins: number;
  totalModerators: number;
  generatedAt: string;
}

// ============ Users ============
export type UserStatus =
  | 'pending_verification'
  | 'active'
  | 'suspended'
  | 'deactivated';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar: string;
  location?: string;
  joinedDate: string;
  status: UserStatus | string;
  verified: boolean;
  accountType: string;
  lastActive?: string;
}

export interface AdminUserDetail extends AdminUser {
  bio?: string;
  followersCount: number;
  followingCount: number;
  updatedAt: string;
}

// ============ Professionals (public shapes only) ============
export type ProfessionalAccountStatus =
  | 'pending'
  | 'active'
  | 'suspended'
  | 'under_review'
  | 'deactivated'
  | 'deleted';

export interface AdminProfessional {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  profession: string;
  headline?: string;
  location: string;
  status: ProfessionalAccountStatus | string;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  totalJobs: number;
  joinedDate: string;
  available: boolean;
}

export interface AdminProfessionalDetail extends AdminProfessional {
  bio?: string;
  experienceLevel?: string;
  yearsOfExperience?: number;
  hourlyRate?: number;
  currency: string;
  country?: string;
  region?: string;
  city?: string;
  skills: string[];
  services: string[];
  languages: string[];
  updatedAt: string;
}

// ============ Feeds ============
export interface AdminFeed {
  id: string;
  title: string;
  description: string;
  content: string;
  status: string;
  isPublic: boolean;
  isDeleted: boolean;
  userId: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  images: string[];
  hashtags: string[];
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeedComment {
  id: string;
  userId: string;
  feedId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  replies: FeedComment[];
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
}

export interface AdminFeedDetail extends AdminFeed {
  commentsList: FeedComment[];
  isLiked: boolean;
  moderation: {
    decision: string;
    severity: number;
    confidence: number;
    description: string;
    reason: string;
    categories: string[];
    provider: string;
    model: string;
    error?: string;
    createdAt: string;
  } | null;
}

// ============ Jobs ============
export interface AdminJob {
  id: string;
  title: string;
  description: string;
  status: string;
  userId: string;
  client: {
    id: string;
    name: string;
    avatar: string;
  };
  images: string[];
  likes: number;
  comments: number;
  postedDate: string;
  updatedAt: string;
}

export interface JobComment {
  id: string;
  userId: string;
  jobId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  replies: JobComment[];
}

export interface AdminJobDetail extends AdminJob {
  commentsList: JobComment[];
}

// ============ Moderation (AI queue) ============
export interface ModerationQueueItem {
  recordId: string;
  feedId: string;
  feedTitle: string;
  feedDescription: string;
  feedAuthorId: string;
  feedMedia: Array<{ id: string; media_url: string; media_type: string }>;
  summary: {
    decision: string;
    severity: number;
    confidence: number;
    description: string;
    reason: string;
    categories: string[];
    provider: string;
    model: string;
    error?: string;
    createdAt: string;
  };
}

export interface ModerationDetail {
  recordId: string;
  decision: string;
  severity: number;
  confidence: number;
  description: string;
  reason: string;
  categories: string[];
  provider: string;
  model: string;
  error?: string;
  createdAt: string;
  textResult: Record<string, unknown> | null;
  imageResults: unknown[] | null;
}

// ============ My Activity ============
export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  reason?: string;
  description: string;
  ipAddress?: string;
  timestamp: string;
}

export interface ActivityLogDetail extends ActivityLog {
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  userAgent?: string;
}