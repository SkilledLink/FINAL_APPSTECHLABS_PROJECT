import type { UserProfile } from '../types/profile.types';

const MOCK_PROFILE: UserProfile = {
  id: 'prof_001',
  userId: 'u_1',
  name: 'Sarah Jenkins',
  email: 'sarah.j@example.com',
  role: 'PROFESSIONAL',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
  coverImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200',
  headline: 'Master Carpenter & Custom Cabinetry Specialist',
  bio: 'Over 10 years of experience in residential custom woodworking, architectural trim, and high-end cabinetry installations.',
  location: 'Austin, TX',
  isVerified: true,
  hourlyRate: 85,
  rating: 4.9,
  reviewCount: 42,
  completedJobsCount: 128,
  skills: [
    { id: 'sk_1', name: 'Custom Cabinetry', category: 'Woodworking', endorsements: 24 },
    { id: 'sk_2', name: 'Finish Carpentry', category: 'Construction', endorsements: 18 },
    { id: 'sk_3', name: '3D CAD Design', category: 'Planning', endorsements: 12 },
  ],
  experience: [
    {
      id: 'exp_1',
      title: 'Lead Carpenter',
      companyName: 'Apex Artisan Builders',
      location: 'Austin, TX',
      startDate: '2020-01',
      isCurrent: true,
      description: 'Overseeing residential custom remodeling projects and architectural woodwork.',
    },
    {
      id: 'exp_2',
      title: 'Woodworking Apprentice',
      companyName: 'Heritage Joinery Shop',
      location: 'Dallas, TX',
      startDate: '2016-03',
      endDate: '2019-12',
      isCurrent: false,
      description: 'Fabrication of handcrafted furniture and commercial millwork.',
    },
  ],
  createdAt: '2021-04-15',
};

export const profileService = {
  async getProfileById(id: string): Promise<UserProfile> {
    // Simulated API call delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_PROFILE;
  },

  async updateProfile(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { ...MOCK_PROFILE, ...data };
  },
};