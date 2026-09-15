import type {
  AdminOverviewStats,
  AdminAnalyticsData,
  AdminActivityItem,
} from '../types/admin.types';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const stats: AdminOverviewStats = {
  totalUsers: 12480,
  totalUsersChange: 8.4,
  totalProfessionals: 1842,
  totalProfessionalsChange: 12.1,
  activeJobs: 356,
  activeJobsChange: -2.3,
  pendingModeration: 27,
  pendingModerationChange: 15.6,
  totalRevenue: 48_250_000,
  totalRevenueChange: 18.7,
  newSignups: 342,
  newSignupsChange: 6.2,
};

const analytics: AdminAnalyticsData = {
  userGrowth: [
    { date: '2025-01-10', count: 42 },
    { date: '2025-01-11', count: 55 },
    { date: '2025-01-12', count: 38 },
    { date: '2025-01-13', count: 71 },
    { date: '2025-01-14', count: 64 },
    { date: '2025-01-15', count: 82 },
    { date: '2025-01-16', count: 96 },
  ],
  jobActivity: [
    { date: '2025-01-10', count: 18 },
    { date: '2025-01-11', count: 24 },
    { date: '2025-01-12', count: 15 },
    { date: '2025-01-13', count: 32 },
    { date: '2025-01-14', count: 28 },
    { date: '2025-01-15', count: 41 },
    { date: '2025-01-16', count: 37 },
  ],
  revenueByCategory: [
    { name: 'Electrical', amount: 12_400_000 },
    { name: 'Plumbing', amount: 9_800_000 },
    { name: 'Carpentry', amount: 7_250_000 },
    { name: 'Cleaning', amount: 5_600_000 },
    { name: 'Painting', amount: 4_100_000 },
  ],
  topCategories: [
    { name: 'Electrical', count: 128 },
    { name: 'Plumbing', count: 96 },
    { name: 'Carpentry', count: 74 },
    { name: 'Cleaning', count: 61 },
    { name: 'Painting', count: 48 },
  ],
};

const activity: AdminActivityItem[] = [
  {
    id: 'a1',
    type: 'professional_verified',
    description: 'Verified professional account for Marie Nkeng',
    actor: { name: 'Admin Jean', avatar: 'https://i.pravatar.cc/80?img=12' },
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'a2',
    type: 'job_posted',
    description: 'New job posted: "Emergency plumbing repair"',
    actor: { name: 'Paul Biya', avatar: 'https://i.pravatar.cc/80?img=33' },
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'a3',
    type: 'report_created',
    description: 'Report filed against feed #4821',
    actor: { name: 'Sarah Mbah', avatar: 'https://i.pravatar.cc/80?img=45' },
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'a4',
    type: 'user_signup',
    description: 'New user registered: Yannick Fotso',
    actor: { name: 'System', avatar: 'https://i.pravatar.cc/80?img=8' },
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'a5',
    type: 'admin_action',
    description: 'Suspended account for policy violation',
    actor: { name: 'Admin Ruth', avatar: 'https://i.pravatar.cc/80?img=20' },
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  },
];

export const overviewService = {
  async getStats(): Promise<AdminOverviewStats> {
    await delay();
    return stats;
  },
  async getAnalytics(): Promise<AdminAnalyticsData> {
    await delay();
    return analytics;
  },
  async getActivity(): Promise<AdminActivityItem[]> {
    await delay();
    return activity;
  },
};