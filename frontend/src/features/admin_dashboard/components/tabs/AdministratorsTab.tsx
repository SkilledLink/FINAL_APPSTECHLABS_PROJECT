import React, { useMemo, useState } from 'react';
import { ShieldCheck, Loader2, Inbox, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAdministrators } from '../../hooks/useAdministrators';
import type { Administrator } from '../../types/admin.types';
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

const RoleBadge: React.FC<{ role: 'admin' | 'moderator' }> = ({ role }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
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
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
    status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'
  }`}>
    <span className={`h-1.5 w-1.5 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
    {status}
  </span>
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

  if (loading) return <Loader />;
  if (error) return <EmptyState title="Failed to load administrators" description={error} />;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Administrators</h2>
          <p className="text-gray-500 mt-1">Manage admin and moderator access</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
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
        {filtered.length === 0 ? (
          <EmptyState title="No administrators found" description="Try adjusting your filters." />
        ) : (
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
                {filtered.map((a: Administrator) => (
                  <tr key={a.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={a.avatar} alt={a.name} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <p className="font-medium text-gray-900">{a.name}</p>
                          <p className="text-xs text-gray-500">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><RoleBadge role={a.role} /></td>
                    <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {a.lastActive
                        ? formatDistanceToNow(new Date(a.lastActive), { addSuffix: true })
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {a.role === 'moderator' ? (
                        <button
                          onClick={() =>
                            setPrompt({
                              title: 'Promote to Admin',
                              description: a.email,
                              submitLabel: 'Promote',
                              onConfirm: async (reason) => {
                                await updateRole(a.id, true, reason);
                                toast.success('Promoted to admin');
                              },
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium"
                        >
                          Promote
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setPrompt({
                              title: 'Demote to Moderator',
                              description: a.email,
                              submitLabel: 'Demote',
                              onConfirm: async (reason) => {
                                await updateRole(a.id, false, reason);
                                toast.success('Demoted to moderator');
                              },
                            })
                          }
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