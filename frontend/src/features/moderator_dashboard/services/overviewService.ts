import { api } from '../api/api';
import type { ModeratorOverviewStats } from '../types/moderator.types';

export const overviewService = {
  async getStats(): Promise<ModeratorOverviewStats> {
    const { data } = await api.get('/admin/dashboard');
    return {
      totalUsers: data.total_users,
      activeUsers: data.active_users,
      suspendedUsers: data.suspended_users,
      totalProfessionals: data.total_professionals,
      verifiedProfessionals: data.verified_professionals,
      pendingProfessionals: data.pending_professionals,
      totalFeeds: data.total_feeds,
      totalJobs: data.total_jobs,
      totalAdmins: data.total_admins,
      totalModerators: data.total_moderators,
      generatedAt: data.generated_at,
    };
  },
};