import React from 'react';
import type { DashboardData } from '../types/dashboard.types';
import { StatsCard } from './StatsCard';
import { AnalyticsChart } from './AnalyticsChart';
import { RecentRequests } from './RecentRequests';
import { RecentActivity } from './RecentActivity';
import { AIInsights } from './AIInsights';
import { RefreshCw, User, Briefcase, Star } from 'lucide-react';

interface DashboardOverviewProps {
  data: DashboardData;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onRequestStatusUpdate?: (requestId: string, status: string) => void;
  userName?: string;
  userProfession?: string;
  userAvatar?: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  data,
  onRefresh,
  isRefreshing = false,
  onRequestStatusUpdate,
  userName = 'Jean-Pierre Mbock',
  userProfession = 'Electrician',
  userAvatar = 'https://ui-avatars.com/api/?name=Jean-Pierre+Mbock&size=128&background=0D9488&color=fff'
}) => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-4">
          <img
            src={userAvatar}
            alt={userName}
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName.split(' ')[0]}!</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Briefcase className="w-4 h-4 text-blue-600" />
                {userProfession}
              </span>
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                4.8 ★ (234 reviews)
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <User className="w-4 h-4" />
            View Profile
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsCard stats={data.stats} />

      {/* Analytics and AI Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsChart data={data.analytics} />
        </div>
        <div className="lg:col-span-1">
          <AIInsights insights={data.aiInsights} />
        </div>
      </div>

      {/* Recent Requests and Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentRequests 
          requests={data.recentRequests} 
          onStatusUpdate={onRequestStatusUpdate}
        />
        <RecentActivity activities={data.recentActivities} />
      </div>
    </div>
  );
};