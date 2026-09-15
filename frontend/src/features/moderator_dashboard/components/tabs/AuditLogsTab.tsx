import React, { useMemo, useState } from 'react';
import { Inbox, Search } from 'lucide-react';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import type { AuditLog, AuditSeverity } from '../../types/moderator.types';
import { formatDistanceToNow } from 'date-fns';

const Skeleton: React.FC = () => (
  <div>
    <div className="mb-8">
      <div className="h-8 w-40 rounded-lg bg-gray-200 animate-pulse" />
      <div className="mt-2 h-4 w-72 rounded bg-gray-200 animate-pulse" />
    </div>

    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
      <div className="h-10 w-full max-w-sm rounded-xl bg-gray-200 animate-pulse" />
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-16 rounded-lg bg-gray-200 animate-pulse" />
        ))}
      </div>
    </div>

    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex gap-6">
        {[80, 200, 80, 100, 80].map((w, i) => (
          <div key={i} className="h-3 rounded bg-gray-200 animate-pulse" style={{ width: w }} />
        ))}
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-6">
            <div className="h-6 w-24 rounded-md bg-gray-200 animate-pulse" />
            <div className="h-4 flex-1 rounded bg-gray-200 animate-pulse" />
            <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
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
      className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all hover:border-gray-300 hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
    />
  </div>
);

const SeverityBadge: React.FC<{ severity: AuditSeverity }> = ({ severity }) => {
  const styles: Record<AuditSeverity, string> = {
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
  };
  const dots: Record<AuditSeverity, string> = {
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[severity]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[severity]}`} />
      {severity}
    </span>
  );
};

const AuditLogsTab: React.FC = () => {
  const { logs, loading, error } = useAuditLogs();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | AuditSeverity>('all');

  const filtered = useMemo(
    () =>
      logs.filter(
        (l) =>
          (filter === 'all' || l.severity === filter) &&
          (l.description.toLowerCase().includes(query.toLowerCase()) ||
            l.action.toLowerCase().includes(query.toLowerCase())),
      ),
    [logs, filter, query],
  );

  if (loading) return <Skeleton />;
  if (error) return <EmptyState title="Failed to load activity" description={error} />;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">My Activity</h2>
        <p className="text-gray-500 mt-1">Your moderation history on the platform</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search actions..." />
        <div className="flex gap-2 flex-wrap">
          {(['all', 'info', 'warning', 'critical'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState title="No activity found" description="Try adjusting your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">IP</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((l: AuditLog) => (
                  <tr key={l.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-mono">
                        {l.action}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">{l.description}</td>
                    <td className="px-5 py-4"><SeverityBadge severity={l.severity} /></td>
                    <td className="px-5 py-4 text-xs text-gray-500 font-mono">{l.ipAddress}</td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {formatDistanceToNow(new Date(l.timestamp), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsTab;