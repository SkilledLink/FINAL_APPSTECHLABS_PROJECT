import React from 'react';
import type { Activity } from '../types/dashboard.types';
import { formatDistanceToNow } from 'date-fns';
import {
  Camera,
  MessageCircle,
  Heart,
  Users,
  Pencil,
  BadgeCheck,
  Star,
  Mail,
  Pin,
} from 'lucide-react';

interface RecentActivityProps {
  activities: Activity[];
}

const getActivityIcon = (type: Activity['type']) => {
  const icons = {
    post: Camera,
    comment: MessageCircle,
    like: Heart,
    follow: Users,
    profile_update: Pencil,
    verification: BadgeCheck,
    review: Star,
    request: Mail,
  };

  return icons[type] || Pin;
};

const getActivityColor = (type: Activity['type']) => {
  const colors = {
    post: 'bg-blue-50 text-blue-600',
    comment: 'bg-slate-50 text-slate-600',
    like: 'bg-blue-50 text-blue-600',
    follow: 'bg-blue-50 text-blue-600',
    profile_update: 'bg-slate-50 text-slate-600',
    verification: 'bg-emerald-50 text-emerald-600',
    review: 'bg-amber-50 text-amber-600',
    request: 'bg-blue-50 text-blue-600',
  };

  return colors[type] || 'bg-slate-50 text-slate-600';
};

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>

          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {activities.map((activity) => {
          const ActivityIcon = getActivityIcon(activity.type);
          const colorClass = getActivityColor(activity.type);

          return (
            <div
              key={activity.id}
              className="p-4 hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${colorClass}`}
                >
                  <ActivityIcon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 break-words">
                    {activity.description}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(
                      new Date(activity.timestamp),
                      { addSuffix: true }
                    )}
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
