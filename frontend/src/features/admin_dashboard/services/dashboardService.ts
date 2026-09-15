import type {
  Professional,
  Service,
  Request,
  PortfolioItem,
  Job,
  DashboardStats,
  AnalyticsData,
} from '../types/admin.types';

// Mock Professional Data
const mockProfessional: Professional = {
  id: 'prof_001',
  name: 'John Doe',
  profession: 'Master Electrician',
  location: 'Douala, Cameroon',
  rating: 4.8,
  totalClients: 5423,
  activeRequests: 12,
  completedJobs: 189,
  available: true,
  avatar: 'https://i.pravatar.cc/150?img=12',
  joinedDate: '2023-01-15',
  phone: '+237 691 234 567',
  email: 'john.doe@example.com',
  description:
    'Certified master electrician with over 10 years of experience in residential and commercial electrical installations, solar systems, and smart home automation.',
};

// Mock Services
const mockServices: Service[] = [
  {
    id: 'svc_001',
    name: 'Residential Electrical Installation',
    description: 'Complete electrical wiring and installation for residential buildings including lighting, outlets, and breaker panels.',
    price: 25000,
    duration: '2-3 hours',
    category: 'Installation',
    available: true,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300',
  },
  {
    id: 'svc_002',
    name: 'Solar System Installation',
    description: 'Professional solar panel and inverter system installation for homes and businesses.',
    price: 150000,
    duration: '1-2 days',
    category: 'Solar',
    available: true,
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300',
  },
  {
    id: 'svc_003',
    name: 'Electrical Repairs & Maintenance',
    description: 'Troubleshooting and repair of electrical faults, circuit issues, and appliance wiring problems.',
    price: 15000,
    duration: '1-2 hours',
    category: 'Repairs',
    available: true,
  },
  {
    id: 'svc_004',
    name: 'Smart Home Automation',
    description: 'Installation and configuration of smart home systems including lighting, security, and climate control.',
    price: 200000,
    duration: '2-3 days',
    category: 'Automation',
    available: false,
  },
  {
    id: 'svc_005',
    name: 'Commercial Electrical Work',
    description: 'Electrical services for commercial buildings including offices, shops, and industrial facilities.',
    price: 75000,
    duration: '4-6 hours',
    category: 'Commercial',
    available: true,
  },
];

// Mock Requests
const mockRequests: Request[] = [
  {
    id: 'req_001',
    clientName: 'Jane Cooper',
    clientAvatar: 'https://i.pravatar.cc/150?img=5',
    service: 'Solar System Installation',
    description: 'Need a 5kW solar system installed at my residence in Bonapriso.',
    date: '2026-09-05',
    status: 'pending',
    location: 'Bonapriso, Douala',
    budget: 150000,
  },
  {
    id: 'req_002',
    clientName: 'Paul Smith',
    clientAvatar: 'https://i.pravatar.cc/150?img=11',
    service: 'Electrical Repairs',
    description: 'Frequent power outages in my apartment. Need a full inspection and repair.',
    date: '2026-09-04',
    status: 'pending',
    location: 'Bali, Douala',
    budget: 20000,
  },
  {
    id: 'req_003',
    clientName: 'Marie Claire',
    clientAvatar: 'https://i.pravatar.cc/150?img=25',
    service: 'Smart Home Automation',
    description: 'I want to automate lighting and security in my new house.',
    date: '2026-09-03',
    status: 'accepted',
    location: 'Bonanjo, Douala',
    budget: 200000,
  },
  {
    id: 'req_004',
    clientName: 'Thomas Nkeng',
    clientAvatar: 'https://i.pravatar.cc/150?img=33',
    service: 'Residential Electrical Installation',
    description: 'New construction needs complete electrical wiring for a 4-bedroom house.',
    date: '2026-09-02',
    status: 'completed',
    location: 'Akwa, Douala',
    budget: 25000,
  },
  {
    id: 'req_005',
    clientName: 'Sarah Wamba',
    clientAvatar: 'https://i.pravatar.cc/150?img=44',
    service: 'Commercial Electrical Work',
    description: 'Electrical setup for a new retail shop in the city center.',
    date: '2026-09-01',
    status: 'declined',
    location: 'Bekoko, Douala',
    budget: 75000,
  },
];

// Mock Portfolio Items
const mockPortfolio: PortfolioItem[] = [
  {
    id: 'port_001',
    title: 'Modern Villa Electrical System',
    description: 'Complete electrical installation for a luxury villa including smart home features, lighting design, and security systems.',
    category: 'Residential',
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
      'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=400',
    ],
    date: '2026-08-15',
    clientName: 'Mr. Jean Nana',
    clientFeedback: 'Excellent work! John delivered on time and the quality is top-notch.',
    rating: 5,
  },
  {
    id: 'port_002',
    title: 'Solar Installation for Ecole Saint Michel',
    description: 'Installed a 10kW solar system for a school to provide reliable electricity for classrooms and administrative offices.',
    category: 'Solar',
    images: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
      'https://images.unsplash.com/photo-1613665813446-82a78c468a1f?w=400',
    ],
    date: '2026-07-20',
    clientName: 'Ecole Saint Michel',
    clientFeedback: 'The school now has uninterrupted power. Highly recommended!',
    rating: 5,
  },
  {
    id: 'port_003',
    title: 'Office Building Electrical Upgrade',
    description: 'Upgraded electrical systems for a 5-story office building including new panel boards, wiring, and safety systems.',
    category: 'Commercial',
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'],
    date: '2026-06-10',
    clientName: 'ABC Logistics',
    clientFeedback: 'Professional service from start to finish.',
    rating: 4,
  },
];

// Mock Jobs
const mockJobs: Job[] = [
  {
    id: 'job_001',
    title: 'Senior Electrician for Construction Project',
    company: 'BuildTech Construction Ltd',
    location: 'Douala, Cameroon',
    postedDate: '2026-09-01',
    status: 'applied',
    salary: '350,000 - 450,000 FCFA',
    type: 'full-time',
    description:
      'Looking for an experienced electrician to lead electrical installations on a large residential construction project.',
  },
  {
    id: 'job_002',
    title: 'Solar Installation Technician',
    company: 'Green Energy Solutions',
    location: 'Yaoundé, Cameroon',
    postedDate: '2026-08-28',
    status: 'shortlisted',
    salary: '250,000 - 300,000 FCFA',
    type: 'contract',
    description:
      'Seeking a certified solar installation technician for multiple residential and commercial projects.',
  },
  {
    id: 'job_003',
    title: 'Maintenance Electrician',
    company: 'Hotel Savana',
    location: 'Kribi, Cameroon',
    postedDate: '2026-08-15',
    status: 'interviewing',
    salary: '200,000 FCFA',
    type: 'full-time',
    description:
      'Hotel maintenance electrician responsible for all electrical systems and guest room repairs.',
  },
  {
    id: 'job_004',
    title: 'Electrical Inspector',
    company: 'City Council of Douala',
    location: 'Douala, Cameroon',
    postedDate: '2026-08-10',
    status: 'rejected',
    salary: '280,000 - 320,000 FCFA',
    type: 'full-time',
    description:
      'Government position for electrical inspection of new constructions and renovations.',
  },
];

// Mock Analytics Data
const mockAnalytics: AnalyticsData = {
  views: [
    { date: '2026-08-25', count: 45 },
    { date: '2026-08-26', count: 52 },
    { date: '2026-08-27', count: 38 },
    { date: '2026-08-28', count: 67 },
    { date: '2026-08-29', count: 73 },
    { date: '2026-08-30', count: 81 },
    { date: '2026-08-31', count: 96 },
    { date: '2026-09-01', count: 88 },
    { date: '2026-09-02', count: 94 },
    { date: '2026-09-03', count: 102 },
    { date: '2026-09-04', count: 115 },
  ],
  requests: [
    { date: '2026-08-25', count: 3 },
    { date: '2026-08-26', count: 5 },
    { date: '2026-08-27', count: 2 },
    { date: '2026-08-28', count: 7 },
    { date: '2026-08-29', count: 4 },
    { date: '2026-08-30', count: 6 },
    { date: '2026-08-31', count: 8 },
    { date: '2026-09-01', count: 5 },
    { date: '2026-09-02', count: 9 },
    { date: '2026-09-03', count: 6 },
    { date: '2026-09-04', count: 12 },
  ],
  earnings: [
    { date: '2026-08-25', amount: 25000 },
    { date: '2026-08-26', amount: 0 },
    { date: '2026-08-27', amount: 15000 },
    { date: '2026-08-28', amount: 75000 },
    { date: '2026-08-29', amount: 25000 },
    { date: '2026-08-30', amount: 0 },
    { date: '2026-08-31', amount: 200000 },
    { date: '2026-09-01', amount: 15000 },
    { date: '2026-09-02', amount: 25000 },
    { date: '2026-09-03', amount: 75000 },
    { date: '2026-09-04', amount: 0 },
  ],
  topServices: [
    { name: 'Solar System Installation', count: 12 },
    { name: 'Residential Electrical Installation', count: 8 },
    { name: 'Electrical Repairs', count: 6 },
    { name: 'Commercial Electrical Work', count: 4 },
  ],
  ratings: [
    { rating: 5, count: 45 },
    { rating: 4, count: 12 },
    { rating: 3, count: 3 },
    { rating: 2, count: 1 },
    { rating: 1, count: 0 },
  ],
};

// Mock Dashboard Stats
const mockStats: DashboardStats = {
  totalClients: 5423,
  activeRequests: 12,
  completedJobs: 189,
  rating: 4.8,
  profileViews: 2345,
  responseRate: 94,
  earnings: 425000,
  completionRate: 98,
};

// Service functions
export const dashboardService = {
  getProfessional: (): Promise<Professional> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockProfessional), 300);
    });
  },

  getStats: (): Promise<DashboardStats> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockStats), 300);
    });
  },

  getServices: (): Promise<Service[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockServices), 300);
    });
  },

  getRequests: (): Promise<Request[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockRequests), 300);
    });
  },

  getPortfolio: (): Promise<PortfolioItem[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockPortfolio), 300);
    });
  },

  getJobs: (): Promise<Job[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockJobs), 300);
    });
  },

  getAnalytics: (): Promise<AnalyticsData> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockAnalytics), 400);
    });
  },

  updateAvailability: (available: boolean): Promise<Professional> => {
    return new Promise((resolve) => {
      mockProfessional.available = available;
      setTimeout(() => resolve(mockProfessional), 200);
    });
  },

  updateRequestStatus: (requestId: string, status: Request['status']): Promise<Request> => {
    return new Promise((resolve, reject) => {
      const request = mockRequests.find((r) => r.id === requestId);
      if (!request) {
        reject(new Error('Request not found'));
        return;
      }
      request.status = status;
      setTimeout(() => resolve(request), 200);
    });
  },
};