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

export interface AdminUserDetail extends AdminUser {
  bio?: string;
  bannerImageUrl?: string;
  followersCount: number;
  followingCount: number;
  updatedAt: string;
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
  verificationData?: Record<string, unknown> | null;
  verificationAttempts: number;
  verificationLastAttemptAt?: string;
  adminOverrideStatus?: string;
  adminOverrideBy?: string;
  adminOverrideAt?: string;
  adminOverrideReason?: string;
  fraudNotes?: string;
  deletedAt?: string;
  deletedByUserId?: string;
  deletionType?: string;
  deletionReason?: string;
  retentionUntil?: string;
  snapshotEmail?: string;
  snapshotUsername?: string;
  snapshotIp?: string;
  snapshotUserAgent?: string;
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
  author: { id: string; name: string; avatar: string; role: string };
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
  author: { id: string; name: string; avatar: string; role: string };
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
  client: { id: string; name: string; avatar: string };
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

// ============ Moderation ============
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

export interface AuditLogDetail extends AuditLog {
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  userAgent?: string;
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

// ============ Reports ============
export type ReportTargetType = 'user' | 'professional' | 'job' | 'feed';

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'fraud'
  | 'inappropriate_content'
  | 'fake_account'
  | 'scam'
  | 'impersonation'
  | 'other';

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

export type ReportAction =
  | 'none'
  | 'warned'
  | 'content_removed'
  | 'user_suspended'
  | 'user_banned';

export interface AdminReport {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: ReportTargetType;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  actionTaken: ReportAction;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportReviewPayload {
  status: Exclude<ReportStatus, 'pending'>;
  action_taken: ReportAction;
  review_notes?: string;
}

// ============ Professional Tiers ============
export type TierFeatureType = 'boolean' | 'numeric' | 'text' | 'json';

export interface TierFeature {
  id: string;
  tierId: string;
  featureKey: string;
  featureName: string;
  featureDescription?: string;
  featureType: TierFeatureType;
  featureValue?: Record<string, unknown> | null;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalTier {
  id: string;
  name: string;
  level: number;
  description?: string;
  price: number;
  currency: string;
  durationDays: number;
  isActive: boolean;
  isPublic: boolean;
  displayOrder: number;
  badgeName?: string;
  badgeCode?: string;
  badgeIcon?: string;
  badgeColor?: string;
  badgeSecondaryColor?: string;
  badgeShape?: string;
  badgeDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalTierDetail extends ProfessionalTier {
  features: TierFeature[];
}

export interface TierCreatePayload {
  name: string;
  level: number;
  description?: string;
  price: number;
  currency?: string;
  duration_days: number;
  is_active?: boolean;
  is_public?: boolean;
  display_order?: number;
  badge_name?: string;
  badge_code?: string;
  badge_icon?: string;
  badge_color?: string;
  badge_secondary_color?: string;
  badge_shape?: string;
  badge_description?: string;
}

export type TierUpdatePayload = Partial<TierCreatePayload>;

export interface TierFeatureCreatePayload {
  feature_key: string;
  feature_name: string;
  feature_description?: string;
  feature_type?: TierFeatureType;
  feature_value?: Record<string, unknown> | null;
  is_enabled?: boolean;
}

export type TierFeatureUpdatePayload = Partial<TierFeatureCreatePayload>;

// ============ Professional Payments ============
export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED';

export type PaymentProvider =
  | 'MTN_MOMO'
  | 'ORANGE_MONEY'
  | 'STRIPE'
  | 'PAYPAL'
  | 'CASH';

export type PaymentMethod =
  | 'MOBILE_MONEY'
  | 'CARD'
  | 'BANK_TRANSFER'
  | 'CASH';

export interface ProfessionalPayment {
  id: string;
  userId: string;
  professionalId?: string;
  tierId: string;
  subscriptionId?: string;
  reference: string;
  provider: PaymentProvider | string;
  providerTransactionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus | string;
  paymentMethod: PaymentMethod | string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  failedAt?: string;
}

export interface ProfessionalPaymentAdmin extends ProfessionalPayment {
  providerResponse?: Record<string, unknown> | null;
  extraMetadata?: Record<string, unknown> | null;
}