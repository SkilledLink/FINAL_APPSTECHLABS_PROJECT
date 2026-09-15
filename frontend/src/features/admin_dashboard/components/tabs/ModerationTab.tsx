import React, { useEffect, useState } from 'react';
import {
  CheckCircle, XCircle, AlertTriangle, Inbox, Eye, X, ChevronDown, ShieldAlert, ShieldCheck, ShieldQuestion,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useModeration } from '../../hooks/useModeration';
import type { ModerationQueueItem, ModerationDetail } from '../../types/admin.types';
import { formatDistanceToNow } from 'date-fns';
import ReasonPrompt from '../ReasonPrompt';

// ---------- Skeleton primitives ----------
const SkeletonBlock: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style,
}) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} style={style} />
);

const SkeletonChip: React.FC<{ w?: number }> = ({ w = 80 }) => (
  <SkeletonBlock className="h-5 rounded-full" style={{ width: w }} />
);

const SkeletonQueueCard: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
    <div className="flex items-start gap-3 sm:gap-4">
      <SkeletonBlock className="rounded-xl shrink-0" style={{ width: 40, height: 40 }} />
      <div className="flex-1 min-w-0 space-y-3">
        {/* Chips row */}
        <div className="flex items-center gap-2 flex-wrap">
          <SkeletonChip w={90} />
          <SkeletonChip w={70} />
          <SkeletonChip w={110} />
        </div>
        {/* Title + description */}
        <div className="space-y-2">
          <SkeletonBlock className="h-3.5 w-2/3" />
          <SkeletonBlock className="h-2.5 w-full" />
          <SkeletonBlock className="h-2.5 w-11/12" />
          <SkeletonBlock className="h-2.5 w-3/4" />
        </div>
        {/* Media thumbs */}
        <div className="flex gap-2 flex-wrap">
          <SkeletonBlock className="rounded-lg w-20 h-20 sm:w-24 sm:h-24" />
          <SkeletonBlock className="rounded-lg w-20 h-20 sm:w-24 sm:h-24" />
          <SkeletonBlock className="rounded-lg w-20 h-20 sm:w-24 sm:h-24" />
        </div>
        {/* Provider line */}
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-2.5 w-32" />
          <SkeletonBlock className="h-2.5 w-16" />
        </div>
        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <SkeletonBlock className="h-8 w-24 rounded-lg" />
          <SkeletonBlock className="h-8 w-24 rounded-lg" />
          <SkeletonBlock className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

const SkeletonQueue: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonQueueCard key={i} />
    ))}
  </div>
);

// ---------- Local UI helpers ----------
const EmptyState: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 text-center">
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

// Normalizes whatever the provider calls its decision into one of three
// buckets so the drawer can lead with a single, unambiguous verdict.
const decisionTone = (decision: string): 'reject' | 'approve' | 'review' => {
  const d = decision.toLowerCase();
  if (d.includes('reject') || d.includes('block') || d.includes('remove') || d.includes('deny')) return 'reject';
  if (d.includes('approve') || d.includes('allow') || d.includes('pass') || d.includes('clear')) return 'approve';
  return 'review';
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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${styles[variant]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[variant]}`} />
      {children}
    </span>
  );
};

// A verdict banner that leads the drawer: one glance tells you what the
// model decided, so the details below are read as support for that call
// rather than three co-equal facts (decision / severity / confidence).
const VerdictBanner: React.FC<{ decision: string; severity: number; confidence: number }> = ({
  decision, severity, confidence,
}) => {
  const tone = decisionTone(decision);
  const toneStyles = {
    reject: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', icon: 'text-red-500', Icon: ShieldAlert },
    approve: { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-700', icon: 'text-green-500', Icon: ShieldCheck },
    review: { bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-700', icon: 'text-yellow-600', Icon: ShieldQuestion },
  }[tone];
  const { Icon } = toneStyles;

  return (
    <div className={`rounded-xl border ${toneStyles.border} ${toneStyles.bg} p-4`}>
      <div className="flex items-center gap-3">
        <Icon size={20} className={toneStyles.icon} />
        <p className={`font-semibold capitalize ${toneStyles.text}`}>{decision}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Severity</span>
            <span className="text-xs font-medium text-gray-700">{severity}/10</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/70 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                severityVariant(severity) === 'danger'
                  ? 'bg-red-500'
                  : severityVariant(severity) === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-gray-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, severity * 10))}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Confidence</span>
            <span className="text-xs font-medium text-gray-700">{confidence}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/70 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${Math.min(100, Math.max(0, confidence))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Raw provider payloads are the least-read, most-crowded part of the
// drawer — collapsed by default so the verdict stays the focal point.
const CollapsibleJson: React.FC<{ label: string; value: unknown; defaultOpen?: boolean }> = ({
  label, value, defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const isEmpty = value === null || value === undefined;

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => !isEmpty && setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 text-left ${
          isEmpty ? 'cursor-default' : 'cursor-pointer hover:bg-gray-100'
        }`}
      >
        <span className="text-xs font-semibold text-gray-600">{label}</span>
        {isEmpty ? (
          <span className="text-xs text-gray-400 italic">None</span>
        ) : (
          <ChevronDown
            size={14}
            className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>
      {open && !isEmpty && (
        <pre className="bg-white p-3 text-[11px] leading-relaxed text-gray-700 overflow-x-auto whitespace-pre-wrap break-words max-h-72 overflow-y-auto font-mono border-t border-gray-100">
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  );
};

// ---------- Skeleton for drawer ----------
const SkeletonDrawer: React.FC = () => (
  <div className="space-y-5">
    <SkeletonBlock className="h-24 w-full rounded-xl" />
    <div className="space-y-2">
      <SkeletonBlock className="h-4 w-2/3" />
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-5/6" />
    </div>
    <div className="flex flex-wrap gap-2">
      <SkeletonBlock className="rounded-lg w-24 h-24 sm:w-32 sm:h-32" />
      <SkeletonBlock className="rounded-lg w-24 h-24 sm:w-32 sm:h-32" />
    </div>
    <div className="space-y-2">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="h-10 w-full rounded-lg" />
    </div>
    <div className="space-y-2">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="h-10 w-full rounded-lg" />
    </div>
  </div>
);

// ---------- Drawer ----------
interface DrawerProps {
  item: ModerationQueueItem | null;
  onClose: () => void;
  fetchOne: (id: string) => Promise<ModerationDetail>;
  approve: (recordId: string, reason: string) => Promise<void>;
  reject: (recordId: string, reason: string) => Promise<void>;
}

type Prompt = {
  title: string;
  description?: string;
  submitLabel: string;
  onConfirm: (reason: string) => Promise<void>;
};

const ModerationDrawer: React.FC<DrawerProps> = ({
  item, onClose, fetchOne, approve, reject,
}) => {
  const [detail, setDetail] = useState<ModerationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<Prompt | null>(null);

  useEffect(() => {
    if (!item) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchOne(item.recordId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load record');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [item, fetchOne]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!item) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [item]);

  // Close on Escape
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, onClose]);

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
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-xl lg:max-w-2xl bg-white shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-lg shrink-0 ${
              severityVariant(severity) === 'danger'
                ? 'bg-red-50 text-red-500'
                : severityVariant(severity) === 'warning'
                  ? 'bg-yellow-50 text-yellow-600'
                  : 'bg-gray-50 text-gray-500'
            }`}>
              <AlertTriangle size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">Moderation detail</h3>
              <p className="text-xs text-gray-500 truncate">Record {item.recordId.slice(0, 8)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading && <SkeletonDrawer />}

          {error && !loading && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {!loading && !error && (
            <div className="space-y-6">
              {/* Verdict, front and center */}
              <div>
                <VerdictBanner decision={decision} severity={severity} confidence={confidence} />

                {categories.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mt-3">
                    {categories.map((c) => (
                      <Chip key={c} variant="warning">{c}</Chip>
                    ))}
                  </div>
                )}

                {description && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 italic break-words">
                    "{description}"
                  </div>
                )}

                {reason && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Reason</p>
                    <p className="text-sm text-gray-700 break-words">{reason}</p>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                  <span className="break-words">{provider} / {model}</span>
                  <span className="hidden sm:inline">·</span>
                  <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Feed context */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Content
                </p>
                <p className="font-medium text-gray-900 break-words">{item.feedTitle}</p>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">
                  {item.feedDescription}
                </p>
                {item.feedMedia.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {item.feedMedia.map((m) => (
                      <div
                        key={m.id}
                        className="aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50"
                      >
                        {m.media_type === 'video' ? (
                          <video
                            src={m.media_url}
                            className="w-full h-full object-cover"
                            controls
                          />
                        ) : (
                          <img
                            src={m.media_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-100" />

              {/* Raw provider output, tucked away by default */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Raw provider output
                </p>
                <CollapsibleJson label="Text result" value={detail?.textResult ?? null} />
                <CollapsibleJson label="Image results" value={detail?.imageResults ?? null} />
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-gray-100 px-4 sm:px-5 py-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2">
          <button
            onClick={() =>
              setPrompt({
                title: 'Reject content',
                description: item.feedTitle,
                submitLabel: 'Reject',
                onConfirm: async (r) => {
                  await reject(item.recordId, r);
                  toast.success('Content rejected');
                  onClose();
                },
              })
            }
            className="justify-center px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium inline-flex items-center gap-1.5"
          >
            <XCircle size={14} /> Reject
          </button>
          <button
            onClick={() =>
              setPrompt({
                title: 'Approve content',
                description: item.feedTitle,
                submitLabel: 'Approve',
                onConfirm: async (r) => {
                  await approve(item.recordId, r);
                  toast.success('Content approved');
                  onClose();
                },
              })
            }
            className="justify-center px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-sm font-medium inline-flex items-center gap-1.5"
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
          onSubmit={async (r) => {
            await prompt.onConfirm(r);
            setPrompt(null);
          }}
          onCancel={() => setPrompt(null)}
        />
      )}
    </>
  );
};

// ---------- Tab ----------
const ModerationTab: React.FC = () => {
  const { items, loading, error, fetchOne, approve, reject } = useModeration();
  const [selected, setSelected] = useState<ModerationQueueItem | null>(null);
  const [prompt, setPrompt] = useState<Prompt | null>(null);

  if (error) return <EmptyState title="Failed to load moderation queue" description={error} />;

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Moderation</h2>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Review AI-flagged content awaiting decision
        </p>
      </div>

      {loading ? (
        <SkeletonQueue rows={4} />
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState title="Queue is clear" description="No flagged content to review right now." />
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item: ModerationQueueItem) => (
            <div
              key={item.recordId}
              onClick={() => setSelected(item)}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 cursor-pointer hover:border-blue-200 hover:shadow-sm active:bg-gray-50 transition-all"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${
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

                  <p className="font-medium text-gray-900 mt-3 break-words">{item.feedTitle}</p>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-3 break-words">{item.feedDescription}</p>

                  {item.feedMedia.length > 0 && (
                    <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {item.feedMedia.map((m) => (
                        <div key={m.id} className="aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
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
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 italic break-words">
                      "{item.summary.description}"
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                    <span className="break-words">{item.summary.provider} / {item.summary.model}</span>
                    <span className="hidden sm:inline">·</span>
                    <span>{formatDistanceToNow(new Date(item.summary.createdAt), { addSuffix: true })}</span>
                  </div>

                  <div
                    className="mt-4 flex flex-wrap gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setSelected(item)}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <Eye size={14} /> Details
                    </button>
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