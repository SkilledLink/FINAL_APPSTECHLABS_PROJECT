import React, { useMemo, useState } from 'react';
import { Ban, CheckCircle, Trash2, Mail, Loader2, Inbox, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useUsers } from '../../hooks/useUsers';
import type { AdminUser } from '../../types/admin.types';
import { formatDistanceToNow } from 'date-fns';
import ReasonPrompt from '../ReasonPrompt';

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

const statusStyles: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  pending_verification: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
  deactivated: 'bg-gray-100 text-gray-700 border-gray-200',
};
const statusDots: Record<string, string> = {
  active: 'bg-green-500',
  pending_verification: 'bg-yellow-500',
  suspended: 'bg-red-500',
  deactivated: 'bg-gray-400',
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusStyles[status] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${statusDots[status] ?? 'bg-gray-400'}`} />
    {status.replace(/_/g, ' ')}
  </span>
);

type Prompt = {
  title: string;
  description?: string;
  submitLabel: string;
  onConfirm: (reason: string) => Promise<void>;
};

const UsersTab: React.FC = () => {
  const { users, loading, error, suspend, reactivate, remove } = useUsers();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [prompt, setPrompt] = useState<Prompt | null>(null);

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

  if (loading) return <Loader />;
  if (error) return <EmptyState title="Failed to load users" description={error} />;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Users</h2>
        <p className="text-gray-500 mt-1">Manage all registered client accounts</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by name or email..." />
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'pending_verification', 'suspended', 'deactivated'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.replace(/_/g, ' ')}
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
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</th>
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
                    <td className="px-5 py-4 text-xs text-gray-600 capitalize">{u.accountType}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{new Date(u.joinedDate).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {u.lastActive
                        ? formatDistanceToNow(new Date(u.lastActive), { addSuffix: true })
                        : '—'}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={u.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700" title="Message">
                          <Mail size={16} />
                        </button>
                        {u.status === 'suspended' || u.status === 'deactivated' ? (
                          <button
                            onClick={() =>
                              setPrompt({
                                title: 'Reactivate user',
                                description: u.email,
                                submitLabel: 'Reactivate',
                                onConfirm: async (reason) => {
                                  await reactivate(u.id, reason);
                                  toast.success('User reactivated');
                                },
                              })
                            }
                            className="p-2 rounded-lg text-green-600 hover:bg-green-50"
                            title="Reactivate"
                          >
                            <CheckCircle size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setPrompt({
                                title: 'Suspend user',
                                description: u.email,
                                submitLabel: 'Suspend',
                                onConfirm: async (reason) => {
                                  await suspend(u.id, reason);
                                  toast.success('User suspended');
                                },
                              })
                            }
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                            title="Suspend"
                          >
                            <Ban size={16} />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setPrompt({
                              title: 'Delete user',
                              description: u.email,
                              submitLabel: 'Delete',
                              onConfirm: async (reason) => {
                                await remove(u.id, reason);
                                toast.success('User deleted');
                              },
                            })
                          }
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {prompt && (
        <ReasonPrompt
          title={prompt.title}
          description={prompt.description}
          submitLabel={prompt.submitLabel}
          onSubmit={async (reason) => {
            await prompt.onConfirm(reason);
            setPrompt(null);
          }}
          onCancel={() => setPrompt(null)}
        />
      )}
    </div>
  );
};

export default UsersTab;