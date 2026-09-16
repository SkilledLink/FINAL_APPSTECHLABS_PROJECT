import React, { useEffect, useMemo, useState } from 'react';
import { Trash2, Inbox, Search, Eye, X, Heart, MessageCircle, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import { useJobs } from '../../hooks/useJobs';
import type { AdminJob, AdminJobDetail, JobComment } from '../../types/moderator.types';
import { formatDistanceToNow } from 'date-fns';
import ReasonPrompt from '../ReasonPrompt';
import Avatar from '../Avatar';
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

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-200 capitalize">
    <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
    {status.replace(/_/g, ' ')}
  </span>
);

type Prompt = {
  title: string;
  description?: string;
  submitLabel: string;
  onConfirm: (reason: string) => Promise<void>;
};

interface DrawerProps {
  jobId: string | null;
  onClose: () => void;
  fetchOne: (id: string) => Promise<AdminJobDetail>;
  onDeleteComment: (jobId: string, comment: JobComment) => void;
  onDeleteJob: (job: AdminJob) => void;
}

const JobDrawer: React.FC<DrawerProps> = ({ jobId, onClose, fetchOne, onDeleteComment, onDeleteJob }) => {
  const [detail, setDetail] = useState<AdminJobDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) { setDetail(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchOne(jobId)
      .then((d) => { if (!cancelled) setDetail(d); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load job'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [jobId, fetchOne]);

  if (!jobId) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">Job details</h3>
            {detail && <p className="text-xs text-gray-500 truncate">{detail.title}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="space-y-4">
              <SkeletonBlock className="h-5 w-2/3" />
              <SkeletonBlock className="h-3 w-full" />
              <SkeletonBlock className="h-3 w-5/6" />
            </div>
          )}
          {error && !loading && <p className="text-sm text-red-500">{error}</p>}
          {detail && !loading && !error && (
            <div className="space-y-5">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-semibold text-gray-900 text-lg">{detail.title}</h4>
                  <StatusBadge status={detail.status} />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Posted {formatDistanceToNow(new Date(detail.postedDate), { addSuffix: true })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Avatar name={detail.client.name} src={detail.client.avatar} size={40} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{detail.client.name}</p>
                  <p className="text-xs text-gray-500">Client</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.description}</p>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1"><Heart size={13} /> {detail.likes}</span>
                <span className="inline-flex items-center gap-1"><MessageCircle size={13} /> {detail.comments}</span>
              </div>

              {detail.images.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Images</p>
                  <div className="flex gap-2 flex-wrap">
                    {detail.images.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noreferrer"
                        className="group relative w-32 h-32 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <ExternalLink size={16} />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Comments ({detail.commentsList.length})
                </p>
                {detail.commentsList.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No comments yet.</p>
                ) : (
                  <div className="space-y-2">
                    {detail.commentsList.map((c) => (
                      <div key={c.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg group">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-mono">{c.userId.slice(0, 8)}</p>
                          <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap break-words">{c.content}</p>
                        </div>
                        <button
                          onClick={() => onDeleteComment(detail.id, c)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete comment"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {detail && !loading && !error && (
          <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-end">
            <button
              onClick={() => onDeleteJob(detail)}
              className="px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium inline-flex items-center gap-1.5"
            >
              <Trash2 size={14} /> Remove job
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const JobsTab: React.FC = () => {
  const { jobs, loading, error, fetchOne, remove, removeComment } = useJobs();
  const [query, setQuery] = useState('');
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = useMemo(
    () => jobs.filter((j) =>
      j.title.toLowerCase().includes(query.toLowerCase()) ||
      j.description.toLowerCase().includes(query.toLowerCase())),
    [jobs, query],
  );

  const openRemoveJob = (job: AdminJob) => setPrompt({
    title: 'Remove job',
    description: job.title,
    submitLabel: 'Remove',
    onConfirm: async (reason) => {
      await remove(job.id, reason);
      toast.success('Job removed');
      if (detailId === job.id) setDetailId(null);
    },
  });

  const openRemoveComment = (jobId: string, comment: JobComment) => setPrompt({
    title: 'Delete comment',
    description: comment.content.slice(0, 80),
    submitLabel: 'Delete',
    onConfirm: async (reason) => {
      await removeComment(jobId, comment.id, reason);
      toast.success('Comment deleted');
    },
  });

  if (error) return <EmptyState title="Failed to load jobs" description={error} />;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Jobs</h2>
        <p className="text-gray-500 mt-1">Monitor jobs for content violations and disputes</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by title or description..." />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-5 py-4">
                <SkeletonBlock className="h-3.5 w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No jobs found" description="Try adjusting your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Job</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Posted</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((j) => (
                  <tr
                    key={j.id}
                    onClick={() => setDetailId(j.id)}
                    className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{j.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{j.description}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={j.client.name} src={j.client.avatar} size={28} />
                        <span className="text-sm">{j.client.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={j.status} /></td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {formatDistanceToNow(new Date(j.postedDate), { addSuffix: true })}
                    </td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setDetailId(j.id)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="Details">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => openRemoveJob(j)} className="p-2 rounded-lg text-red-500 hover:bg-red-50" title="Remove">
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
          onSubmit={async (reason) => { await prompt.onConfirm(reason); setPrompt(null); }}
          onCancel={() => setPrompt(null)}
        />
      )}

      <JobDrawer
        jobId={detailId}
        onClose={() => setDetailId(null)}
        fetchOne={fetchOne}
        onDeleteComment={openRemoveComment}
        onDeleteJob={openRemoveJob}
      />
    </div>
  );
};

export default JobsTab;