import React, { useMemo, useState } from 'react';
import { Ban, CheckCircle, Star, XCircle, Flag, Loader2, Inbox, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useProfessionals } from '../../hooks/useProfessionals';
import type { AdminProfessional } from '../../types/admin.types';
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
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  under_review: 'bg-blue-50 text-blue-700 border-blue-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
  deactivated: 'bg-gray-100 text-gray-700 border-gray-200',
  deleted: 'bg-gray-100 text-gray-500 border-gray-200',
};
const statusDots: Record<string, string> = {
  active: 'bg-green-500',
  pending: 'bg-yellow-500',
  under_review: 'bg-blue-500',
  suspended: 'bg-red-500',
  deactivated: 'bg-gray-400',
  deleted: 'bg-gray-400',
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusStyles[status] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${statusDots[status] ?? 'bg-gray-400'}`} />
    {status.replace(/_/g, ' ')}
  </span>
);

const VerificationBadge: React.FC<{ status: string; verified: boolean }> = ({ status, verified }) => {
  const variant = verified
    ? 'bg-green-50 text-green-700 border-green-200'
    : ['rejected', 'failed', 'expired', 'manual_rejected'].includes(status)
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-yellow-50 text-yellow-700 border-yellow-200';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${variant}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

type Prompt = {
  title: string;
  description?: string;
  submitLabel: string;
  requireNotes?: boolean;
  onConfirm: (reason: string, notes?: string) => Promise<void>;
};

const ProfessionalsTab: React.FC = () => {
  const {
    professionals, loading, error, verify, suspend, reactivate, flag, unflag,
  } = useProfessionals();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [prompt, setPrompt] = useState<Prompt | null>(null);

  const filtered = useMemo(
    () =>
      professionals.filter(
        (p) =>
          (filter === 'all' || p.status === filter) &&
          (p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.profession.toLowerCase().includes(query.toLowerCase())),
      ),
    [professionals, filter, query],
  );

  if (loading) return <Loader />;
  if (error) return <EmptyState title="Failed to load professionals" description={error} />;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Professionals</h2>
        <p className="text-gray-500 mt-1">Verify, manage and monitor service providers</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by name or profession..." />
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'pending', 'under_review', 'suspended', 'deactivated'].map((f) => (
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
          <EmptyState title="No professionals found" description="Try adjusting your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Professional</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Jobs</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trust</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Verification</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p: AdminProfessional) => {
                  const canVerify =
                    ['pending', 'manual_review', 'not_started'].includes(p.verificationStatus) &&
                    p.status !== 'deleted';
                  const canSuspend = p.status === 'active';
                  const canReactivate = p.status === 'suspended';
                  const isDeleted = p.status === 'deleted';
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover" />
                          <div>
                            <p className="font-medium text-gray-900 flex items-center gap-2">
                              {p.name}
                              {p.isFlagged && <Flag size={12} className="text-red-500" />}
                            </p>
                            <p className="text-xs text-gray-500">{p.profession} · {p.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          {p.rating.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{p.totalJobs}</td>
                      <td className="px-5 py-4 text-sm text-gray-700">{p.trustScore}</td>
                      <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-4">
                        <VerificationBadge status={p.verificationStatus} verified={p.isVerified} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {!isDeleted && canVerify && (
                            <>
                              <button
                                onClick={() =>
                                  setPrompt({
                                    title: 'Approve verification',
                                    description: p.name,
                                    submitLabel: 'Approve',
                                    onConfirm: async (reason) => {
                                      await verify(p.id, 'manual_approved', reason);
                                      toast.success('Professional verified');
                                    },
                                  })
                                }
                                className="p-2 rounded-lg text-green-600 hover:bg-green-50"
                                title="Approve verification"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  setPrompt({
                                    title: 'Reject verification',
                                    description: p.name,
                                    submitLabel: 'Reject',
                                    onConfirm: async (reason) => {
                                      await verify(p.id, 'manual_rejected', reason);
                                      toast.success('Verification rejected');
                                    },
                                  })
                                }
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                                title="Reject verification"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {!isDeleted && canSuspend && (
                            <button
                              onClick={() =>
                                setPrompt({
                                  title: 'Suspend professional',
                                  description: p.name,
                                  submitLabel: 'Suspend',
                                  onConfirm: async (reason) => {
                                    await suspend(p.id, reason);
                                    toast.success('Professional suspended');
                                  },
                                })
                              }
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                              title="Suspend"
                            >
                              <Ban size={16} />
                            </button>
                          )}
                          {!isDeleted && canReactivate && (
                            <button
                              onClick={() =>
                                setPrompt({
                                  title: 'Reactivate professional',
                                  description: p.name,
                                  submitLabel: 'Reactivate',
                                  onConfirm: async (reason) => {
                                    await reactivate(p.id, reason);
                                    toast.success('Professional reactivated');
                                  },
                                })
                              }
                              className="p-2 rounded-lg text-green-600 hover:bg-green-50"
                              title="Reactivate"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {!isDeleted && !p.isFlagged && (
                            <button
                              onClick={() =>
                                setPrompt({
                                  title: 'Flag professional',
                                  description: p.name,
                                  submitLabel: 'Flag',
                                  requireNotes: true,
                                  onConfirm: async (reason, notes) => {
                                    await flag(p.id, reason, notes);
                                    toast.success('Professional flagged');
                                  },
                                })
                              }
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                              title="Flag"
                            >
                              <Flag size={16} />
                            </button>
                          )}
                          {!isDeleted && p.isFlagged && (
                            <button
                              onClick={() =>
                                setPrompt({
                                  title: 'Unflag professional',
                                  description: p.name,
                                  submitLabel: 'Unflag',
                                  onConfirm: async (reason) => {
                                    await unflag(p.id, reason);
                                    toast.success('Flag removed');
                                  },
                                })
                              }
                              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                              title="Unflag"
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
          requireNotes={prompt.requireNotes}
          onSubmit={async (reason, notes) => {
            await prompt.onConfirm(reason, notes);
            setPrompt(null);
          }}
          onCancel={() => setPrompt(null)}
        />
      )}
    </div>
  );
};

export default ProfessionalsTab;