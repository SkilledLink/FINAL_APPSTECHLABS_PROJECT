import React, { useEffect, useState } from 'react';
import {
  DashboardSidebar,
  type DashboardTab,
} from '../components/DashboardSidebar';
import { DashboardOverview } from '../components/DashboardOverview';
import { RequestsTab } from '../components/tabs/RequestsTab';
import { ActivityTab } from '../components/tabs/ActivityTab';
import { InsightsTab } from '../components/tabs/InsightsTab';
import { AnalyticsTab } from '../components/tabs/AnalyticsTab';
import { ClientsTab } from '../components/tabs/ClientsTab';
import { JobsTab } from '../components/tabs/JobsTab';
import { ReviewsTab } from '../components/tabs/ReviewsTab';
import { EarningsTab } from '../components/tabs/EarningsTab';
import { SettingsTab } from '../components/tabs/SettingsTab';
import { useDashboard } from '../hooks/useDashboard';
import {
  AlertCircle,
  Bell,
  Loader2,
  Menu,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    data,
    isLoading,
    error,
    isRefreshing,
    refreshData,
    updateRequestStatus,
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Desktop: Sidebar collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Mobile: Sidebar open state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Track mobile viewport
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Close mobile sidebar on resize to desktop
      if (!mobile && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileSidebarOpen]);

  // Desktop hover handlers
  const handleSidebarMouseEnter = () => {
    if (!isMobile) {
      setIsSidebarCollapsed(false);
    }
  };

  const handleSidebarMouseLeave = () => {
    if (!isMobile) {
      setIsSidebarCollapsed(true);
    }
  };

  // Mobile toggle
  const handleMobileMenuToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileSidebarOpen(false);
  };

  // Desktop toggle
  const handleSidebarToggle = () => {
    if (!isMobile) {
      setIsSidebarCollapsed(prev => !prev);
    }
  };

  const renderContent = () => {
    if (!data) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <DashboardOverview
            data={data}
            onRefresh={refreshData}
            isRefreshing={isRefreshing}
            onRequestStatusUpdate={updateRequestStatus}
          />
        );

      case 'requests':
        return (
          <RequestsTab
            requests={data.recentRequests}
            onStatusUpdate={updateRequestStatus}
          />
        );

      case 'activity':
        return (
          <ActivityTab
            activities={data.recentActivities}
          />
        );

      case 'insights':
        return (
          <InsightsTab
            insights={data.aiInsights}
          />
        );

      case 'analytics':
        return (
          <AnalyticsTab
            data={data.analytics}
          />
        );

      case 'clients':
        return <ClientsTab />;

      case 'jobs':
        return <JobsTab />;

      case 'reviews':
        return <ReviewsTab />;

      case 'earnings':
        return <EarningsTab />;

      case 'settings':
        return <SettingsTab />;

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Unable to Load Dashboard
          </h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-600">No dashboard data available.</p>
          <button
            onClick={refreshData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Desktop: Add left padding to main content to account for sidebar
  const desktopPadding = !isMobile ? (isSidebarCollapsed ? 'pl-20' : 'pl-64') : '';

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50">
      {/* Mobile Header with Menu Button */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleMobileMenuToggle}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
              <p className="text-xs text-gray-600">Professional Network</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <img
              src="https://ui-avatars.com/api/?name=Jean-Pierre+Mbock&size=32&background=0D9488&color=fff"
              alt="User"
              className="w-8 h-8 rounded-full object-cover border-2 border-blue-100"
            />
          </div>
        </div>
      )}

      {/* Sidebar - Overlay style, doesn't affect content */}
      {isMobile ? (
        <DashboardSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isMobile={true}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={handleMobileMenuClose}
        />
      ) : (
        <div
          onMouseEnter={handleSidebarMouseEnter}
          onMouseLeave={handleSidebarMouseLeave}
        >
          <DashboardSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleSidebarToggle}
            isMobile={false}
          />
        </div>
      )}

      {/* Main Content - With padding for desktop sidebar */}
      <main className={`transition-all duration-300 ${desktopPadding}`}>
        <div className={`w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 ${
          isMobile ? 'pt-20' : ''
        }`}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};