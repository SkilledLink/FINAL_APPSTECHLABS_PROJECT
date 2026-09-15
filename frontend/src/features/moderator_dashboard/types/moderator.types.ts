// ============ Shared ============
export type Status = 'active' | 'inactive' | 'suspended' | 'pending';

export interface ModeratorOverviewStats {
  pendingReports: number;
  pendingReportsChange: number;
  resolvedToday: number;
  resolvedTodayChange: number;
  flaggedContent: number;
  flaggedContentChange: number;
  suspendedUsers: number;
  suspendedUsersChange: number;
  avgResponseTime: number;
  avgResponseTimeChange: number;
  actionsThisWeek: number;
  actionsThisWeekChange: number;
}

export interface ModeratorAnalyticsData {
  reportsHandled: { date: string; count: number }[];
  reportsByReason: { name: string; count: number }[];
  topReportedCategories: { name: string; count: number }[];
}

export interface ModeratorActivityItem {
  id: string;
  type: 'report_resolved' | 'content_removed' | 'user_suspended' | 'user_warned' | 'report_dismissed';
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
  warnings: number;
  totalRequests: number;
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
  warnings: number;
  joinedDate: string;
  verified: boolean;
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
  reports: number;
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
  assignedTo?: string;
}

// ============ Audit Logs ============
export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLog {
  id: string;
  moderator: { id: string; name: string; avatar: string };
  action: string;
  targetType: string;
  targetId: string;
  description: string;
  ipAddress: string;
  timestamp: string;
  severity: AuditSeverity;
}

// ============ Team ============
export type ModeratorRole = 'lead_moderator' | 'senior_moderator' | 'moderator' | 'trainee';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: ModeratorRole;
  status: 'active' | 'inactive';
  actionsToday: number;
  lastActive: string;
  joinedDate: string;
}