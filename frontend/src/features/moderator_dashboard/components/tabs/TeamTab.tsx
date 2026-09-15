import React, { useMemo, useState } from 'react';
import { ShieldCheck, Inbox, Search } from 'lucide-react';
import { useTeam } from '../../hooks/useTeam';
import type { ModeratorRole, TeamMember } from '../../types/moderator.types';
import { formatDistanceToNow } from 'date-fns';

const Skeleton: React.FC = () => (
  <div>
    <div className="mb-8">
      <div className="h-8 w-24 rounded-lg bg-gray-200 animate-pulse" />
      <div className="mt-2 h-4 w-72 rounded bg-gray-200 animate-pulse" />
    </div>

    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
      <div className="h-10 w-full max-w-sm rounded-xl bg-gray-200 animate-pulse" />
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 rounded-lg bg-gray-200 animate-pulse" />
        ))}
      </div>
    </div>

    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex gap-6">
        {[160, 100, 80, 60, 100].map((w, i) => (
          <div key={i} className="h-3 rounded bg-gray-200 animate-pulse" style={{ width: w }} />
        ))}
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-6">
            <div className="flex items-center gap-3 w-64">
              <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                <div className="mt-1 h-3 w-40 rounded bg-gray-200 animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-28 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-4 w-10 rounded bg-gray-200 animate-pulse" />
            <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
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

const RoleBadge: React.FC<{ role: ModeratorRole }> = ({ role }) => {
  const styles: Record<ModeratorRole, string> = {
    lead_moderator: 'bg-red-50 text-red-700 border-red-200',
    senior_moderator: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    moderator: 'bg-blue-50 text-blue-700 border-blue-200',
    trainee: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[role]}`}>
      <ShieldCheck size={11} />
      {role.replace('_', ' ')}
    </span>
  );
};

const StatusBadge: React.FC<{ status: 'active' | 'inactive' }> = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
    status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'
  }`}>
    <span className={`h-1.5 w-1.5 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
    {status}
  </span>
);

const TeamTab: React.FC = () => {
  const { team, loading, error } = useTeam();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | ModeratorRole>('all');

  const filtered = useMemo(
    () =>
      team.filter(
        (m) =>
          (filter === 'all' || m.role === filter) &&
          (m.name.toLowerCase().includes(query.toLowerCase()) ||
            m.email.toLowerCase().includes(query.toLowerCase())),
      ),
    [team, filter, query],
  );

  if (loading) return <Skeleton />;
  if (error) return <EmptyState title="Failed to load team" description={error} />;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Team</h2>
        <p className="text-gray-500 mt-1">Your fellow moderators and supervisors</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by name or email..." />
        <div className="flex gap-2 flex-wrap">
          {(['all', 'lead_moderator', 'senior_moderator', 'moderator', 'trainee'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState title="No team members found" description="Try adjusting your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions Today</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((m: TeamMember) => (
                  <tr key={m.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={m.avatar} alt={m.name} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <p className="font-medium text-gray-900">{m.name}</p>
                          <p className="text-xs text-gray-500">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><RoleBadge role={m.role} /></td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{m.actionsToday}</td>
                    <td className="px-5 py-4"><StatusBadge status={m.status} /></td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {formatDistanceToNow(new Date(m.lastActive), { addSuffix: true })}
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

export default TeamTab;