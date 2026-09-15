import React from 'react';
import {
  Users,
  Briefcase,
  AlertTriangle,
  Wallet,
  UserPlus,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Loader2,
  Inbox,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useOverview } from '../../hooks/useOverview';
import { formatDistanceToNow } from 'date-fns';

// ---------- Local UI helpers ----------
const Loader: React.FC = () => (
  <div className="flex items-center justify-center py-16">
    <Loader2 size={28} className="animate-spin text-blue-500" />
  </div>
);

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
  change?: number;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
}

const colorClasses: Record<string, string> = {
  blue: 'text-blue-500 bg-blue-50',
  green: 'text-green-500 bg-green-50',
  purple: 'text-purple-500 bg-purple-50',
  orange: 'text-orange-500 bg-orange-50',
  red: 'text-red-500 bg-red-50',
  indigo: 'text-indigo-500 bg-indigo-50',
};

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, change, color = 'blue' }) => {
  const isPositive = change !== undefined && change >= 0;
  return (
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
      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-gray-400">vs last period</span>
        </div>
      )}
    </div>
  );
};

// ---------- Tab ----------
const OverviewTab: React.FC = () => {
  const { stats, analytics, activity, loading, error } = useOverview();

  if (loading) return <Loader />;
  if (error || !stats || !analytics) {
    return <EmptyState title="Failed to load overview" description={error ?? ''} />;
  }

  const maxUserGrowth = Math.max(...analytics.userGrowth.map((d) => d.count), 1);
  const maxJobActivity = Math.max(...analytics.jobActivity.map((d) => d.count), 1);
  const maxCategory = Math.max(...analytics.topCategories.map((c) => c.count), 1);
  const maxRevenue = Math.max(...analytics.revenueByCategory.map((c) => c.amount), 1);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="text-gray-500 mt-1">Platform-wide metrics and recent activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <MetricCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users} change={stats.totalUsersChange} color="blue" />
        <MetricCard title="Professionals" value={stats.totalProfessionals.toLocaleString()} icon={ShieldCheck} change={stats.totalProfessionalsChange} color="indigo" />
        <MetricCard title="Active Jobs" value={stats.activeJobs} icon={Briefcase} change={stats.activeJobsChange} color="green" />
        <MetricCard title="Pending Moderation" value={stats.pendingModeration} icon={AlertTriangle} change={stats.pendingModerationChange} color="orange" />
        <MetricCard title="Platform Revenue" value={`${stats.totalRevenue.toLocaleString()} FCFA`} icon={Wallet} change={stats.totalRevenueChange} color="purple" />
        <MetricCard title="New Signups (7d)" value={stats.newSignups} icon={UserPlus} change={stats.newSignupsChange} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">User Growth (7 days)</h3>
          <div className="h-48 flex items-end gap-2">
            {analytics.userGrowth.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-all"
                  style={{ height: `${(d.count / maxUserGrowth) * 100}%` }}
                  title={`${d.count} signups`}
                />
                <span className="text-[10px] text-gray-500">
                  {new Date(d.date).toLocaleDateString('en', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Job Activity (7 days)</h3>
          <div className="h-48 flex items-end gap-2">
            {analytics.jobActivity.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-all"
                  style={{ height: `${(d.count / maxJobActivity) * 100}%` }}
                  title={`${d.count} jobs`}
                />
                <span className="text-[10px] text-gray-500">
                  {new Date(d.date).toLocaleDateString('en', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {analytics.topCategories.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{c.name}</span>
                  <span className="text-gray-500">{c.count}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${(c.count / maxCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue by Category</h3>
          <div className="space-y-3">
            {analytics.revenueByCategory.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{c.name}</span>
                  <span className="text-gray-500">{c.amount.toLocaleString()} FCFA</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-2 bg-purple-500 rounded-full"
                    style={{ width: `${(c.amount / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {activity.map((a) => (
            <div key={a.id} className="px-6 py-4 flex items-start gap-3">
              <img src={a.actor.avatar} alt={a.actor.name} className="w-9 h-9 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{a.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {a.actor.name} · {formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;