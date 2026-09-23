import React, { useEffect, useMemo, useState } from 'react';
import {
  Ban, CheckCircle, Trash2, Mail, Loader2, Inbox, Search, X, ShieldCheck, Crown,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useUsers } from '../../hooks/useUsers';
import type { AdminUser, AdminUserDetail } from '../../types/admin.types';
import { formatDistanceToNow } from 'date-fns';
import ReasonPrompt from '../ReasonPrompt';

// ---------- Local UI helpers ----------
const EmptyState: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl text-gray-400 dark:text-slate-500 mb-4">
      <Inbox size={28} />
    </div>
    <p className="font-semibold text-gray-900 dark:text-slate-100">{title}</p>
    {description && <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-sm">{description}</p>}
  </div>
);

const SearchInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({
  value, onChange, placeholder = 'Search...',
}) => (
  <div className="relative w-full max-w-sm">
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:focus:bg-slate-900"
    />
  </div>
);

// ---------- Skeleton primitives ----------
const SkeletonBlock: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style,
}) => (
  <div
    className={`animate-pulse rounded bg-gray-200 dark:bg-slate-700 ${className}`}
    style={style}
  />
);

const SkeletonTableRow: React.FC = () => (
  <tr>
    <td className="px-5 py-4">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="rounded-full" style={{ width: 36, height: 36 }} />
        <div className="space-y-2">
          <SkeletonBlock className="h-3.5 w-32" />
          <SkeletonBlock className="h-2.5 w-44" />
        </div>
      </div>
    </td>
    <td className="px-5 py-4"><SkeletonBlock className="h-3 w-16" /></td>
    <td className="px-5 py-4"><SkeletonBlock className="h-3 w-20" /></td>
    <td className="px-5 py-4"><SkeletonBlock className="h-3 w-24" /></td>
    <td className="px-5 py-4">
      <SkeletonBlock className="h-5 w-20 rounded-full" />
    </td>
    <td className="px-5 py-4">
      <div className="flex items-center justify-end gap-2">
        <SkeletonBlock className="rounded-lg" style={{ width: 32, height: 32 }} />
        <SkeletonBlock className="rounded-lg" style={{ width: 32, height: 32 }} />
        <SkeletonBlock className="rounded-lg" style={{ width: 32, height: 32 }} />
      </div>
    </td>
  </tr>
);

const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800/60">
          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">User</th>
          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Last Active</th>
          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
          <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} />
        ))}
      </tbody>
    </table>
  </div>
);

const SkeletonDrawer: React.FC = () => (
  <div className="space-y-5">
    <div className="flex items-center gap-4">
      <SkeletonBlock className="rounded-full" style={{ width: 56, height: 56 }} />
      <div className="space-y-2 flex-1">
        <SkeletonBlock className="h-4 w-40" />
        <SkeletonBlock className="h-3 w-56" />
        <SkeletonBlock className="h-4 w-16 rounded-full" />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <SkeletonBlock className="h-2.5 w-16" />
          <SkeletonBlock className="h-3.5 w-24" />
        </div>
      ))}
    </div>

    <div className="pt-4 border-t border-gray-100 dark:border-slate-800/60 space-y-3">
      <SkeletonBlock className="h-3 w-20" />
      <div className="flex gap-2">
        <SkeletonBlock className="h-7 w-28 rounded-lg" />
        <SkeletonBlock className="h-7 w-32 rounded-lg" />
      </div>
    </div>
  </div>
);

// ---------- Avatar ----------
const AVATAR_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4',
  '#ef4444', '#6366f1', '#14b8a6', '#f97316', '#a855f7', '#84cc16',
];

const hashString = (s: string): number => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const Avatar: React.FC<{
  name: string;
  src?: string;
  size?: number;
  className?: string;
}> = ({ name, src, size = 36, className = '' }) => {
  const [imgError, setImgError] = useState(false);

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?';

  const backgroundColor =
    AVATAR_COLORS[hashString(name || '?') % AVATAR_COLORS.length];

  if (!src || imgError) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full font-semibold text-white select-none ${className}`}
        style={{
          width: size,
          height: size,
          fontSize: Math.round(size * 0.4),
          backgroundColor,
        }}
        aria-label={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setImgError(true)}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

// ---------- Status badge ----------
const statusStyles: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900/60',
  pending_verification: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900/60',
  suspended: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60',
  deactivated: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};
const statusDots: Record<string, string> = {
  active: 'bg-green-500',
  pending_verification: 'bg-yellow-500',
  suspended: 'bg-red-500',
  deactivated: 'bg-gray-400 dark:bg-slate-500',
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusStyles[status] ?? 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${statusDots[status] ?? 'bg-gray-400 dark:bg-slate-500'}`} />
    {status.replace(/_/g, ' ')}
  </span>
);

// ---------- Role pill ----------
const RolePill: React.FC<{ isAdmin: boolean; isModerator: boolean }> = ({ isAdmin, isModerator }) => {
  if (!isAdmin && !isModerator) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
        isAdmin
          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60'
          : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/60'
      }`}
    >
      {isAdmin ? <Crown size={10} /> : <ShieldCheck size={10} />}
      {isAdmin ? 'Admin' : 'Moderator'}
    </span>
  );
};

// ---------- Drawer ----------
interface DrawerProps {
  userId: string | null;
  onClose: () => void;
  fetchOne: (id: string) => Promise<AdminUserDetail>;
  updateRole: (
    id: string,
    updates: { isAdmin?: boolean; isModerator?: boolean },
    reason: string,
  ) => Promise<AdminUserDetail>;
}

const UserDrawer: React.FC<DrawerProps> = ({ userId, onClose, fetchOne, updateRole }) => {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchOne(userId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load user');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, fetchOne]);

  if (!userId) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800/60">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">User details</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && <SkeletonDrawer />}

          {error && !loading && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {detail && !loading && !error && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar name={detail.name} src={detail.avatar} size={56} />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-slate-100 truncate">{detail.name}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400 truncate">{detail.email}</p>
                  <div className="mt-1">
                    <RolePill isAdmin={detail.isAdmin} isModerator={detail.isModerator} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Username</p>
                  <p className="text-gray-900 dark:text-slate-100">{detail.username ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Type</p>
                  <p className="text-gray-900 dark:text-slate-100 capitalize">{detail.accountType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Status</p>
                  <div className="mt-0.5"><StatusBadge status={detail.status} /></div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Email verified</p>
                  <p className="text-gray-900 dark:text-slate-100">{detail.verified ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Location</p>
                  <p className="text-gray-900 dark:text-slate-100">{detail.location ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Joined</p>
                  <p className="text-gray-900 dark:text-slate-100">{new Date(detail.joinedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Last login</p>
                  <p className="text-gray-900 dark:text-slate-100">
                    {detail.lastActive
                      ? formatDistanceToNow(new Date(detail.lastActive), { addSuffix: true })
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Updated</p>
                  <p className="text-gray-900 dark:text-slate-100">
                    {formatDistanceToNow(new Date(detail.updatedAt), { addSuffix: true })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Followers</p>
                  <p className="text-gray-900 dark:text-slate-100">{detail.followersCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Following</p>
                  <p className="text-gray-900 dark:text-slate-100">{detail.followingCount}</p>
                </div>
              </div>

              {detail.bio && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Bio</p>
                  <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap">{detail.bio}</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 dark:border-slate-800/60">
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Role
                </p>
                <div className="flex flex-wrap gap-2">
                  {detail.isAdmin ? (
                    <button
                      onClick={() =>
                        updateRole(detail.id, { isAdmin: false }, 'Removed admin role')
                          .then((u) => {
                            setDetail(u);
                            toast.success('Admin role removed');
                          })
                          .catch((e) => toast.error(e.message))
                      }
                      className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 text-xs font-medium"
                    >
                      Remove Admin
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        updateRole(detail.id, { isAdmin: true }, 'Promoted to admin')
                          .then((u) => {
                            setDetail(u);
                            toast.success('Promoted to admin');
                          })
                          .catch((e) => toast.error(e.message))
                      }
                      className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/60 text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <Crown size={13} /> Make Admin
                    </button>
                  )}

                  {detail.isModerator ? (
                    <button
                      onClick={() =>
                        updateRole(detail.id, { isModerator: false }, 'Removed moderator role')
                          .then((u) => {
                            setDetail(u);
                            toast.success('Moderator role removed');
                          })
                          .catch((e) => toast.error(e.message))
                      }
                      className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 text-xs font-medium"
                    >
                      Remove Moderator
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        updateRole(detail.id, { isModerator: true }, 'Promoted to moderator')
                          .then((u) => {
                            setDetail(u);
                            toast.success('Promoted to moderator');
                          })
                          .catch((e) => toast.error(e.message))
                      }
                      className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/60 text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <ShieldCheck size={13} /> Make Moderator
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-2">
                  Role changes are applied immediately and logged.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ---------- Tab ----------
type Prompt = {
  title: string;
  description?: string;
  submitLabel: string;
  onConfirm: (reason: string) => Promise<void>;
};

const UsersTab: React.FC = () => {
  const { users, loading, error, suspend, reactivate, remove, fetchOne, updateRole } = useUsers();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

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

  if (error) return <EmptyState title="Failed to load users" description={error} />;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Users</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Manage all registered client accounts</p>
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
                filter === f
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/60'
              }`}
            >
              {f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <SkeletonTable rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No users found" description="Try adjusting your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800/60">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Last Active</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                {filtered.map((u: AdminUser) => (
                  <tr
                    key={u.id}
                    onClick={() => setDetailId(u.id)}
                    className="hover:bg-gray-50/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} src={u.avatar} size={36} />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-slate-100">{u.name}</p>
                            <RolePill isAdmin={u.isAdmin} isModerator={u.isModerator} />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-600 dark:text-slate-400 capitalize">{u.accountType}</td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300">{new Date(u.joinedDate).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 dark:text-slate-400">
                      {u.lastActive
                        ? formatDistanceToNow(new Date(u.lastActive), { addSuffix: true })
                        : '—'}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={u.status} /></td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-200"
                          title="Message"
                        >
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
                            className="p-2 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40"
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
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
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
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
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

      <UserDrawer
        userId={detailId}
        onClose={() => setDetailId(null)}
        fetchOne={fetchOne}
        updateRole={updateRole}
      />
    </div>
  );
};

export default UsersTab;