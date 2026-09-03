import React from 'react';
import type { Activity } from '../types/dashboard.types';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityProps {
  activities: Activity[];
}

const getActivityIcon = (type: Activity['type']) => {
  const icons = {
    post: '📸',
    comment: '💬',
    like: '❤️',
    follow: '👥',
    profile_update: '✏️',
    verification: '✅',
    review: '⭐',
    request: '📩'
  };
  return icons[type] || '📌';
};

const getActivityColor = (type: Activity['type']) => {
  const colors = {
    post: 'bg-blue-50 text-blue-600',
    comment: 'bg-purple-50 text-purple-600',
    like: 'bg-red-50 text-red-600',
    follow: 'bg-green-50 text-green-600',
    profile_update: 'bg-yellow-50 text-yellow-600',
    verification: 'bg-emerald-50 text-emerald-600',
    review: 'bg-amber-50 text-amber-600',
    request: 'bg-indigo-50 text-indigo-600'
  };
  return colors[type] || 'bg-gray-50 text-gray-600';
};

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {activities.map((activity) => {
          const IconEmoji = getActivityIcon(activity.type);
          const colorClass = getActivityColor(activity.type);
          
          return (
            <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <span className="text-lg">{IconEmoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};