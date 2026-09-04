import React from 'react';
import type { DashboardData } from '../types/dashboard.types';
import { StatsCard } from './StatsCard';
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
  userName = 'Jean-Pierre Mbock',
  userProfession = 'Electrician',
  userAvatar = 'https://ui-avatars.com/api/?name=Jean-Pierre+Mbock&size=128&background=0D9488&color=fff',
}) => {
  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0 overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 w-full min-w-0">

        {/* User Information */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <img
            src={userAvatar}
            alt={userName}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-blue-100 flex-shrink-0"
          />

          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
               {userName.split(' ')[0]}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              <span className="text-sm text-slate-600 flex items-center gap-1 min-w-0">
                <Briefcase className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="truncate">{userProfession}</span>
              </span>

              <span className="text-sm text-slate-600 flex items-center gap-1">
                <Star
                  className="w-4 h-4 text-amber-500 flex-shrink-0"
                  fill="currentColor"
                />
                4.8 (234 reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto justify-end">

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label={
              isRefreshing
                ? 'Refreshing'
                : 'Refresh dashboard'
            }
            title={
              isRefreshing
                ? 'Refreshing'
                : 'Refresh dashboard'
            }
            className="w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 flex-shrink-0"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />

            <span className="hidden sm:inline">
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>

          {/* View Profile */}
          <button
            aria-label="View Profile"
            title="View Profile"
            className="w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 flex-shrink-0"
          >
            <User className="w-4 h-4" />

            <span className="hidden sm:inline">
              View Profile
            </span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="w-full min-w-0">
        <StatsCard stats={data.stats} />
      </div>
    </div>
  );
};
