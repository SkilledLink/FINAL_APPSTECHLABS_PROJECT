import React from 'react';
import { Clock, MessageCircle, Share2, FileText, Heart, UserPlus, Zap } from 'lucide-react';
import type { Activity } from '../../types/home';

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getActionIcon = (actionText: string) => {
    const lower = (actionText || '').toLowerCase();
    if (lower.includes('comment') || lower.includes('replied')) {
      return <MessageCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
    }
    if (lower.includes('share') || lower.includes('reposted')) {
      return <Share2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
    }
    if (lower.includes('topic') || lower.includes('post') || lower.includes('asked')) {
      return <FileText className="w-4 h-4 text-purple-500 dark:text-purple-400" />;
    }
    if (lower.includes('like') || lower.includes('loved')) {
      return <Heart className="w-4 h-4 text-rose-500 dark:text-rose-400" />;
    }
    if (lower.includes('joined') || lower.includes('followed')) {
      return <UserPlus className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
    }
    return <Zap className="w-4 h-4 text-slate-400 dark:text-slate-500" />;
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm transition-colors duration-300">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        Recent Community Activity
      </h3>
      
      <div className="space-y-3">
        {activities && activities.length > 0 ? (
          activities.map((activity, index) => {
            // Safely extract string values if user is passed as an object { name, avatarUrl }
            const rawUser = activity.user;
            const userName: string =
              typeof rawUser === 'object' && rawUser !== null
                ? (rawUser as any).name || 'Community Member'
                : typeof rawUser === 'string'
                ? rawUser
                : 'Community Member';

            const userAvatar: string | undefined =
              activity.avatar ||
              (typeof rawUser === 'object' && rawUser !== null ? (rawUser as any).avatarUrl : undefined) ||
              (activity as any).avatarUrl;

            const actionText = activity.action || (activity as any).title || 'updated their status';
            const timeAgo = activity.time || (activity as any).timeAgo || 'Recently';

            return (
              <div 
                key={activity.id || index} 
                className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {userAvatar ? (
                    <img 
                      src={userAvatar} 
                      alt={userName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 text-xs font-bold border border-blue-500/20">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-snug">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{userName}</span>
                      <span className="text-slate-600 dark:text-slate-400"> {actionText}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{timeAgo}</p>
                  </div>
                </div>

                <div className="shrink-0 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
                  {getActionIcon(actionText)}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">No recent activity.</p>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;