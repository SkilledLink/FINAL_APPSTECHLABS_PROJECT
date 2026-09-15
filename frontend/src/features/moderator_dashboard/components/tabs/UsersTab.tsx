import React, { useMemo, useState } from 'react';
import { Ban, CheckCircle, AlertTriangle, Inbox, Search } from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import type { AdminUser, UserStatus } from '../../types/moderator.types';

const Skeleton: React.FC = () => (
  <div>
    <div className="mb-8">
      <div className="h-8 w-24 rounded-lg bg-gray-200 animate-pulse" />
      <div className="mt-2 h-4 w-80 rounded bg-gray-200 animate-pulse" />
    </div>

    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
      <div className="h-10 w-full max-w-sm rounded-xl bg-gray-200 animate-pulse" />
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-20 rounded-lg bg-gray-200 animate-pulse" />
        ))}
      </div>
    </div>

    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex gap-6">
        {[160, 100, 80, 70, 70, 80].map((w, i) => (
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
            <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-10 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-10 rounded bg-gray-200 animate-pulse" />
            <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex gap-2 ml-auto">
              <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
              <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
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

const StatusBadge: React.FC<{ status: UserStatus }> = ({ status }) => {
  const styles: Record<UserStatus, string> = {
    active: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    suspended: 'bg-red-50 text-red-700 border-red-200',
  };
  const dots: Record<UserStatus, string> = {
    active: 'bg-green-500',
    pending: 'bg-yellow-500',
    suspended: 'bg-red-500',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
};

const UsersTab: React.FC = () => {
  const { users, loading, error, updateStatus, warn } = useUsers();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | UserStatus>('all');

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          (filter === 'all' || u.status === filter) &&
          (u.name.toLowerCase().includes(query.toLowerCase()) ||
            u.email.toLowerCase().includes(query.toLowerCase())),
      ),
    [users, filter, query],
  );

  if (loading) return <Skeleton />;
  if (error) return <EmptyState title="Failed to load users" description={error} />;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Users</h2>
        <p className="text-gray-500 mt-1">Review user accounts and manage violations</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by name or email..." />
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'pending', 'suspended'] as const).map((f) => (
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
          <EmptyState title="No users found" description="Try adjusting your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Warnings</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Requests</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((u: AdminUser) => (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">{u.location}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{new Date(u.joinedDate).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                        u.warnings >= 3 ? 'text-red-600' : u.warnings >= 1 ? 'text-yellow-600' : 'text-gray-500'
                      }`}>
                        {u.warnings > 0 && <AlertTriangle size={13} />}
                        {u.warnings}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">{u.totalRequests}</td>
                    <td className="px-5 py-4"><StatusBadge status={u.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => warn(u.id)}
                          className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-50"
                          title="Warn user"
                        >
                          <AlertTriangle size={16} />
                        </button>
                        {u.status === 'active' ? (
                          <button
                            onClick={() => updateStatus(u.id, 'suspended')}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                            title="Suspend"
                          >
                            <Ban size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateStatus(u.id, 'active')}
                            className="p-2 rounded-lg text-green-600 hover:bg-green-50"
                            title="Reactivate"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </div>
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

export default UsersTab;