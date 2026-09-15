import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Loader2, Inbox } from 'lucide-react';
import { toast } from 'react-toastify';
import { useModeration } from '../../hooks/useModeration';
import type { ModerationQueueItem } from '../../types/admin.types';
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

type Prompt = {
  title: string;
  description?: string;
  submitLabel: string;
  onConfirm: (reason: string) => Promise<void>;
};

const ModerationTab: React.FC = () => {
  const { items, loading, error, approve, reject } = useModeration();
  const [prompt, setPrompt] = useState<Prompt | null>(null);

  if (loading) return <Loader />;
  if (error) return <EmptyState title="Failed to load moderation queue" description={error} />;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Moderation</h2>
        <p className="text-gray-500 mt-1">Review AI-flagged content awaiting decision</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState title="Queue is clear" description="No flagged content to review right now." />
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item: ModerationQueueItem) => (
            <div key={item.recordId} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl ${
                  severityVariant(item.summary.severity) === 'danger'
                    ? 'bg-red-50 text-red-500'
                    : severityVariant(item.summary.severity) === 'warning'
                      ? 'bg-yellow-50 text-yellow-600'
                      : 'bg-gray-50 text-gray-500'
                }`}>
                  <AlertTriangle size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Chip variant={severityVariant(item.summary.severity)}>
                      severity {item.summary.severity}
                    </Chip>
                    <Chip variant="neutral">{item.summary.decision}</Chip>
                    <Chip variant="info">confidence {item.summary.confidence}%</Chip>
                    {item.summary.categories.map((c) => (
                      <Chip key={c} variant="warning">{c}</Chip>
                    ))}
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

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() =>
                        setPrompt({
                          title: 'Approve content',
                          description: item.feedTitle,
                          submitLabel: 'Approve',
                          onConfirm: async (reason) => {
                            await approve(item.recordId, reason);
                            toast.success('Content approved');
                          },
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button
                      onClick={() =>
                        setPrompt({
                          title: 'Reject content',
                          description: item.feedTitle,
                          submitLabel: 'Reject',
                          onConfirm: async (reason) => {
                            await reject(item.recordId, reason);
                            toast.success('Content rejected');
                          },
                        })
                      }
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

export default ModerationTab;