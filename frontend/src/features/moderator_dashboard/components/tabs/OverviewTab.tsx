import React from 'react';
import { Users, Briefcase, ShieldCheck, Rss, UserCog, UserX, Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useOverview } from '../../hooks/useOverview';
import { SkeletonBlock } from '../Skeleton';
import { formatDistanceToNow } from 'date-fns';

const EmptyState: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 mb-4">
      <Inbox size={28} />
    </div>
    <p className="font-semibold text-gray-900">{title}</p>
    {description && <p className="text-sm text-gray-500 mt-1 max-w-sm">{description}</p>}
  </div>
);

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'emerald' | 'blue' | 'purple' | 'orange' | 'red' | 'indigo';
}

const colorClasses: Record<string, string> = {
  emerald: 'text-emerald-500 bg-emerald-50',
  blue: 'text-blue-500 bg-blue-50',
  purple: 'text-purple-500 bg-purple-50',
  orange: 'text-orange-500 bg-orange-50',
  red: 'text-red-500 bg-red-50',
  indigo: 'text-indigo-500 bg-indigo-50',
};

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color = 'emerald' }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1.5">{value}</p>
      </div>
      <div className={`p-2.5 rounded-xl ${colorClasses[color]}`}>
        <Icon size={20} />
      </div>
    </div>
  </div>
);

const Skeleton: React.FC = () => (
  <div>
    <div className="mb-8">
      <SkeletonBlock className="h-8 w-32" />
      <SkeletonBlock className="mt-2 h-4 w-72" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="mt-3 h-8 w-20" />
            </div>
            <SkeletonBlock className="rounded-xl" style={{ width: 40, height: 40 }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const OverviewTab: React.FC = () => {
  const { stats, loading, error } = useOverview();

  if (loading) return <Skeleton />;
  if (error || !stats) {
    return <EmptyState title="Failed to load overview" description={error ?? ''} />;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="text-gray-500 mt-1">Platform-wide metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        <MetricCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users} color="emerald" />
        <MetricCard title="Active Users" value={stats.activeUsers.toLocaleString()} icon={Users} color="emerald" />
        <MetricCard title="Suspended Users" value={stats.suspendedUsers.toLocaleString()} icon={UserX} color="red" />
        <MetricCard title="Total Professionals" value={stats.totalProfessionals.toLocaleString()} icon={ShieldCheck} color="indigo" />
        <MetricCard title="Verified Professionals" value={stats.verifiedProfessionals.toLocaleString()} icon={ShieldCheck} color="emerald" />
        <MetricCard title="Pending Professionals" value={stats.pendingProfessionals.toLocaleString()} icon={ShieldCheck} color="orange" />
        <MetricCard title="Total Feeds" value={stats.totalFeeds.toLocaleString()} icon={Rss} color="purple" />
        <MetricCard title="Total Jobs" value={stats.totalJobs.toLocaleString()} icon={Briefcase} color="blue" />
        <MetricCard title="Administrators" value={stats.totalAdmins.toLocaleString()} icon={UserCog} color="indigo" />
        <MetricCard title="Moderators" value={stats.totalModerators.toLocaleString()} icon={ShieldCheck} color="purple" />
      </div>

      <p className="text-xs text-gray-400">
        Generated {formatDistanceToNow(new Date(stats.generatedAt), { addSuffix: true })}
      </p>
    </div>
  );
};

export default OverviewTab;