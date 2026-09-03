// components/RecentActivity.tsx
import React from "react";
import { Clock, MessageCircle, Share2, FileText } from "lucide-react";
import type { Activity } from "../../types/home";

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getActionIcon = (action: string) => {
    if (action.includes("comment"))
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    if (action.includes("share"))
      return <Share2 className="w-4 h-4 text-green-500" />;
    if (action.includes("topic"))
      return <FileText className="w-4 h-4 text-purple-500" />;
    return <Clock className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-600" />
        Recent Community Activity
      </h3>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <img
              src={activity.avatar}
              alt={activity.user}
              className="w-8 h-8 rounded-full object-cover mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-semibold text-gray-900">
                  {activity.user}
                </span>
                <span className="text-gray-600"> {activity.action}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
            </div>
            <div className="shrink-0">{getActionIcon(activity.action)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
