// ============ Shared ============
export type SortDir = 'asc' | 'desc';

export interface AdminOverviewStats {
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
  isAdmin: boolean;
  isModerator: boolean;
  accountType: string;
  lastActive?: string;
}

// ============ Professionals ============
export type ProfessionalAccountStatus =
  | 'pending'
  | 'active'
  | 'suspended'
  | 'under_review'
  | 'deactivated'
  | 'deleted';

export type VerificationStatus =
  | 'not_started'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'failed'
  | 'manual_review'
  | 'manual_approved'
  | 'manual_rejected'
  | 'expired';

export interface AdminProfessional {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  profession: string;
  headline?: string;
  location: string;
  status: ProfessionalAccountStatus | string;
  verificationStatus: VerificationStatus | string;
  isVerified: boolean;
  isFlagged: boolean;
  trustScore: number;
  rating: number;
  totalReviews: number;
  totalJobs: number;
  joinedDate: string;
  available: boolean;
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

// ============ Audit Logs ============
export interface AuditLog {
  id: string;
  actorUserId?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  reason?: string;
  description: string;
  ipAddress?: string;
  timestamp: string;
}

// ============ Administrators ============
export interface Administrator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isAdmin: boolean;
  isModerator: boolean;
  role: 'admin' | 'moderator';
  status: 'active' | 'inactive';
  lastActive?: string;
  joinedDate: string;
}
export interface AdminUserDetail extends AdminUser {
  bio?: string;
  bannerImageUrl?: string;
  followersCount: number;
  followingCount: number;
  updatedAt: string;
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
export interface AdminProfessionalDetail extends AdminProfessional {
  bio?: string;
  experienceLevel?: string;
  yearsOfExperience?: number;
  companyName?: string;
  jobTitle?: string;
  employmentType?: string;
  hourlyRate?: number;
  currency: string;
  country?: string;
  region?: string;
  city?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  skills: string[];
  services: string[];
  languages: string[];
  availabilityNotes?: string;
  responseTimeHours?: number;
  verifiedAt?: string;

  // admin-only
  verificationData?: Record<string, unknown> | null;
  verificationAttempts: number;
  verificationLastAttemptAt?: string;
  adminOverrideStatus?: string;
  adminOverrideBy?: string;
  adminOverrideAt?: string;
  adminOverrideReason?: string;
  fraudNotes?: string;

  // deletion
  deletedAt?: string;
  deletedByUserId?: string;
  deletionType?: string;
  deletionReason?: string;
  retentionUntil?: string;

  // snapshot
  snapshotEmail?: string;
  snapshotUsername?: string;
  snapshotIp?: string;
  snapshotUserAgent?: string;

  updatedAt: string;
}
export interface AuditLogDetail extends AuditLog {
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  userAgent?: string;
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



