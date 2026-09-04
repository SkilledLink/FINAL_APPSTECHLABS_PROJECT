import React from 'react';
import type { Activity } from '../../types/dashboard.types';
import { RecentActivity } from '../RecentActivity';
import { Calendar, Filter } from 'lucide-react';

interface ActivityTabProps {
  activities: Activity[];
}

export const ActivityTab: React.FC<ActivityTabProps> = ({ activities }) => {
  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Activity Feed</h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Track all your recent platform activity</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-700 text-sm">
            <Calendar className="w-4 h-4" />
            <span className="hidden xs:inline">This Week</span>
            <span className="xs:hidden">Week</span>
          </button>
          <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-700 text-sm">
            <Filter className="w-4 h-4" />
            <span className="hidden xs:inline">Filter</span>
            <span className="xs:hidden">Filter</span>
          </button>
        </div>
      </div>

      <RecentActivity activities={activities} />
    </div>
  );
};