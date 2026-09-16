import React, { useEffect, useMemo, useState } from 'react';
import { Ban, CheckCircle, Star, Inbox, Search, Eye, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useProfessionals } from '../../hooks/useProfessionals';
import type { AdminProfessional, AdminProfessionalDetail } from '../../types/moderator.types';
import ReasonPrompt from '../ReasonPrompt';
import Avatar from '../Avatar';
import { SkeletonBlock } from '../Skeleton';

const statusStyles: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  under_review: 'bg-blue-50 text-blue-700 border-blue-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
  deactivated: 'bg-gray-100 text-gray-700 border-gray-200',
};
const statusDots: Record<string, string> = {
  active: 'bg-green-500', pending: 'bg-yellow-500', under_review: 'bg-blue-500', suspended: 'bg-red-500', deactivated: 'bg-gray-400',
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
  professionalId: string | null;
  onClose: () => void;
  fetchOne: (id: string) => Promise<AdminProfessionalDetail>;
  onSuspend: (p: AdminProfessional) => void;
  onReactivate: (p: AdminProfessional) => void;
}

const ProfessionalDrawer: React.FC<DrawerProps> = ({ professionalId, onClose, fetchOne, onSuspend, onReactivate }) => {
  const [detail, setDetail] = useState<AdminProfessionalDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!professionalId) { setDetail(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchOne(professionalId)
      .then((d) => { if (!cancelled) setDetail(d); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load professional'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [professionalId, fetchOne]);

  if (!professionalId) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">Professional details</h3>
            {detail && <p className="text-xs text-gray-500 truncate">{detail.profession}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="space-y-4">
              <SkeletonBlock className="rounded-full" style={{ width: 64, height: 64 }} />
              <SkeletonBlock className="h-4 w-40" />
              <SkeletonBlock className="h-20 w-full" />
            </div>
          )}
          {error && !loading && <p className="text-sm text-red-500">{error}</p>}
          {detail && !loading && !error && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar name={detail.name} src={detail.avatar} size={64} />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{detail.name}</p>
                  <p className="text-sm text-gray-500">{detail.profession}</p>
                  {detail.headline && <p className="text-xs text-gray-400 mt-0.5">{detail.headline}</p>}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusBadge status={detail.status} />
                {detail.isVerified && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                    Verified
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-500">Rating</p>
                  <p className="text-gray-900 inline-flex items-center gap-1">
                    <Star size={13} className="text-yellow-400 fill-yellow-400" />
                    {detail.rating.toFixed(1)}
                    <span className="text-xs text-gray-400">({detail.totalReviews})</span>
                  </p>
                </div>
                <div><p className="text-xs text-gray-500">Completed jobs</p><p className="text-gray-900">{detail.totalJobs}</p></div>
                <div><p className="text-xs text-gray-500">Location</p><p className="text-gray-900">{detail.location}</p></div>
                <div><p className="text-xs text-gray-500">Experience</p><p className="text-gray-900">{detail.yearsOfExperience ?? '—'}</p></div>
                <div><p className="text-xs text-gray-500">Level</p><p className="text-gray-900 capitalize">{detail.experienceLevel ?? '—'}</p></div>
                <div><p className="text-xs text-gray-500">Hourly rate</p><p className="text-gray-900">
                  {detail.hourlyRate != null ? `${detail.hourlyRate.toLocaleString()} ${detail.currency}` : '—'}
                </p></div>
                <div><p className="text-xs text-gray-500">Joined</p><p className="text-gray-900">{new Date(detail.joinedDate).toLocaleDateString()}</p></div>
                <div><p className="text-xs text-gray-500">Available</p><p className="text-gray-900">{detail.available ? 'Yes' : 'No'}</p></div>
              </div>

              {detail.bio && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Bio</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.bio}</p>
                </div>
              )}

              {detail.skills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.skills.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {detail.services.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Services</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.services.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                {detail.status === 'suspended' ? (
                  <button
                    onClick={() => onReactivate(detail)}
                    className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    <CheckCircle size={13} /> Reactivate
                  </button>
                ) : detail.status !== 'deleted' && (
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

const ProfessionalsTab: React.FC = () => {
  const { professionals, loading, error, fetchOne, suspend, reactivate } = useProfessionals();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = useMemo(
    () => professionals.filter((p) =>
      (filter === 'all' || p.status === filter) &&
      (p.name.toLowerCase().includes(query.toLowerCase()) || p.profession.toLowerCase().includes(query.toLowerCase()))),
    [professionals, filter, query],
  );

  const openSuspend = (p: AdminProfessional) => setPrompt({
    title: 'Suspend professional',
    description: p.name,
    submitLabel: 'Suspend',
    onConfirm: async (reason) => { await suspend(p.id, reason); toast.success('Professional suspended'); },
  });

  const openReactivate = (p: AdminProfessional) => setPrompt({
    title: 'Reactivate professional',
    description: p.name,
    submitLabel: 'Reactivate',
    onConfirm: async (reason) => { await reactivate(p.id, reason); toast.success('Professional reactivated'); },
  });

  if (error) return <EmptyState title="Failed to load professionals" description={error} />;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Professionals</h2>
        <p className="text-gray-500 mt-1">Review provider accounts and manage violations</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by name or profession..." />
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'pending', 'under_review', 'suspended', 'deactivated'].map((f) => (
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
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No professionals found" description="Try adjusting your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Professional</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Jobs</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setDetailId(p.id)}
                    className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.name} src={p.avatar} size={36} />
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
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
                    <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setDetailId(p.id)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="Details">
                          <Eye size={16} />
                        </button>
                        {p.status === 'suspended' ? (
                          <button onClick={() => openReactivate(p)} className="p-2 rounded-lg text-green-600 hover:bg-green-50" title="Reactivate">
                            <CheckCircle size={16} />
                          </button>
                        ) : p.status !== 'deleted' && (
                          <button onClick={() => openSuspend(p)} className="p-2 rounded-lg text-red-500 hover:bg-red-50" title="Suspend">
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

      <ProfessionalDrawer
        professionalId={detailId}
        onClose={() => setDetailId(null)}
        fetchOne={fetchOne}
        onSuspend={openSuspend}
        onReactivate={openReactivate}
      />
    </div>
  );
};

export default ProfessionalsTab;