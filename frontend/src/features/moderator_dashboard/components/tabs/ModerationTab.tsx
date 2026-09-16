import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Inbox, Eye, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useModeration } from '../../hooks/useModeration';
import type { ModerationQueueItem, ModerationDetail } from '../../types/moderator.types';
import { formatDistanceToNow } from 'date-fns';
import ReasonPrompt from '../ReasonPrompt';
import { SkeletonBlock } from '../Skeleton';

const severityVariant = (severity: number): 'danger' | 'warning' | 'neutral' => {
  if (severity >= 7) return 'danger';
  if (severity >= 4) return 'warning';
  return 'neutral';
};

const Chip: React.FC<{ children: React.ReactNode; variant?: 'danger' | 'warning' | 'info' | 'success' | 'neutral' }> = ({
  children, variant = 'neutral',
}) => {
  const styles = {
    danger: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  const dots = {
    danger: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
    success: 'bg-green-500',
    neutral: 'bg-gray-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[variant]}`} />
      {children}
    </span>
  );
};

const EmptyState: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 mb-4">
      <Inbox size={28} />
    </div>
    <p className="font-semibold text-gray-900">{title}</p>
    {description && <p className="text-sm text-gray-500 mt-1 max-w-sm">{description}</p>}
  </div>
);

const Skeleton: React.FC = () => (
  <div>
    <div className="mb-8">
      <SkeletonBlock className="h-8 w-64" />
      <SkeletonBlock className="mt-2 h-4 w-80" />
    </div>
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start gap-4">
            <SkeletonBlock className="rounded-xl" style={{ width: 44, height: 44 }} />
            <div className="flex-1 space-y-3">
              <SkeletonBlock className="h-6 w-2/3" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

type Prompt = {
  title: string;
  description?: string;
  submitLabel: string;
  onConfirm: (reason: string) => Promise<void>;
};

interface DrawerProps {
  item: ModerationQueueItem | null;
  onClose: () => void;
  fetchOne: (id: string) => Promise<ModerationDetail>;
  approve: (recordId: string, reason: string) => Promise<void>;
  reject: (recordId: string, reason: string) => Promise<void>;
}

const ModerationDrawer: React.FC<DrawerProps> = ({ item, onClose, fetchOne, approve, reject }) => {
  const [detail, setDetail] = React.useState<ModerationDetail | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [prompt, setPrompt] = React.useState<Prompt | null>(null);

  React.useEffect(() => {
    if (!item) { setDetail(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchOne(item.recordId)
      .then((d) => { if (!cancelled) setDetail(d); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load record'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [item, fetchOne]);

  if (!item) return null;

  const severity = detail?.severity ?? item.summary.severity;
  const decision = detail?.decision ?? item.summary.decision;
  const confidence = detail?.confidence ?? item.summary.confidence;
  const categories = detail?.categories ?? item.summary.categories;
  const description = detail?.description ?? item.summary.description;
  const reason = detail?.reason ?? item.summary.reason;
  const provider = detail?.provider ?? item.summary.provider;
  const model = detail?.model ?? item.summary.model;
  const createdAt = detail?.createdAt ?? item.summary.createdAt;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">Moderation detail</h3>
            <p className="text-xs text-gray-500 truncate">Record {item.recordId.slice(0, 8)}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="space-y-4">
              <SkeletonBlock className="h-4 w-2/3" />
              <SkeletonBlock className="h-3 w-full" />
              <SkeletonBlock className="h-3 w-5/6" />
            </div>
          )}
          {error && !loading && <p className="text-sm text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Content</p>
                <p className="font-medium text-gray-900">{item.feedTitle}</p>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{item.feedDescription}</p>
                {item.feedMedia.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {item.feedMedia.map((m) => (
                      <div key={m.id} className="w-32 h-32 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                        {m.media_type === 'video' ? (
                          <video src={m.media_url} className="w-full h-full object-cover" controls />
                        ) : (
                          <img src={m.media_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">AI verdict</p>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <Chip variant={severityVariant(severity)}>severity {severity}</Chip>
                  <Chip variant="neutral">{decision}</Chip>
                  <Chip variant="info">confidence {confidence}%</Chip>
                  {categories.map((c) => <Chip key={c} variant="warning">{c}</Chip>)}
                </div>
                {description && (
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 italic">"{description}"</div>
                )}
                {reason && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Reason</p>
                    <p className="text-sm text-gray-700">{reason}</p>
                  </div>
                )}
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                  <span>{provider} / {model}</span>
                  <span>·</span>
                  <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-end gap-2">
          <button
            onClick={() => setPrompt({
              title: 'Reject content',
              description: item.feedTitle,
              submitLabel: 'Reject',
              onConfirm: async (r) => { await reject(item.recordId, r); toast.success('Content rejected'); onClose(); },
            })}
            className="px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium inline-flex items-center gap-1.5"
          >
            <XCircle size={14} /> Reject
          </button>
          <button
            onClick={() => setPrompt({
              title: 'Approve content',
              description: item.feedTitle,
              submitLabel: 'Approve',
              onConfirm: async (r) => { await approve(item.recordId, r); toast.success('Content approved'); onClose(); },
            })}
            className="px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-sm font-medium inline-flex items-center gap-1.5"
          >
            <CheckCircle size={14} /> Approve
          </button>
        </div>
      </div>

      {prompt && (
        <ReasonPrompt
          title={prompt.title}
          description={prompt.description}
          submitLabel={prompt.submitLabel}
          onSubmit={async (r) => { await prompt.onConfirm(r); setPrompt(null); }}
          onCancel={() => setPrompt(null)}
        />
      )}
    </>
  );
};

const ModerationTab: React.FC = () => {
  const { items, loading, error, fetchOne, approve, reject } = useModeration();
  const [selected, setSelected] = useState<ModerationQueueItem | null>(null);
  const [prompt, setPrompt] = useState<Prompt | null>(null);

  if (loading) return <Skeleton />;
  if (error) return <EmptyState title="Failed to load moderation queue" description={error} />;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Moderation Queue</h2>
        <p className="text-gray-500 mt-1">Review AI-flagged content awaiting a decision</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState title="Queue is clear" description="No flagged content to review right now." />
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.recordId}
              onClick={() => setSelected(item)}
              className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-emerald-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl ${
                  severityVariant(item.summary.severity) === 'danger' ? 'bg-red-50 text-red-500'
                    : severityVariant(item.summary.severity) === 'warning' ? 'bg-yellow-50 text-yellow-600'
                    : 'bg-gray-50 text-gray-500'
                }`}>
                  <AlertTriangle size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Chip variant={severityVariant(item.summary.severity)}>severity {item.summary.severity}</Chip>
                    <Chip variant="neutral">{item.summary.decision}</Chip>
                    <Chip variant="info">confidence {item.summary.confidence}%</Chip>
                    {item.summary.categories.map((c) => <Chip key={c} variant="warning">{c}</Chip>)}
                  </div>

                  <p className="font-medium text-gray-900 mt-3">{item.feedTitle}</p>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-3">{item.feedDescription}</p>

                  {item.feedMedia.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {item.feedMedia.map((m) => (
                        <div key={m.id} className="w-24 h-24 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                          {m.media_type === 'video' ? (
                            <video src={m.media_url} className="w-full h-full object-cover" />
                          ) : (
                            <img src={m.media_url} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {item.summary.description && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 italic">
                      "{item.summary.description}"
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                    <span>{item.summary.provider} / {item.summary.model}</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(item.summary.createdAt), { addSuffix: true })}</span>
                  </div>

                  <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelected(item)}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <Eye size={14} /> Details
                    </button>
                    <button
                      onClick={() => setPrompt({
                        title: 'Approve content',
                        description: item.feedTitle,
                        submitLabel: 'Approve',
                        onConfirm: async (reason) => { await approve(item.recordId, reason); toast.success('Content approved'); },
                      })}
                      className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button
                      onClick={() => setPrompt({
                        title: 'Reject content',
                        description: item.feedTitle,
                        submitLabel: 'Reject',
                        onConfirm: async (reason) => { await reject(item.recordId, reason); toast.success('Content rejected'); },
                      })}
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {prompt && (
        <ReasonPrompt
          title={prompt.title}
          description={prompt.description}
          submitLabel={prompt.submitLabel}
          onSubmit={async (reason) => { await prompt.onConfirm(reason); setPrompt(null); }}
          onCancel={() => setPrompt(null)}
        />
      )}

      <ModerationDrawer
        item={selected}
        onClose={() => setSelected(null)}
        fetchOne={fetchOne}
        approve={approve}
        reject={reject}
      />
    </div>
  );
};

export default ModerationTab;