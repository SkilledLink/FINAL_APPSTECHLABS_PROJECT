import type { DashboardData, ServiceRequest, Activity, AIInsight, AnalyticsData, DashboardStats } from '../types/dashboard.types';

// Generate dates for the last 30 days
const generateDates = (days: number) => {
  const dates = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

const dates30 = generateDates(30);

// Generate analytics data with realistic patterns
export const generateAnalyticsData = (): AnalyticsData => {
  const baseViews = 45;
  const baseRequests = 8;
  const baseJobs = 4;
  const baseEarnings = 50000;

  return {
    viewsData: dates30.map((date, index) => ({
      date,
      count: Math.floor(baseViews + Math.sin(index / 3) * 20 + Math.random() * 15)
    })),
    requestsData: dates30.map((date, index) => ({
      date,
      count: Math.floor(baseRequests + Math.sin(index / 4) * 5 + Math.random() * 4)
    })),
    jobsData: dates30.map((date, index) => ({
      date,
      count: Math.floor(baseJobs + Math.sin(index / 5) * 3 + Math.random() * 2)
    })),
    earningsData: dates30.map((date, index) => ({
      date,
      amount: Math.floor(baseEarnings + Math.sin(index / 4) * 25000 + Math.random() * 15000)
    }))
  };
};

// Mock service requests
export const mockServiceRequests: ServiceRequest[] = [
  {
    id: 'req_001',
    client: {
      id: 'user_101',
      name: 'Marie-Claire Ngo',
      avatar: 'https://ui-avatars.com/api/?name=Marie-Claire+Ngo&size=64&background=6366F1&color=fff',
      location: 'Bonapriso, Douala'
    },
    service: 'Electrical Installation',
    description: 'Need complete electrical wiring for a new 3-bedroom apartment. Must include proper grounding and circuit breakers.',
    date: '2026-09-02T10:30:00',
    status: 'pending',
    price: 250000,
    urgency: 'high',
    category: 'Electrical'
  },
  {
    id: 'req_002',
    client: {
      id: 'user_102',
      name: 'Paul Ekambi',
      avatar: 'https://ui-avatars.com/api/?name=Paul+Ekambi&size=64&background=0D9488&color=fff',
      location: 'Bepanda, Douala'
    },
    service: 'Solar Panel Installation',
    description: 'Install 6 solar panels on residential roof. Need inverter and battery system setup.',
    date: '2026-09-01T14:20:00',
    status: 'in-progress',
    price: 850000,
    urgency: 'medium',
    category: 'Solar'
  },
  {
    id: 'req_003',
    client: {
      id: 'user_103',
      name: 'Fatima Aboubakar',
      avatar: 'https://ui-avatars.com/api/?name=Fatima+Aboubakar&size=64&background=EC4899&color=fff',
      location: 'Akwa, Douala'
    },
    service: 'Electrical Repairs',
    description: 'Flickering lights in living room and kitchen. Need to check wiring and replace faulty switches.',
    date: '2026-08-30T09:15:00',
    status: 'completed',
    price: 75000,
    urgency: 'low',
    category: 'Electrical'
  },
  {
    id: 'req_004',
    client: {
      id: 'user_104',
      name: 'David Tchoumi',
      avatar: 'https://ui-avatars.com/api/?name=David+Tchoumi&size=64&background=F59E0B&color=fff',
      location: 'Bonamoussadi, Douala'
    },
    service: 'Home Automation',
    description: 'Install smart home system including lighting control, security cameras, and door locks.',
    date: '2026-08-29T16:45:00',
    status: 'declined',
    price: 450000,
    urgency: 'medium',
    category: 'Automation'
  },
  {
    id: 'req_005',
    client: {
      id: 'user_105',
      name: 'Solange Mbia',
      avatar: 'https://ui-avatars.com/api/?name=Solange+Mbia&size=64&background=8B5CF6&color=fff',
      location: 'Makepe, Douala'
    },
    service: 'Electrical Maintenance',
    description: 'Annual electrical inspection and maintenance for commercial building. Need to test all systems and provide report.',
    date: '2026-08-28T11:00:00',
    status: 'pending',
    price: 180000,
    urgency: 'medium',
    category: 'Electrical'
  },
  {
    id: 'req_006',
    client: {
      id: 'user_106',
      name: 'Jean Nganou',
      location: 'Bali, Douala'
    },
    service: 'Generator Installation',
    description: 'Install standby generator for residential property. Need transfer switch and proper ventilation setup.',
    date: '2026-08-27T08:30:00',
    status: 'completed',
    price: 320000,
    urgency: 'high',
    category: 'Generator'
  }
];

// Mock recent activities
export const mockRecentActivities: Activity[] = [
  {
    id: 'act_001',
    type: 'post',
    description: 'You shared a new project: Complete electrical renovation of Villa Marguerite',
    timestamp: '2026-09-02T14:30:00',
    icon: '📸'
  },
  {
    id: 'act_002',
    type: 'like',
    description: 'Marie-Claire Ngo liked your electrical installation post',
    timestamp: '2026-09-02T12:15:00',
    icon: '❤️'
  },
  {
    id: 'act_003',
    type: 'comment',
    description: 'Paul Ekambi commented on your solar panel installation video',
    timestamp: '2026-09-01T18:45:00',
    icon: '💬'
  },
  {
    id: 'act_004',
    type: 'follow',
    description: '3 new professionals followed your profile',
    timestamp: '2026-09-01T16:20:00',
    icon: '👥'
  },
  {
    id: 'act_005',
    type: 'review',
    description: 'Fatima Aboubakar left a 5-star review for your electrical repair service',
    timestamp: '2026-08-31T10:00:00',
    icon: '⭐'
  },
  {
    id: 'act_006',
    type: 'profile_update',
    description: 'You updated your professional catalog - added 2 new services',
    timestamp: '2026-08-30T09:30:00',
    icon: '✏️'
  },
  {
    id: 'act_007',
    type: 'verification',
    description: 'Your professional verification was approved by the review team',
    timestamp: '2026-08-29T15:00:00',
    icon: '✅'
  },
  {
    id: 'act_008',
    type: 'request',
    description: 'New service request: Electrical repairs at Bepanda residence',
    timestamp: '2026-08-29T11:30:00',
    icon: '📩'
  }
];

// Mock AI insights
export const mockAIInsights: AIInsight[] = [
  {
    id: 'ins_001',
    type: 'profile',
    category: 'Profile Optimization',
    title: 'Complete Your Professional Profile',
    description: 'Your profile is 75% complete. Adding your certifications and work experience can increase your visibility by 40%.',
    priority: 'high',
    action: 'Complete Profile',
    actionLink: '/profile/edit'
  },
  {
    id: 'ins_002',
    type: 'services',
    category: 'Service Expansion',
    title: 'Expand Your Service Offerings',
    description: 'Based on popular searches in your area, adding "Smart Home Installation" and "Energy Audit" services could attract 30% more clients.',
    priority: 'high',
    action: 'Add Services',
    actionLink: '/profile/catalog'
  },
  {
    id: 'ins_003',
    type: 'content',
    category: 'Content Strategy',
    title: 'Post More Work Showcases',
    description: 'Professionals who post 2-3 project photos per week receive 60% more engagement. You haven\'t posted in 5 days.',
    priority: 'medium',
    action: 'Share Your Work',
    actionLink: '/feed/compose'
  },
  {
    id: 'ins_004',
    type: 'pricing',
    category: 'Pricing Optimization',
    title: 'Review Your Pricing Strategy',
    description: 'Your current rates are 15% below market average for your experience level in Douala. Consider adjusting your service prices.',
    priority: 'medium',
    action: 'Review Pricing',
    actionLink: '/profile/catalog'
  },
  {
    id: 'ins_005',
    type: 'timing',
    category: 'Engagement Timing',
    title: 'Best Time to Post',
    description: 'Your audience engages most between 7-9 PM on weekdays. Schedule your posts during these hours for maximum visibility.',
    priority: 'low',
    action: 'See Insights',
    actionLink: '/analytics'
  },
  {
    id: 'ins_006',
    type: 'growth',
    category: 'Growth Opportunity',
    title: 'Expand to Neighboring Areas',
    description: 'Professionals in your field are seeing increased demand in Bonapriso and Akwa. Consider promoting your services in these areas.',
    priority: 'medium',
    action: 'Update Service Area',
    actionLink: '/profile/edit'
  }
];

// Main mock data generator
export const generateMockData = (): DashboardData => {
  const analytics = generateAnalyticsData();
  const totalEarnings = analytics.earningsData.reduce((sum, day) => sum + day.amount, 0);

  const stats: DashboardStats = {
    profileViews: 1234,
    profileViewsChange: 12.5,
    serviceRequests: 56,
    serviceRequestsChange: 8.3,
    jobsCompleted: 234,
    jobsCompletedChange: 15.2,
    averageRating: 4.8,
    averageRatingChange: 0.3,
    responseRate: 92,
    responseRateChange: 5,
    profileCompletion: 75,
    totalEarnings: totalEarnings / 100, // Convert to hundreds
    totalEarningsChange: 18.7
  };

  return {
    stats,
    analytics,
    recentRequests: mockServiceRequests,
    recentActivities: mockRecentActivities,
    aiInsights: mockAIInsights
  };
};