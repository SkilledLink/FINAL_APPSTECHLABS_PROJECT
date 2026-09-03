export interface DashboardStats {
  profileViews: number;
  profileViewsChange: number;
  serviceRequests: number;
  serviceRequestsChange: number;
  jobsCompleted: number;
  jobsCompletedChange: number;
  averageRating: number;
  averageRatingChange: number;
  responseRate: number;
  responseRateChange: number;
  profileCompletion: number;
  totalEarnings: number;
  totalEarningsChange: number;
}

export interface ServiceRequest {
  id: string;
  client: {
    id: string;
    name: string;
    avatar?: string;
    location: string;
  };
  service: string;
  description: string;
  date: string;
  status: 'pending' | 'in-progress' | 'completed' | 'declined';
  price?: number;
  urgency?: 'low' | 'medium' | 'high';
  category: string;
}

export interface Activity {
  id: string;
  type: 'post' | 'comment' | 'like' | 'follow' | 'profile_update' | 'verification' | 'review' | 'request';
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  icon?: string;
}

export interface AIInsight {
  id: string;
  type: 'profile' | 'services' | 'pricing' | 'content' | 'timing' | 'growth';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action?: string;
  actionLink?: string;
  category: string;
}

export interface AnalyticsData {
  viewsData: { date: string; count: number }[];
  requestsData: { date: string; count: number }[];
  jobsData: { date: string; count: number }[];
  earningsData: { date: string; amount: number }[];
}

export interface DashboardData {
  stats: DashboardStats;
  analytics: AnalyticsData;
  recentRequests: ServiceRequest[];
  recentActivities: Activity[];
  aiInsights: AIInsight[];
}