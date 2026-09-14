import React from 'react';
import { Loader2 } from 'lucide-react';

import { useDashboard } from '../hooks/useDashboard';

import DashboardLayout from '../components/DashboardLayout';
import OverviewTab from '../components/OverviewTab';
import RequestsTab from '../components/RequestsTab';
import ServicesTab from '../components/ServicesTab';
import PortfolioTab from '../components/PortfolioTab';
import JobsTab from '../components/JobsTab';
import AnalyticsTab from '../components/AnalyticsTab';
import SettingsTab from '../components/SettingsTab';

const DashboardPage: React.FC = () => {
  const {
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
    setActiveTab,
    updateAvailability,
    updateRequestStatus,
    refresh,
  } = useDashboard();

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2
            size={40}
            className="mx-auto animate-spin text-blue-500"
          />

          <p className="mt-4 text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* ================= ERROR ================= */

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <span className="text-2xl">⚠️</span>
          </div>

          <h2 className="mt-4 font-medium text-red-600">
            Error loading dashboard
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>

          <button
            onClick={refresh}
            className="mt-5 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Retry
          </button>

        </div>
      </div>
    );
  }

  /* ================= DATA CHECK ================= */

  if (!professional || !stats || !analytics) {
    return null;
  }

  /* ================= TAB CONTENT ================= */

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            stats={stats}
            requests={requests}
          />
        );

      case 'requests':
        return (
          <RequestsTab
            requests={requests}
            onUpdateStatus={updateRequestStatus}
          />
        );

      case 'services':
        return (
          <ServicesTab
            services={services}
          />
        );

      case 'portfolio':
        return (
          <PortfolioTab
            portfolio={portfolio}
          />
        );

      case 'jobs':
        return (
          <JobsTab
            jobs={jobs}
          />
        );

      case 'analytics':
        return (
          <AnalyticsTab
            stats={stats}
            analytics={analytics}
          />
        );

    //   case 'profile':
    //     // return (
    //     //   <ProfileTab
    //     //     professional={professional}
    //     //   />
    //     // );

      case 'settings':
        return <SettingsTab />;

      default:
        return (
          <OverviewTab
            stats={stats}
            requests={requests}
          />
        );
    }
  };

  /* ================= DASHBOARD ================= */

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      professionalName={professional.name}
      professionalAvatar={professional.avatar}
      available={professional.available}
      onAvailabilityToggle={updateAvailability}
    >
      {renderTabContent()}
    </DashboardLayout>
  );
};

export default DashboardPage;
