import React from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Flag,
  UserX,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  Inbox,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useOverview } from '../../hooks/useOverview';
import { formatDistanceToNow } from 'date-fns';

const Skeleton: React.FC = () => (
  <div>
    <div className="mb-8">
      <div className="h-8 w-32 rounded-lg bg-gray-200 animate-pulse" />
      <div className="mt-2 h-4 w-72 rounded bg-gray-200 animate-pulse" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
              <div className="mt-3 h-8 w-20 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
          </div>
          <div className="mt-3 h-3 w-32 rounded bg-gray-200 animate-pulse" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {[0, 1].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="h-5 w-48 rounded bg-gray-200 animate-pulse mb-4" />
          <div className="h-48 flex items-end gap-2">
            {[60, 80, 45, 95, 70, 85, 55].map((h, j) => (
              <div key={j} className="flex-1 bg-gray-200 rounded-t animate-pulse" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
        <div className="h-5 w-56 rounded bg-gray-200 animate-pulse mb-4" />
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-10 rounded bg-gray-200 animate-pulse" />
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="h-5 w-40 rounded bg-gray-200 animate-pulse" />
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
              <div className="mt-2 h-3 w-48 rounded bg-gray-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
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

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, change, color = 'emerald' }) => {
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
          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-gray-400">vs last period</span>
        </div>
      )}
    </div>
  );
};

const OverviewTab: React.FC = () => {
  const { stats, analytics, activity, loading, error } = useOverview();

  if (loading) return <Skeleton />;
  if (error || !stats || !analytics) {
    return <EmptyState title="Failed to load overview" description={error ?? ''} />;
  }

  const maxHandled = Math.max(...analytics.reportsHandled.map((d) => d.count), 1);
  const maxReason = Math.max(...analytics.reportsByReason.map((d) => d.count), 1);
  const maxCategory = Math.max(...analytics.topReportedCategories.map((d) => d.count), 1);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="text-gray-500 mt-1">Your moderation activity at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <MetricCard title="Pending Reports" value={stats.pendingReports} icon={AlertTriangle} change={stats.pendingReportsChange} color="orange" />
        <MetricCard title="Resolved Today" value={stats.resolvedToday} icon={CheckCircle} change={stats.resolvedTodayChange} color="emerald" />
        <MetricCard title="Flagged Content" value={stats.flaggedContent} icon={Flag} change={stats.flaggedContentChange} color="red" />
        <MetricCard title="Suspended Users" value={stats.suspendedUsers} icon={UserX} change={stats.suspendedUsersChange} color="purple" />
        <MetricCard title="Avg Response (min)" value={stats.avgResponseTime} icon={Clock} change={stats.avgResponseTimeChange} color="blue" />
        <MetricCard title="Actions This Week" value={stats.actionsThisWeek} icon={Activity} change={stats.actionsThisWeekChange} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Reports Handled (7 days)</h3>
          <div className="h-48 flex items-end gap-2">
            {analytics.reportsHandled.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-emerald-500 rounded-t hover:bg-emerald-600 transition-all"
                  style={{ height: `${(d.count / maxHandled) * 100}%` }}
                  title={`${d.count} reports`}
                />
                <span className="text-[10px] text-gray-500">
                  {new Date(d.date).toLocaleDateString('en', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Reports by Reason</h3>
          <div className="space-y-3">
            {analytics.reportsByReason.map((r) => (
              <div key={r.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{r.name}</span>
                  <span className="text-gray-500">{r.count}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${(r.count / maxReason) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Most Reported Categories</h3>
          <div className="space-y-3">
            {analytics.topReportedCategories.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{c.name}</span>
                  <span className="text-gray-500">{c.count}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${(c.count / maxCategory) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Actions</h3>
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