import { useState, useEffect, useCallback } from 'react';
import type {
  Professional,
  Service,
  Request,
  PortfolioItem,
  Job,
  DashboardStats,
  AnalyticsData,
} from '../types/dashboard.types';
import { dashboardService } from '../services/dashboardService';

export const useDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [professional, setProfessional] = useState<Professional | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const [activeTab, setActiveTab] = useState('overview');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        profData,
        statsData,
        servicesData,
        requestsData,
        portfolioData,
        jobsData,
        analyticsData,
      ] = await Promise.all([
        dashboardService.getProfessional(),
        dashboardService.getStats(),
        dashboardService.getServices(),
        dashboardService.getRequests(),
        dashboardService.getPortfolio(),
        dashboardService.getJobs(),
        dashboardService.getAnalytics(),
      ]);

      setProfessional(profData);
      setStats(statsData);
      setServices(servicesData);
      setRequests(requestsData);
      setPortfolio(portfolioData);
      setJobs(jobsData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAvailability = useCallback(async (available: boolean) => {
    try {
      const updated = await dashboardService.updateAvailability(available);
      setProfessional(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability');
      throw err;
    }
  }, []);

  const updateRequestStatus = useCallback(
    async (requestId: string, status: Request['status']) => {
      try {
        const updated = await dashboardService.updateRequestStatus(requestId, status);
        setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update request status');
        throw err;
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // State
    loading,
    error,
    professional,
    stats,
    services,
    requests,
    portfolio,
    jobs,
    analytics,
    activeTab,

    // Actions
    setActiveTab,
    updateAvailability,
    updateRequestStatus,
    refresh,
  };
};