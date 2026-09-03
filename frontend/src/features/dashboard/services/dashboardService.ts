import type { DashboardData, ServiceRequest, Activity, AIInsight } from '../types/dashboard.types';
import { generateMockData } from '../../../data/mockDashboardData';

// Mock service with simulated API delay
export const dashboardService = {
  getDashboardData: async (professionalId?: string): Promise<DashboardData> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    return generateMockData();
  },

  getStats: async (professionalId?: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const data = generateMockData();
    return data.stats;
  },

  getRecentRequests: async (professionalId?: string, limit: number = 5) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = generateMockData();
    return data.recentRequests.slice(0, limit);
  },

  getRecentActivity: async (professionalId?: string, limit: number = 5) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = generateMockData();
    return data.recentActivities.slice(0, limit);
  },

  getAIInsights: async (professionalId?: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = generateMockData();
    return data.aiInsights;
  },

  updateRequestStatus: async (requestId: string, status: string) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    // In a real app, this would make an API call
    return { success: true, requestId, status };
  }
};