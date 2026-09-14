export interface Professional {
  id: string;
  name: string;
  profession: string;
  location: string;
  rating: number;
  totalClients: number;
  activeRequests: number;
  completedJobs: number;
  available: boolean;
  avatar: string;
  joinedDate: string;
  phone: string;
  email: string;
  description: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  available: boolean;
  image?: string;
}

export interface Request {
  id: string;
  clientName: string;
  clientAvatar: string;
  service: string;
  description: string;
  date: string;
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  location: string;
  budget: number;
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
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  postedDate: string;
  status: 'applied' | 'shortlisted' | 'rejected' | 'interviewing';
  salary: string;
  type: 'full-time' | 'part-time' | 'contract';
  description: string;
}

export interface DashboardStats {
  totalClients: number;
  activeRequests: number;
  completedJobs: number;
  rating: number;
  profileViews: number;
  responseRate: number;
  earnings: number;
  completionRate: number;
}

export interface AnalyticsData {
  views: { date: string; count: number }[];
  requests: { date: string; count: number }[];
  earnings: { date: string; amount: number }[];
  topServices: { name: string; count: number }[];
  ratings: { rating: number; count: number }[];
}