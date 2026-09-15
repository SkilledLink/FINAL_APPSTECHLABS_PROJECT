import React, { useMemo, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Loader2, Inbox, Search } from 'lucide-react';
import { useModeration } from '../../hooks/useModeration';
import type { ModerationReport, ReportPriority, ReportStatus } from '../../types/admin.types';
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

const SearchInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({
  value, onChange, placeholder = 'Search...',
}) => (
  <div className="relative w-full max-w-sm">
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
    />
  </div>
);

const Chip: React.FC<{ children: React.ReactNode; variant?: 'danger' | 'warning' | 'info' | 'success' | 'neutral' }> = ({
  children, variant = 'neutral',
}) => {
  const styles = {
    danger: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  const dots = {
    danger: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
    success: 'bg-green-500',
    neutral: 'bg-gray-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[variant]}`} />
      {children}
    </span>
  );
};

const priorityVariant = (p: ReportPriority): 'danger' | 'warning' | 'neutral' => {
  if (p === 'high') return 'danger';
  if (p === 'medium') return 'warning';
  return 'neutral';
};

const statusVariant = (s: ReportStatus): 'success' | 'warning' | 'info' | 'neutral' => {
  if (s === 'resolved') return 'success';
  if (s === 'pending') return 'warning';
  if (s === 'reviewing') return 'info';
  return 'neutral';
};

// ---------- Tab ----------
const ModerationTab: React.FC = () => {
  const { reports, loading, error, updateStatus } = useModeration();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | ReportStatus>('all');

  const filtered = useMemo(
    () =>
      reports.filter(
        (r) =>
          (filter === 'all' || r.status === filter) &&
          (r.description.toLowerCase().includes(query.toLowerCase()) ||
            r.targetPreview.toLowerCase().includes(query.toLowerCase())),
      ),
    [reports, filter, query],
  );

  if (loading) return <Loader />;
  if (error) return <EmptyState title="Failed to load reports" description={error} />;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Moderation</h2>
        <p className="text-gray-500 mt-1">Review and act on user-submitted reports</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search reports..." />
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'reviewing', 'resolved', 'dismissed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState title="No reports found" description="The moderation queue is clear." />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r: ModerationReport) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl ${
                  r.priority === 'high'
                    ? 'bg-red-50 text-red-500'
                    : r.priority === 'medium'
                    ? 'bg-yellow-50 text-yellow-600'
                    : 'bg-gray-50 text-gray-500'
                }`}>
                  <AlertTriangle size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Chip variant={priorityVariant(r.priority)}>{r.priority} priority</Chip>
                    <Chip variant="neutral">{r.targetType}</Chip>
                    <Chip variant={statusVariant(r.status)}>{r.status}</Chip>
                  </div>

                  <p className="text-sm text-gray-700 mt-3">{r.description}</p>

                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 italic">
                    "{r.targetPreview}"
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                    <img src={r.reporter.avatar} alt="" className="w-5 h-5 rounded-full" />
                    <span>Reported by {r.reporter.name}</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</span>
                  </div>

                  {(r.status === 'pending' || r.status === 'reviewing') && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => updateStatus(r.id, 'resolved')}
                        className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium inline-flex items-center gap-1.5"
                      >
                        <CheckCircle size={14} /> Resolve
                      </button>
                      <button
                        onClick={() => updateStatus(r.id, 'dismissed')}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium inline-flex items-center gap-1.5"
                      >
                        <XCircle size={14} /> Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModerationTab;