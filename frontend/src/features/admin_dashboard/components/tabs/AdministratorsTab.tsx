import React, { useMemo, useState } from 'react';
import { ShieldCheck, Inbox, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAdministrators } from '../../hooks/useAdministrators';
import type { Administrator } from '../../types/admin.types';
import { formatDistanceToNow } from 'date-fns';
import ReasonPrompt from '../ReasonPrompt';

// ---------- Skeleton primitives ----------
const SkeletonBlock: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style,
}) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} style={style} />
);

// ----- Desktop table skeleton -----
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
    <td className="px-5 py-4"><SkeletonBlock className="h-5 w-20 rounded-full" /></td>
    <td className="px-5 py-4"><SkeletonBlock className="h-5 w-16 rounded-full" /></td>
    <td className="px-5 py-4"><SkeletonBlock className="h-3 w-24" /></td>
    <td className="px-5 py-4">
      <div className="flex justify-end">
        <SkeletonBlock className="h-7 w-20 rounded-lg" />
      </div>
    </td>
  </tr>
);

const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-100">
          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Administrator</th>
          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</th>
          <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} />
        ))}
      </tbody>
    </table>
  </div>
);

// ----- Mobile card skeleton -----
const SkeletonCard: React.FC = () => (
  <div className="p-4 space-y-3">
    <div className="flex items-center gap-3">
      <SkeletonBlock className="rounded-full shrink-0" style={{ width: 40, height: 40 }} />
      <div className="flex-1 min-w-0 space-y-2">
        <SkeletonBlock className="h-3.5 w-32" />
        <SkeletonBlock className="h-2.5 w-48" />
      </div>
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      <SkeletonBlock className="h-5 w-20 rounded-full" />
      <SkeletonBlock className="h-5 w-16 rounded-full" />
    </div>
    <div className="flex items-center justify-between gap-3">
      <SkeletonBlock className="h-2.5 w-24" />
      <SkeletonBlock className="h-7 w-20 rounded-lg" />
    </div>
  </div>
);

const SkeletonCardList: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
  <div className="md:hidden divide-y divide-gray-100">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
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

const SearchInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({
  value, onChange, placeholder = 'Search...',
}) => (
  <div className="relative w-full sm:max-w-sm">
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

const RoleBadge: React.FC<{ role: 'admin' | 'moderator' }> = ({ role }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${
      role === 'admin'
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : 'bg-purple-50 text-purple-700 border-purple-200'
    }`}
  >
    <ShieldCheck size={11} />
    {role}
  </span>
);

const StatusBadge: React.FC<{ status: 'active' | 'inactive' }> = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${
    status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'
  }`}>
    <span className={`h-1.5 w-1.5 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
    {status}
  </span>
);

// ---------- Mobile card ----------
interface AdminCardProps {
  admin: Administrator;
  onPromote: () => void;
  onDemote: () => void;
}

const AdminCard: React.FC<AdminCardProps> = ({ admin, onPromote, onDemote }) => (
  <div className="p-4">
    <div className="flex items-center gap-3">
      <img
        src={admin.avatar}
        alt={admin.name}
        className="w-10 h-10 rounded-full object-cover shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900 truncate">{admin.name}</p>
        <p className="text-xs text-gray-500 truncate">{admin.email}</p>
      </div>
    </div>

    <div className="mt-3 flex items-center gap-2 flex-wrap">
      <RoleBadge role={admin.role} />
      <StatusBadge status={admin.status} />
    </div>

    <div className="mt-3 flex items-center justify-between gap-3">
      <span className="text-xs text-gray-500">
        {admin.lastActive
          ? formatDistanceToNow(new Date(admin.lastActive), { addSuffix: true })
          : 'Never active'}
      </span>
      {admin.role === 'moderator' ? (
        <button
          onClick={onPromote}
          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium"
        >
          Promote
        </button>
      ) : (
        <button
          onClick={onDemote}
          className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium"
        >
          Demote
        </button>
      )}
    </div>
  </div>
);

type Prompt = {
  title: string;
  description?: string;
  submitLabel: string;
  onConfirm: (reason: string) => Promise<void>;
};

const AdministratorsTab: React.FC = () => {
  const { administrators, loading, error, updateRole } = useAdministrators();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'admin' | 'moderator'>('all');
  const [prompt, setPrompt] = useState<Prompt | null>(null);

  const filtered = useMemo(
    () =>
      administrators.filter(
        (a) =>
          (filter === 'all' || a.role === filter) &&
          (a.name.toLowerCase().includes(query.toLowerCase()) ||
            a.email.toLowerCase().includes(query.toLowerCase())),
      ),
    [administrators, filter, query],
  );

  const openPromote = (a: Administrator) => {
    setPrompt({
      title: 'Promote to Admin',
      description: a.email,
      submitLabel: 'Promote',
      onConfirm: async (reason) => {
        await updateRole(a.id, true, reason);
        toast.success('Promoted to admin');
      },
    });
  };

  const openDemote = (a: Administrator) => {
    setPrompt({
      title: 'Demote to Moderator',
      description: a.email,
      submitLabel: 'Demote',
      onConfirm: async (reason) => {
        await updateRole(a.id, false, reason);
        toast.success('Demoted to moderator');
      },
    });
  };

  if (error) return <EmptyState title="Failed to load administrators" description={error} />;

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Administrators</h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Manage admin and moderator access
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by name or email..." />
        <div className="flex gap-2 flex-wrap">
          {(['all', 'admin', 'moderator'] as const).map((f) => (
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <>
            <SkeletonCardList rows={5} />
            <div className="hidden md:block">
              <SkeletonTable rows={6} />
            </div>
          </>
        ) : filtered.length === 0 ? (
          <EmptyState title="No administrators found" description="Try adjusting your filters." />
        ) : (
          <>
            {/* Mobile / tablet card list */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map((a: Administrator) => (
                <AdminCard
                  key={a.id}
                  admin={a}
                  onPromote={() => openPromote(a)}
                  onDemote={() => openDemote(a)}
                />
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Administrator</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((a: Administrator) => (
                    <tr key={a.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={a.avatar}
                            alt={a.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{a.name}</p>
                            <p className="text-xs text-gray-500 truncate">{a.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><RoleBadge role={a.role} /></td>
                      <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
                      <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {a.lastActive
                          ? formatDistanceToNow(new Date(a.lastActive), { addSuffix: true })
                          : '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {a.role === 'moderator' ? (
                          <button
                            onClick={() => openPromote(a)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium"
                          >
                            Promote
                          </button>
                        ) : (
                          <button
                            onClick={() => openDemote(a)}
                            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium"
                          >
                            Demote
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
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

export default AdministratorsTab;