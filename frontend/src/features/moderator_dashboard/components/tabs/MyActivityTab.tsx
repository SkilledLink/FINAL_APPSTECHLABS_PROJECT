import React, { useMemo, useState } from 'react';
import { Inbox, Search } from 'lucide-react';
import { useMyActivity } from '../../hooks/useMyActivity';
import type { ActivityLog } from '../../types/moderator.types';
import { formatDistanceToNow } from 'date-fns';
import { SkeletonBlock } from '../Skeleton';

const EmptyState: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 mb-4"><Inbox size={28} /></div>
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

const selectClass =
  'h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none transition-all hover:border-gray-300 hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10';

const MyActivityTab: React.FC = () => {
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');

  const { logs, loading, error } = useMyActivity({
    entityType: entityType || undefined,
    action: action || undefined,
  });

  const [query, setQuery] = useState('');

  const entityTypeOptions = useMemo(() => {
    const s = new Set<string>();
    logs.forEach((l) => s.add(l.entityType));
    return Array.from(s).sort();
  }, [logs]);

  const actionOptions = useMemo(() => {
    const s = new Set<string>();
    logs.forEach((l) => s.add(l.action));
    return Array.from(s).sort();
  }, [logs]);

  const filtered = useMemo(
    () => logs.filter((l) =>
      l.description.toLowerCase().includes(query.toLowerCase()) ||
      l.action.toLowerCase().includes(query.toLowerCase())),
    [logs, query],
  );

  if (error) return <EmptyState title="Failed to load activity" description={error} />;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">My Activity</h2>
        <p className="text-gray-500 mt-1">Your moderation history on the platform</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Search your actions..." />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <select
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          disabled={loading}
          className={selectClass}
        >
          <option value="">All entities</option>
          {entityTypeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          disabled={loading}
          className={selectClass}
        >
          <option value="">All actions</option>
          {actionOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        {(entityType || action) && (
          <button
            onClick={() => { setEntityType(''); setAction(''); }}
            disabled={loading}
            className="h-10 px-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-60"
          >
            Clear
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <SkeletonBlock className="h-6 w-32 rounded-md" />
                <SkeletonBlock className="h-4 flex-1" />
                <SkeletonBlock className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No activity found" description="Try adjusting your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entity</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">IP</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((l: ActivityLog) => (
                  <tr key={l.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-mono">
                        {l.action}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 font-mono">
                      {l.entityType}:{l.entityId ? l.entityId.slice(0, 8) : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 max-w-xs truncate">{l.reason ?? '—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 font-mono">{l.ipAddress ?? '—'}</td>
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

export default MyActivityTab;