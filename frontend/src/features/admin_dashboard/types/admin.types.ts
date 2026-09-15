// ============ Shared ============
export type Status = 'active' | 'inactive' | 'suspended' | 'pending';

export interface AdminOverviewStats {
  totalUsers: number;
  totalUsersChange: number;
  totalProfessionals: number;
  totalProfessionalsChange: number;
  activeJobs: number;
  activeJobsChange: number;
  pendingModeration: number;
  pendingModerationChange: number;
  totalRevenue: number;
  totalRevenueChange: number;
  newSignups: number;
  newSignupsChange: number;
}

export interface AdminAnalyticsData {
  userGrowth: { date: string; count: number }[];
  jobActivity: { date: string; count: number }[];
  revenueByCategory: { name: string; amount: number }[];
  topCategories: { name: string; count: number }[];
}

export interface AdminActivityItem {
  id: string;
  type: 'user_signup' | 'professional_verified' | 'job_posted' | 'report_created' | 'admin_action';
  description: string;
  actor: { name: string; avatar?: string };
  timestamp: string;
}

// ============ Users ============
export type UserStatus = 'active' | 'suspended' | 'pending';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  location: string;
  joinedDate: string;
  status: UserStatus;
  verified: boolean;
  totalRequests: number;
  totalSpent: number;
}

// ============ Professionals ============
export type ProfessionalStatus = 'verified' | 'pending' | 'suspended' | 'rejected';

export interface AdminProfessional {
  id: string;
  name: string;
  email: string;
  avatar: string;
  profession: string;
  location: string;
  status: ProfessionalStatus;
  rating: number;
  totalJobs: number;
  totalEarnings: number;
  joinedDate: string;
  verified: boolean;
  available: boolean;
}

// ============ Feeds ============
export type FeedStatus = 'published' | 'flagged' | 'removed' | 'pending';
export type FeedType = 'post' | 'service' | 'job';

export interface AdminFeed {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: 'client' | 'professional';
  };
  type: FeedType;
  content: string;
  images: string[];
  likes: number;
  comments: number;
  shares: number;
  reports: number;
  createdAt: string;
  status: FeedStatus;
}

// ============ Jobs ============
export type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

export interface AdminJob {
  id: string;
  title: string;
  category: string;
  location: string;
  budget: number;
  status: JobStatus;
  postedDate: string;
  deadline?: string;
  applicants: number;
  client: { id: string; name: string; avatar: string };
  professional?: { id: string; name: string; avatar: string };
}

// ============ Moderation ============
export type ReportTargetType = 'user' | 'professional' | 'feed' | 'job' | 'comment';
export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'fake'
  | 'inappropriate'
  | 'fraud'
  | 'other';
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';
export type ReportPriority = 'low' | 'medium' | 'high';

export interface ModerationReport {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  targetPreview: string;
  reporter: { id: string; name: string; avatar: string };
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  priority: ReportPriority;
  createdAt: string;
}

// ============ Audit Logs ============
export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLog {
  id: string;
  admin: { id: string; name: string; avatar: string };
  action: string;
  targetType: string;
  targetId: string;
  description: string;
  ipAddress: string;
  timestamp: string;
  severity: AuditSeverity;
}

// ============ Administrators ============
export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'support';

export interface Administrator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: AdminRole;
  permissions: string[];
  status: 'active' | 'inactive';
  lastActive: string;
  joinedDate: string;
}