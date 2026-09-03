import React from 'react';
import { DashboardOverview } from '../components/DashboardOverview';
import { useDashboard } from '../hooks/useDashboard';
import { AlertCircle, Loader2 } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { data, isLoading, error, isRefreshing, refreshData, updateRequestStatus } = useDashboard();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No dashboard data available.</p>
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <DashboardOverview
        data={data}
        onRefresh={refreshData}
        isRefreshing={isRefreshing}
        onRequestStatusUpdate={updateRequestStatus}
        userName="Jean-Pierre Mbock"
        userProfession="Electrician"
        userAvatar="https://ui-avatars.com/api/?name=Jean-Pierre+Mbock&size=128&background=0D9488&color=fff"
      />
    </div>
  );
};