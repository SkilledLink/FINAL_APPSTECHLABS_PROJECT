import { useState, useEffect, useCallback } from 'react';
import type { DashboardData } from '../types/dashboard.types';
import { dashboardService } from '../services/dashboardService';

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (professionalId?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await dashboardService.getDashboardData(professionalId);
      setData(result);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
  }, [fetchDashboardData]);

  const updateRequestStatus = useCallback(async (requestId: string, status: string) => {
    try {
      const result = await dashboardService.updateRequestStatus(requestId, status);
      // Update local state
      if (data) {
        setData({
          ...data,
          recentRequests: data.recentRequests.map(req =>
            req.id === requestId ? { ...req, status: status as typeof req.status } : req
          )
        });
      }
      return result;
    } catch (err) {
      console.error('Failed to update request status:', err);
      throw err;
    }
  }, [data]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchDashboardData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchDashboardData]);

  return {
    data,
    isLoading,
    error,
    isRefreshing,
    refreshData,
    updateRequestStatus
  };
};