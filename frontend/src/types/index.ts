export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  profession: string;
  location: string;
  rating: number;
  totalClients: number;
  activeRequests: number;
  completedJobs: number;
  available: boolean;
  joinedDate: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  availability: boolean;
  image?: string;
}

export interface Request {
  id: string;
  clientName: string;
  clientAvatar?: string;
  service: string;
  serviceType: string;
  date: string;
  location: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  budget: number;
  description: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  date: string;
  clientName: string;
  clientFeedback?: string;
  rating?: number;
  location: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance';
  salary: string;
  postedDate: string;
  status: 'applied' | 'interviewing' | 'offered' | 'rejected' | 'saved';
  description: string;
  requirements: string[];
}

export interface AnalyticsData {
  profileViews: number;
  profileViewsChange: number;
  searchAppearances: number;
  searchAppearancesChange: number;
  postEngagement: number;
  postEngagementChange: number;
  completionRate: number;
  completionRateChange: number;
  averageRating: number;
  totalEarnings: number;
  earningsChange: number;
  monthlyData: MonthlyData[];
  recentActivity: ActivityItem[];
}

export interface MonthlyData {
  month: string;
  views: number;
  requests: number;
  earnings: number;
}

export interface ActivityItem {
  id: string;
  type: 'view' | 'request' | 'job' | 'review';
  description: string;
  date: string;
  icon?: string;
}

export interface DashboardStats {
  totalClients: number;
  totalClientsChange: number;
  activeRequests: number;
  activeRequestsChange: number;
  completedJobs: number;
  completedJobsChange: number;
  averageRating: number;
  averageRatingChange: number;
}