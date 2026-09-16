import React, { useEffect, useMemo, useState } from 'react';
import { Ban, CheckCircle, Inbox, Search, Eye, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useUsers } from '../../hooks/useUsers';
import type { AdminUser, AdminUserDetail } from '../../types/moderator.types';
import { formatDistanceToNow } from 'date-fns';
import ReasonPrompt from '../ReasonPrompt';
import Avatar from '../Avatar';
import { SkeletonBlock } from '../Skeleton';

const statusStyles: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  pending_verification: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
  deactivated: 'bg-gray-100 text-gray-700 border-gray-200',
};
const statusDots: Record<string, string> = {
  active: 'bg-green-500', pending_verification: 'bg-yellow-500', suspended: 'bg-red-500', deactivated: 'bg-gray-400',
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusStyles[status] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${statusDots[status] ?? 'bg-gray-400'}`} />
    {status.replace(/_/g, ' ')}
  </span>
);

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

type Prompt = {
  title: string;
  description?: string;
  submitLabel: string;
  onConfirm: (reason: string) => Promise<void>;
};

interface DrawerProps {
  userId: string | null;
  onClose: () => void;
  fetchOne: (id: string) => Promise<AdminUserDetail>;
  onSuspend: (u: AdminUser) => void;
  onReactivate: (u: AdminUser) => void;
}

const UserDrawer: React.FC<DrawerProps> = ({ userId, onClose, fetchOne, onSuspend, onReactivate }) => {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { setDetail(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchOne(userId)
      .then((d) => { if (!cancelled) setDetail(d); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load user'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId, fetchOne]);

  if (!userId) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">User details</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="space-y-4">
              <SkeletonBlock className="h-4 w-40" />
              <SkeletonBlock className="h-3 w-56" />
              <SkeletonBlock className="h-20 w-full" />
            </div>
          )}
          {error && !loading && <p className="text-sm text-red-500">{error}</p>}
          {detail && !loading && !error && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar name={detail.name} src={detail.avatar} size={56} />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{detail.name}</p>
                  <p className="text-sm text-gray-500 truncate">{detail.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-500">Username</p><p className="text-gray-900">{detail.username ?? '—'}</p></div>
                <div><p className="text-xs text-gray-500">Type</p><p className="text-gray-900 capitalize">{detail.accountType}</p></div>
                <div><p className="text-xs text-gray-500">Status</p><div className="mt-0.5"><StatusBadge status={detail.status} /></div></div>
                <div><p className="text-xs text-gray-500">Email verified</p><p className="text-gray-900">{detail.verified ? 'Yes' : 'No'}</p></div>
                <div><p className="text-xs text-gray-500">Location</p><p className="text-gray-900">{detail.location ?? '—'}</p></div>
                <div><p className="text-xs text-gray-500">Joined</p><p className="text-gray-900">{new Date(detail.joinedDate).toLocaleDateString()}</p></div>
                <div><p className="text-xs text-gray-500">Followers</p><p className="text-gray-900">{detail.followersCount}</p></div>
                <div><p className="text-xs text-gray-500">Following</p><p className="text-gray-900">{detail.followingCount}</p></div>
              </div>
              {detail.bio && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Bio</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.bio}</p>
                </div>
              )}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                {detail.status === 'suspended' || detail.status === 'deactivated' ? (
                  <button
                    onClick={() => onReactivate(detail)}
                    className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    <CheckCircle size={13} /> Reactivate
                  </button>
                ) : (
                  <button
                    onClick={() => onSuspend(detail)}
                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    <Ban size={13} /> Suspend
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const UsersTab: React.FC = () => {
  const { users, loading, error, fetchOne, suspend, reactivate } = useUsers();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = useMemo(
    () => users.filter((u) =>
      (filter === 'all' || u.status === filter) &&
      (u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()))),
    [users, filter, query],
  );

  const openSuspend = (u: AdminUser) => setPrompt({
    title: 'Suspend user',
    description: u.email,
    submitLabel: 'Suspend',
    onConfirm: async (reason) => { await suspend(u.id, reason); toast.success('User suspended'); },
  });

  const openReactivate = (u: AdminUser) => setPrompt({
    title: 'Reactivate user',
    description: u.email,
    submitLabel: 'Reactivate',
    onConfirm: async (reason) => { await reactivate(u.id, reason); toast.success('User reactivated'); },
  });

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
          {['all', 'active', 'pending_verification', 'suspended', 'deactivated'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors disabled:opacity-60 ${
                filter === f ? 'bg-emerald-50 text-emerald-600' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <SkeletonBlock className="rounded-full" style={{ width: 36, height: 36 }} />
                <SkeletonBlock className="h-3.5 flex-1" />
                <SkeletonBlock className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No users found" description="Try adjusting your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => setDetailId(u.id)}
                    className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} src={u.avatar} size={36} />
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-600 capitalize">{u.accountType}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{new Date(u.joinedDate).toLocaleDateString()}</td>
                    <td className="px-5 py-4"><StatusBadge status={u.status} /></td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setDetailId(u.id)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="Details">
                          <Eye size={16} />
                        </button>
                        {u.status === 'suspended' || u.status === 'deactivated' ? (
                          <button onClick={() => openReactivate(u)} className="p-2 rounded-lg text-green-600 hover:bg-green-50" title="Reactivate">
                            <CheckCircle size={16} />
                          </button>
                        ) : (
                          <button onClick={() => openSuspend(u)} className="p-2 rounded-lg text-red-500 hover:bg-red-50" title="Suspend">
                            <Ban size={16} />
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

      {prompt && (
        <ReasonPrompt
          title={prompt.title}
          description={prompt.description}
          submitLabel={prompt.submitLabel}
          onSubmit={async (reason) => { await prompt.onConfirm(reason); setPrompt(null); }}
          onCancel={() => setPrompt(null)}
        />
      )}

      <UserDrawer
        userId={detailId}
        onClose={() => setDetailId(null)}
        fetchOne={fetchOne}
        onSuspend={openSuspend}
        onReactivate={openReactivate}
      />
    </div>
  );
};

export default UsersTab;