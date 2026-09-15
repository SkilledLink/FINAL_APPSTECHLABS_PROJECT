import type {
  ModeratorOverviewStats,
  ModeratorAnalyticsData,
  ModeratorActivityItem,
} from '../types/moderator.types';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const stats: ModeratorOverviewStats = {
  pendingReports: 27,
  pendingReportsChange: 15.6,
  resolvedToday: 42,
  resolvedTodayChange: 8.3,
  flaggedContent: 14,
  flaggedContentChange: -6.1,
  suspendedUsers: 5,
  suspendedUsersChange: 2.4,
  avgResponseTime: 18,
  avgResponseTimeChange: -12.5,
  actionsThisWeek: 214,
  actionsThisWeekChange: 9.8,
};

const analytics: ModeratorAnalyticsData = {
  reportsHandled: [
    { date: '2025-01-10', count: 32 },
    { date: '2025-01-11', count: 41 },
    { date: '2025-01-12', count: 28 },
    { date: '2025-01-13', count: 54 },
    { date: '2025-01-14', count: 47 },
    { date: '2025-01-15', count: 61 },
    { date: '2025-01-16', count: 58 },
  ],
  reportsByReason: [
    { name: 'Spam', count: 68 },
    { name: 'Harassment', count: 42 },
    { name: 'Fake profile', count: 31 },
    { name: 'Inappropriate', count: 24 },
    { name: 'Fraud', count: 17 },
  ],
  topReportedCategories: [
    { name: 'Feeds', count: 86 },
    { name: 'Users', count: 61 },
    { name: 'Professionals', count: 44 },
    { name: 'Jobs', count: 28 },
    { name: 'Comments', count: 19 },
  ],
};

const activity: ModeratorActivityItem[] = [
  {
    id: 'a1',
    type: 'report_resolved',
    description: 'Resolved report against feed #4821',
    actor: { name: 'Marie Moderator', avatar: 'https://i.pravatar.cc/80?img=20' },
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: 'a2',
    type: 'content_removed',
    description: 'Removed spam feed by Alain Tchoumi',
    actor: { name: 'Marie Moderator', avatar: 'https://i.pravatar.cc/80?img=20' },
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  },
  {
    id: 'a3',
    type: 'user_suspended',
    description: 'Suspended user Claudine Etoundi for harassment',
    actor: { name: 'Paul Supervisor', avatar: 'https://i.pravatar.cc/80?img=15' },
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
  },
  {
    id: 'a4',
    type: 'report_dismissed',
    description: 'Dismissed false report on Kevin Essomba',
    actor: { name: 'Marie Moderator', avatar: 'https://i.pravatar.cc/80?img=20' },
    timestamp: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
  },
  {
    id: 'a5',
    type: 'user_warned',
    description: 'Issued warning to Yannick Fotso',
    actor: { name: 'Paul Supervisor', avatar: 'https://i.pravatar.cc/80?img=15' },
    timestamp: new Date(Date.now() - 1000 * 60 * 340).toISOString(),
  },
];

export const overviewService = {
  async getStats(): Promise<ModeratorOverviewStats> {
    await delay();
    return stats;
  },
  async getAnalytics(): Promise<ModeratorAnalyticsData> {
    await delay();
    return analytics;
  },
  async getActivity(): Promise<ModeratorActivityItem[]> {
    await delay();
    return activity;
  },
};