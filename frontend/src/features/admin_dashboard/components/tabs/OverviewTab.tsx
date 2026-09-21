import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Users, Briefcase, ShieldCheck, Rss, UserCog, UserX, Inbox,
  Download, ChevronDown, FileText, FileSpreadsheet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useOverview } from '../../hooks/useOverview';
import { formatDistanceToNow } from 'date-fns';
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  type ExportRow,
} from '../../../../utils/exportUtils';

// ---------- Skeleton primitives ----------
const SkeletonBlock: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style,
}) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} style={style} />
);

const SkeletonMetricCard: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-7 w-20" />
      </div>
      <SkeletonBlock className="rounded-xl shrink-0" style={{ width: 40, height: 40 }} />
    </div>
  </div>
);

const SkeletonChartCard: React.FC<{ height?: number }> = ({ height = 280 }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="space-y-2 mb-4">
      <SkeletonBlock className="h-3.5 w-40" />
      <SkeletonBlock className="h-2.5 w-56" />
    </div>
    <SkeletonBlock className="w-full rounded-lg" style={{ height }} />
  </div>
);

const SkeletonOverview: React.FC = () => (
  <div className="w-full">
    <div className="mb-6 sm:mb-8 space-y-2">
      <SkeletonBlock className="h-7 w-40" />
      <SkeletonBlock className="h-3.5 w-56" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 mb-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <SkeletonMetricCard key={i} />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-6">
      <SkeletonChartCard height={280} />
      <SkeletonChartCard height={280} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-6">
      <SkeletonChartCard height={240} />
      <SkeletonChartCard height={240} />
    </div>

    <SkeletonBlock className="h-3 w-52" />
  </div>
);

// ---------- Local UI ----------
const EmptyState: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 text-center">
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

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color = 'blue' }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1.5">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
      <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${colorClasses[color]}`}>
        <Icon size={20} />
      </div>
    </div>
  </div>
);

// ---------- Export dropdown ----------
type ExportFormat = 'pdf' | 'csv' | 'excel';

interface ExportMenuProps {
  onExport: (format: ExportFormat) => void | Promise<void>;
  disabled?: boolean;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ onExport, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const items: { key: ExportFormat; label: string; icon: React.ReactNode }[] = [
    { key: 'pdf', label: 'Download as PDF', icon: <FileText size={15} /> },
    { key: 'csv', label: 'Download as CSV', icon: <FileSpreadsheet size={15} /> },
    { key: 'excel', label: 'Download as Excel', icon: <FileSpreadsheet size={15} /> },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download size={16} />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 min-w-[210px] overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setOpen(false);
                void onExport(item.key);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <span className="text-gray-500">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------- Chart primitives ----------
const ChartCard: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
    <div className="mb-4">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e5e7eb',
  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  fontSize: 12,
  padding: '8px 10px',
};

// ---------- User status chart (bar) ----------
interface UserStatusChartProps {
  data: { name: string; value: number; fill: string }[];
}

const UserStatusChart: React.FC<UserStatusChartProps> = ({ data }) => (
  <ChartCard
    title="User status"
    subtitle="Total, active and suspended accounts"
  >
    <div className="h-64 sm:h-72 -ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </ChartCard>
);

// ---------- Professional verification chart (donut) ----------
interface ProfessionalChartProps {
  data: { name: string; value: number; fill: string }[];
}

const ProfessionalChart: React.FC<ProfessionalChartProps> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ChartCard
      title="Professional verification"
      subtitle="Verified vs. pending vs. unverified"
    >
      <div className="h-64 sm:h-72 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ paddingBottom: 32 }}
        >
          <p className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</p>
          <p className="text-[11px] text-gray-500 uppercase tracking-wider">total</p>
        </div>
      </div>
    </ChartCard>
  );
};

// ---------- Platform content chart (bar) ----------
interface ContentChartProps {
  data: { name: string; value: number; fill: string }[];
}

const ContentChart: React.FC<ContentChartProps> = ({ data }) => (
  <ChartCard
    title="Platform content"
    subtitle="Feeds and jobs published"
  >
    <div className="h-56 sm:h-64 -ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(139,92,246,0.06)' }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </ChartCard>
);

// ---------- Team composition chart (donut) ----------
interface TeamChartProps {
  data: { name: string; value: number; fill: string }[];
}

const TeamChart: React.FC<TeamChartProps> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ChartCard
      title="Team composition"
      subtitle="Admins and moderators"
    >
      <div className="h-56 sm:h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ paddingBottom: 32 }}
        >
          <p className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</p>
          <p className="text-[11px] text-gray-500 uppercase tracking-wider">total</p>
        </div>
      </div>
    </ChartCard>
  );
};

// ---------- Export row builder ----------
const buildExportRows = (stats: {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalProfessionals: number;
  verifiedProfessionals: number;
  pendingProfessionals: number;
  totalFeeds: number;
  totalJobs: number;
  totalAdmins: number;
  totalModerators: number;
}): ExportRow[] => [
  { category: 'Users', metric: 'Total Users', value: stats.totalUsers },
  { category: 'Users', metric: 'Active Users', value: stats.activeUsers },
  { category: 'Users', metric: 'Suspended Users', value: stats.suspendedUsers },
  { category: 'Professionals', metric: 'Total Professionals', value: stats.totalProfessionals },
  { category: 'Professionals', metric: 'Verified Professionals', value: stats.verifiedProfessionals },
  { category: 'Professionals', metric: 'Pending Professionals', value: stats.pendingProfessionals },
  { category: 'Content', metric: 'Total Feeds', value: stats.totalFeeds },
  { category: 'Content', metric: 'Total Jobs', value: stats.totalJobs },
  { category: 'Team', metric: 'Administrators', value: stats.totalAdmins },
  { category: 'Team', metric: 'Moderators', value: stats.totalModerators },
];

// ---------- Tab ----------
const OverviewTab: React.FC = () => {
  const { stats, loading, error } = useOverview();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    if (!stats || isExporting) return;

    const rows = buildExportRows(stats);
    const dateStamp = new Date().toISOString().slice(0, 10);
    const baseName = `platform-overview-${dateStamp}`;
    const generatedAt = new Date(stats.generatedAt).toLocaleString();

    setIsExporting(true);
    try {
      if (format === 'csv') {
        await exportToCSV(baseName, rows);
      } else if (format === 'excel') {
        await exportToExcel(baseName, rows, 'Overview');
      } else {
        await exportToPDF(baseName, rows, {
          title: 'Platform Overview',
          subtitle: `Generated: ${generatedAt}`,
        });
      }
      toast.success(`${format.toUpperCase()} downloaded`);
    } catch (e) {
      console.error('Export failed:', e);
      toast.error(`Failed to export ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <SkeletonOverview />;
  if (error || !stats) {
    return <EmptyState title="Failed to load overview" description={error ?? ''} />;
  }

  // ---------- Derived chart data ----------
  const userStatusData = [
    { name: 'Total', value: stats.totalUsers, fill: '#3b82f6' },
    { name: 'Active', value: stats.activeUsers, fill: '#10b981' },
    { name: 'Suspended', value: stats.suspendedUsers, fill: '#ef4444' },
  ];

  const unverifiedProfessionals = Math.max(
    0,
    stats.totalProfessionals
      - stats.verifiedProfessionals
      - stats.pendingProfessionals,
  );

  const professionalData = [
    { name: 'Verified', value: stats.verifiedProfessionals, fill: '#10b981' },
    { name: 'Pending', value: stats.pendingProfessionals, fill: '#f59e0b' },
    { name: 'Unverified', value: unverifiedProfessionals, fill: '#94a3b8' },
  ];

  const contentData = [
    { name: 'Feeds', value: stats.totalFeeds, fill: '#8b5cf6' },
    { name: 'Jobs', value: stats.totalJobs, fill: '#3b82f6' },
  ];

  const teamData = [
    { name: 'Admins', value: stats.totalAdmins, fill: '#6366f1' },
    { name: 'Moderators', value: stats.totalModerators, fill: '#a855f7' },
  ];

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Overview</h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Platform-wide metrics</p>
        </div>
        <ExportMenu onExport={handleExport} disabled={isExporting} />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 mb-6">
        <MetricCard title="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
        <MetricCard title="Active Users" value={stats.activeUsers} icon={Users} color="green" />
        <MetricCard title="Suspended Users" value={stats.suspendedUsers} icon={UserX} color="red" />
        <MetricCard title="Total Professionals" value={stats.totalProfessionals} icon={ShieldCheck} color="indigo" />
        <MetricCard title="Verified Professionals" value={stats.verifiedProfessionals} icon={ShieldCheck} color="green" />
        <MetricCard title="Pending Professionals" value={stats.pendingProfessionals} icon={ShieldCheck} color="orange" />
        <MetricCard title="Total Feeds" value={stats.totalFeeds} icon={Rss} color="purple" />
        <MetricCard title="Total Jobs" value={stats.totalJobs} icon={Briefcase} color="blue" />
        <MetricCard title="Administrators" value={stats.totalAdmins} icon={UserCog} color="indigo" />
        <MetricCard title="Moderators" value={stats.totalModerators} icon={ShieldCheck} color="purple" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-6">
        <UserStatusChart data={userStatusData} />
        <ProfessionalChart data={professionalData} />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-6">
        <ContentChart data={contentData} />
        <TeamChart data={teamData} />
      </div>

      <p className="text-xs text-gray-400">
        Generated {formatDistanceToNow(new Date(stats.generatedAt), { addSuffix: true })}
      </p>
    </div>
  );
};

export default OverviewTab;