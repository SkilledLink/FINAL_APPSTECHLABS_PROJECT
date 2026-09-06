// import type { Post, Highlight } from '../features/posts/types/post.types';
import type { Post, Highlight } from '../features/posts/types/post.types';
import type { HomeData } from '../types/home';

// export const mockHighlights: Highlight[] = [
//   { id: '1', label: 'Cabinetry', imageUrl: 'https://via.placeholder.com/150/FF5733/FFFFFF?text=C' },
//   { id: '2', label: 'Pipe Fix', imageUrl: 'https://via.placeholder.com/150/33FF57/FFFFFF?text=P' },
//   { id: '3', label: 'Painting', imageUrl: 'https://via.placeholder.com/150/3357FF/FFFFFF?text=Pa' },
// ];

// export const mockPosts: Post[] = [
//   {
//     id: 'post-1',
//     author: {
//       id: 'user-1',
//       name: 'Sarah Jenkins',
//       title: 'Master Electrician',
//       avatarUrl: 'https://i.pravatar.cc/150?img=47', // Mock avatar
//       isVerified: true,
//     },
//     title: 'Residential Rewiring',
//     content: 'Just wrapped up a full residential panel upgrade. Clean lines, proper labeling, and ready for the next 30 years.',
//     hashtags: ['#Electrician'],
//     imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80', // Mock electrical panel
//     location: 'Austin, TX', // 👈 ADD THIS
//     createdAt: '2h',
//     initialLikes: 124,
//     initialComments: 18,
//     isLiked: false,
//     isAppreciated: false,
//     isRequested: false,
//   },
//   // Add more mock posts here if needed
// ];


import { User, Service, Request, PortfolioItem, Job, AnalyticsData, DashboardStats } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=3B82F6&color=fff&size=128',
  profession: 'Electrician',
  location: 'Douala, Cameroon',
  rating: 4.8,
  totalClients: 5423,
  activeRequests: 12,
  completedJobs: 189,
  available: true,
  joinedDate: '2024-01-15'
};

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Residential Electrical Installation',
    description: 'Complete electrical installation for residential buildings including wiring, outlets, switches, and circuit breakers.',
    price: 25000,
    duration: '2-3 hours',
    category: 'Installation',
    availability: true,
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400'
  },
  {
    id: '2',
    name: 'Solar Panel Installation',
    description: 'Professional solar panel system installation for homes and businesses. Includes mounting, wiring, and inverter setup.',
    price: 150000,
    duration: '4-6 hours',
    category: 'Solar',
    availability: true,
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400'
  },
  {
    id: '3',
    name: 'Electrical Repairs & Maintenance',
    description: 'Troubleshooting and repair of electrical issues including faulty wiring, broken switches, and power outages.',
    price: 15000,
    duration: '1-2 hours',
    category: 'Repair',
    availability: true,
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400'
  },
  {
    id: '4',
    name: 'Smart Home Automation',
    description: 'Installation and configuration of smart home systems including lighting, security, and climate control.',
    price: 75000,
    duration: '3-4 hours',
    category: 'Automation',
    availability: false,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400'
  },
  {
    id: '5',
    name: 'Commercial Electrical Systems',
    description: 'Electrical system design and installation for commercial spaces including offices, shops, and restaurants.',
    price: 50000,
    duration: '5-8 hours',
    category: 'Commercial',
    availability: true,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400'
  }
];

export const mockRequests: Request[] = [
  {
    id: '1',
    clientName: 'Jane Cooper',
    clientAvatar: 'https://ui-avatars.com/api/?name=Jane+Cooper&background=6366F1&color=fff&size=64',
    service: 'Solar Panel Installation',
    serviceType: 'Solar',
    date: '2026-09-05T10:00:00',
    location: 'Bonapriso, Douala',
    status: 'pending',
    budget: 150000,
    description: 'Need solar panel installation for a 3-bedroom house. System should be able to power all appliances.'
  },
  {
    id: '2',
    clientName: 'Floyd Miles',
    clientAvatar: 'https://ui-avatars.com/api/?name=Floyd+Miles&background=8B5CF6&color=fff&size=64',
    service: 'Electrical Repairs',
    serviceType: 'Repair',
    date: '2026-09-04T14:30:00',
    location: 'Bepanda, Douala',
    status: 'accepted',
    budget: 15000,
    description: 'Faulty wiring in the kitchen causing power outages. Need immediate repair.'
  },
  {
    id: '3',
    clientName: 'Ronald Richards',
    clientAvatar: 'https://ui-avatars.com/api/?name=Ronald+Richards&background=EC4899&color=fff&size=64',
    service: 'Residential Electrical Installation',
    serviceType: 'Installation',
    date: '2026-09-03T09:00:00',
    location: 'Makepe, Douala',
    status: 'completed',
    budget: 25000,
    description: 'Complete electrical installation for new apartment building.'
  },
  {
    id: '4',
    clientName: 'Marvin McKinney',
    clientAvatar: 'https://ui-avatars.com/api/?name=Marvin+McKinney&background=F59E0B&color=fff&size=64',
    service: 'Smart Home Automation',
    serviceType: 'Automation',
    date: '2026-09-02T16:00:00',
    location: 'Bonanjo, Douala',
    status: 'pending',
    budget: 75000,
    description: 'Install smart lighting and security system in a luxury apartment.'
  },
  {
    id: '5',
    clientName: 'Jerome Bell',
    clientAvatar: 'https://ui-avatars.com/api/?name=Jerome+Bell&background=10B981&color=fff&size=64',
    service: 'Commercial Electrical Systems',
    serviceType: 'Commercial',
    date: '2026-09-01T11:00:00',
    location: 'Akwa, Douala',
    status: 'pending',
    budget: 50000,
    description: 'Electrical system upgrade for a restaurant. Need additional circuits and lighting.'
  },
  {
    id: '6',
    clientName: 'Kathryn Murphy',
    clientAvatar: 'https://ui-avatars.com/api/?name=Kathryn+Murphy&background=3B82F6&color=fff&size=64',
    service: 'Electrical Repairs',
    serviceType: 'Repair',
    date: '2026-08-31T08:30:00',
    location: 'Bali, Douala',
    status: 'completed',
    budget: 15000,
    description: 'Emergency repair for complete power failure in a residential building.'
  }
];

export const mockPortfolio: PortfolioItem[] = [
  {
    id: '1',
    title: 'Solar System Installation - Bonapriso',
    description: 'Installed a 5kW solar power system for a residential property. Included 12 panels, inverter, and battery backup.',
    category: 'Solar',
    images: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600',
      'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=600'
    ],
    date: '2026-08-28',
    clientName: 'Sarah Johnson',
    clientFeedback: 'Excellent work! The system is working perfectly and we\'ve already seen a significant reduction in our electricity bills.',
    rating: 5,
    location: 'Bonapriso, Douala'
  },
  {
    id: '2',
    title: 'Complete Wiring - New Apartment Building',
    description: 'Full electrical wiring for a 6-unit apartment building. Included distribution boards, wiring, outlets, and lighting.',
    category: 'Installation',
    images: [
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600'
    ],
    date: '2026-08-20',
    clientName: 'David Chen',
    clientFeedback: 'Professional and efficient. Completed the job ahead of schedule. Highly recommend!',
    rating: 5,
    location: 'Makepe, Douala'
  },
  {
    id: '3',
    title: 'Smart Home System - Bonanjo',
    description: 'Installed comprehensive smart home system including lighting control, security cameras, and automated climate control.',
    category: 'Automation',
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?w=600',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600'
    ],
    date: '2026-08-15',
    clientName: 'Michael Brown',
    clientFeedback: 'The smart home system works flawlessly. John was very knowledgeable and professional throughout the process.',
    rating: 4,
    location: 'Bonanjo, Douala'
  },
  {
    id: '4',
    title: 'Restaurant Electrical Upgrade',
    description: 'Complete electrical system upgrade for a busy restaurant. Added new circuits, upgraded the main panel, and installed new lighting.',
    category: 'Commercial',
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600',
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600'
    ],
    date: '2026-08-10',
    clientName: 'Alice Wong',
    clientFeedback: 'Great work! The restaurant is now much safer and the new lighting looks amazing.',
    rating: 5,
    location: 'Akwa, Douala'
  }
];

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Electrician - Construction Project',
    company: 'BuildTech Construction',
    companyLogo: 'https://ui-avatars.com/api/?name=BuildTech&background=3B82F6&color=fff&size=64',
    location: 'Douala, Cameroon',
    type: 'contract',
    salary: '250,000 - 350,000 FCFA/month',
    postedDate: '2026-09-01',
    status: 'applied',
    description: 'Looking for an experienced electrician to lead electrical work on a large commercial construction project. Must have experience with commercial electrical systems and team leadership.',
    requirements: [
      '5+ years of electrical experience',
      'Commercial project experience',
      'Team leadership skills',
      'Valid electrical certification',
      'Knowledge of Cameroonian electrical codes'
    ]
  },
  {
    id: '2',
    title: 'Maintenance Electrician',
    company: 'Premier Resorts',
    companyLogo: 'https://ui-avatars.com/api/?name=Premier+Resorts&background=8B5CF6&color=fff&size=64',
    location: 'Kribi, Cameroon',
    type: 'full-time',
    salary: '180,000 - 250,000 FCFA/month',
    postedDate: '2026-08-28',
    status: 'saved',
    description: 'Resort seeking a maintenance electrician to handle all electrical maintenance and repairs. Includes troubleshooting, preventive maintenance, and emergency repairs.',
    requirements: [
      '3+ years of maintenance experience',
      'Knowledge of electrical systems',
      'Problem-solving skills',
      'Available for emergency calls'
    ]
  },
  {
    id: '3',
    title: 'Solar Installation Technician',
    company: 'Green Energy Solutions',
    companyLogo: 'https://ui-avatars.com/api/?name=Green+Energy&background=10B981&color=fff&size=64',
    location: 'Yaoundé, Cameroon',
    type: 'freelance',
    salary: '150,000 - 200,000 FCFA/project',
    postedDate: '2026-08-25',
    status: 'applied',
    description: 'Seeking freelance solar installation technicians for residential and commercial solar projects. Work on a project basis with flexible hours.',
    requirements: [
      'Solar installation experience',
      'Knowledge of solar systems',
      'Ability to work independently',
      'Own tools and transportation'
    ]
  },
  {
    id: '4',
    title: 'Electrical Supervisor',
    company: 'Cameroon Power Company',
    companyLogo: 'https://ui-avatars.com/api/?name=Cameroon+Power&background=F59E0B&color=fff&size=64',
    location: 'Douala, Cameroon',
    type: 'full-time',
    salary: '300,000 - 400,000 FCFA/month',
    postedDate: '2026-08-20',
    status: 'interviewing',
    description: 'Supervise electrical installation and maintenance projects across the city. Manage teams of electricians and ensure quality and safety standards.',
    requirements: [
      '7+ years of electrical experience',
      'Supervisory experience',
      'Strong knowledge of electrical codes',
      'Leadership and communication skills'
    ]
  }
];

export const mockAnalytics: AnalyticsData = {
  profileViews: 2847,
  profileViewsChange: 12.5,
  searchAppearances: 5231,
  searchAppearancesChange: 8.3,
  postEngagement: 1892,
  postEngagementChange: -2.1,
  completionRate: 94,
  completionRateChange: 3.2,
  averageRating: 4.8,
  totalEarnings: 4250000,
  earningsChange: 15.7,
  monthlyData: [
    { month: 'Jan', views: 1200, requests: 45, earnings: 350000 },
    { month: 'Feb', views: 1400, requests: 52, earnings: 420000 },
    { month: 'Mar', views: 1100, requests: 38, earnings: 300000 },
    { month: 'Apr', views: 1600, requests: 60, earnings: 480000 },
    { month: 'May', views: 1800, requests: 55, earnings: 520000 },
    { month: 'Jun', views: 2000, requests: 68, earnings: 600000 },
    { month: 'Jul', views: 1700, requests: 50, earnings: 450000 },
    { month: 'Aug', views: 2200, requests: 72, earnings: 680000 }
  ],
  recentActivity: [
    {
      id: '1',
      type: 'view',
      description: 'Profile viewed by 15 people today',
      date: '2026-09-04T10:30:00'
    },
    {
      id: '2',
      type: 'request',
      description: 'New service request from Jane Cooper',
      date: '2026-09-04T09:15:00'
    },
    {
      id: '3',
      type: 'review',
      description: '5-star review from Michael Brown',
      date: '2026-09-03T16:45:00'
    },
    {
      id: '4',
      type: 'job',
      description: 'New job posting: Senior Electrician',
      date: '2026-09-03T14:00:00'
    }
  ]
};

export const mockStats: DashboardStats = {
  totalClients: 5423,
  totalClientsChange: 16,
  activeRequests: 12,
  activeRequestsChange: -3,
  completedJobs: 189,
  completedJobsChange: 8,
  averageRating: 4.8,
  averageRatingChange: 0.3
    id: 'post-1',
    author: {
      id: 'user-1',
      name: 'Sarah Jenkins',
      title: 'Master Electrician',
      avatarUrl: 'https://i.pravatar.cc/150?img=47',
      isVerified: true,
    },
    title: 'Residential Rewiring',
    content: 'Just wrapped up a full residential panel upgrade. Clean lines, proper labeling, and ready for the next 30 years.',
    hashtags: ['#Electrician'],
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80',
    location: 'Austin, TX',
    createdAt: '2h',
    initialLikes: 124,
    initialComments: 18,
    isLiked: false,
    isAppreciated: false,
    isRequested: false,
  },
];

export const mockData: HomeData = {
  highlights: mockHighlights,
  posts: mockPosts,
  projects: [
    {
      id: 'project-1',
      title: 'Modern Kitchen Remodel',
      description: 'Full kitchen renovation completed with custom cabinetry and quartz countertops.',
      imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80',
      completedAt: 'Yesterday',
      author: {
        name: 'Alex Rivera',
        avatarUrl: 'https://i.pravatar.cc/150?img=12',
      },
    },
  ],
  questions: [
    {
      id: 'q-1',
      question: 'What is the recommended conduit type for outdoor underground wiring?',
      author: 'David K.',
      answersCount: 14,
      timeAgo: '4h',
    },
  ],
  trendingTrades: [
    { id: 't-1', name: 'Electrical Panel Upgrades', growth: '+28%' },
    { id: 't-2', name: 'Custom Cabinetry', growth: '+19%' },
    { id: 't-3', name: 'HVAC Duct Cleaning', growth: '+15%' },
  ],
  professionals: [
    {
      id: 'pro-1',
      name: 'Marcus Vance',
      trade: 'HVAC Specialist',
      rating: 4.9,
      reviewsCount: 86,
      avatarUrl: 'https://i.pravatar.cc/150?img=33',
    },
  ],
  activities: [
    {
      id: 'act-1',
      user: 'Elena Rostova',
      action: 'commented on Sarah Jenkins\' post',
      timeAgo: '15m ago',
    },
  ],
};