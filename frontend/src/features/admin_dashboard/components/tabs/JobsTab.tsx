import React, { useEffect, useMemo, useState } from 'react';
import {
  Trash2, Loader2, Inbox, Search, Eye, X, Heart, MessageCircle, ExternalLink,
  Download,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useJobs } from '../../hooks/useJobs';
import type { AdminJob, AdminJobDetail, JobComment } from '../../types/admin.types';
import { formatDistanceToNow } from 'date-fns';
import ReasonPrompt from '../ReasonPrompt';
import ExportMenu, { type ExportFormat } from '../ExportMenu';
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  exportToDetailedPDF,
  type ExportColumn,
  type ExportRow,
  type ExportSection,
} from '../../../../utils/exportUtils';

// ---------- Skeleton primitives ----------
const SkeletonBlock: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style,
}) => (
  <div className={`animate-pulse rounded bg-gray-200 dark:bg-slate-700 ${className}`} style={style} />
);

const SkeletonTableRow: React.FC = () => (
  <tr>
    <td className="px-5 py-4">
      <div className="space-y-2">
        <SkeletonBlock className="h-3.5 w-48" />
        <SkeletonBlock className="h-2.5 w-64" />
      </div>
    </td>
    <td className="px-5 py-4">
      <div className="flex items-center gap-2">
        <SkeletonBlock className="rounded-full" style={{ width: 28, height: 28 }} />
        <SkeletonBlock className="h-3 w-24" />
      </div>
    </td>
    <td className="px-5 py-4"><SkeletonBlock className="h-5 w-20 rounded-full" /></td>
    <td className="px-5 py-4"><SkeletonBlock className="h-3 w-20" /></td>
    <td className="px-5 py-4">
      <div className="flex justify-end gap-2">
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
          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Job</th>
          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Posted</th>
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

const SkeletonCard: React.FC = () => (
  <div className="p-4 space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-3.5 w-3/4" />
        <SkeletonBlock className="h-2.5 w-full" />
        <SkeletonBlock className="h-2.5 w-2/3" />
      </div>
      <SkeletonBlock className="h-5 w-16 rounded-full" />
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SkeletonBlock className="rounded-full" style={{ width: 24, height: 24 }} />
        <SkeletonBlock className="h-3 w-20" />
      </div>
      <SkeletonBlock className="h-3 w-16" />
    </div>
  </div>
);

const SkeletonCardList: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
  <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-800/60">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
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

const Avatar: React.FC<{ name: string; src?: string; size?: number; className?: string }> = ({
  name, src, size = 32, className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?';

  const backgroundColor = AVATAR_COLORS[hashString(name || '?') % AVATAR_COLORS.length];

  if (!src || imgError) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full font-semibold text-white select-none shrink-0 ${className}`}
        style={{ width: size, height: size, fontSize: Math.round(size * 0.4), backgroundColor }}
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
      className={`rounded-full object-cover shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

// ---------- Local UI helpers ----------
const EmptyState: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 text-center">
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
  <div className="relative w-full sm:max-w-sm">
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

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 capitalize whitespace-nowrap">
    <span className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-slate-500" />
    {status.replace(/_/g, ' ')}
  </span>
);

// ---------- Drawer skeleton ----------
const SkeletonDrawer: React.FC = () => (
  <div className="space-y-5">
    <div className="space-y-2">
      <SkeletonBlock className="h-5 w-2/3" />
      <SkeletonBlock className="h-3 w-40" />
    </div>
    <div className="flex items-center gap-3">
      <SkeletonBlock className="rounded-full" style={{ width: 36, height: 36 }} />
      <div className="space-y-2">
        <SkeletonBlock className="h-3.5 w-32" />
        <SkeletonBlock className="h-2.5 w-24" />
      </div>
    </div>
    <div className="space-y-2">
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-5/6" />
      <SkeletonBlock className="h-3 w-2/3" />
    </div>
    <div className="flex flex-wrap gap-2">
      <SkeletonBlock className="rounded-lg w-24 h-24 sm:w-32 sm:h-32" />
      <SkeletonBlock className="rounded-lg w-24 h-24 sm:w-32 sm:h-32" />
    </div>
    <div className="space-y-3">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="h-16 w-full rounded-lg" />
      <SkeletonBlock className="h-16 w-full rounded-lg" />
    </div>
  </div>
);

// ---------- Comment row ----------
interface CommentRowProps {
  comment: JobComment;
  onDelete: (comment: JobComment) => void;
  depth?: number;
}

const CommentRow: React.FC<CommentRowProps> = ({ comment, onDelete, depth = 0 }) => (
  <div style={{ marginLeft: Math.min(depth * 16, 32) }} className="space-y-2">
    <div className="flex items-start gap-2 sm:gap-3 p-3 bg-gray-50 dark:bg-slate-950 rounded-lg group">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-slate-400 font-mono truncate">
          {comment.userId.slice(0, 8)}
        </p>
        <p className="text-sm text-gray-800 dark:text-slate-200 mt-1 whitespace-pre-wrap break-words">
          {comment.content}
        </p>
        <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">
          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
        </p>
      </div>
      <button
        onClick={() => onDelete(comment)}
        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0"
        title="Delete comment"
        aria-label="Delete comment"
      >
        <Trash2 size={14} />
      </button>
    </div>
    {comment.replies.map((r) => (
      <CommentRow key={r.id} comment={r} onDelete={onDelete} depth={depth + 1} />
    ))}
  </div>
);

// ---------- Comment thread → text ----------
const flattenCommentsToText = (
  comments: JobComment[],
  depth = 0,
): string => {
  if (!comments || comments.length === 0) return '';
  const indent = '  '.repeat(depth);
  return comments
    .map((c) => {
      const header = `${indent}• [${c.userId.slice(0, 8)}] ${new Date(
        c.createdAt,
      ).toLocaleString()}`;
      const body = c.content
        .split('\n')
        .map((line) => `${indent}  ${line}`)
        .join('\n');
      const replies = flattenCommentsToText(c.replies ?? [], depth + 1);
      return `${header}\n${body}${replies ? `\n${replies}` : ''}`;
    })
    .join('\n\n');
};

// ---------- Drawer ----------
interface DrawerProps {
  jobId: string | null;
  onClose: () => void;
  fetchOne: (id: string) => Promise<AdminJobDetail>;
  onDeleteComment: (jobId: string, comment: JobComment) => void;
  onDeleteJob: (job: AdminJob) => void;
}

const JobDrawer: React.FC<DrawerProps> = ({
  jobId, onClose, fetchOne, onDeleteComment, onDeleteJob,
}) => {
  const [detail, setDetail] = useState<AdminJobDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!jobId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchOne(jobId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load job');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [jobId, fetchOne]);

  useEffect(() => {
    if (!jobId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jobId, onClose]);

  const handleExportDetail = async () => {
    if (!detail || isExporting) return;
    setIsExporting(true);
    try {
      const dateStamp = new Date().toISOString().slice(0, 10);
      const shortId = detail.id.slice(0, 8);
      const filename = `job-${shortId}-${dateStamp}`;

      const commentsText = flattenCommentsToText(detail.commentsList);
      const imagesText =
        detail.images.length > 0
          ? detail.images.map((u, i) => `${i + 1}. ${u}`).join('\n')
          : '';

      const section: ExportSection = {
        heading: detail.title || 'Untitled job',
        subheading: `Job ID ${detail.id} · Posted ${new Date(
          detail.postedDate,
        ).toLocaleString()}`,
        fields: [
          { label: 'Job ID', value: detail.id },
          { label: 'Title', value: detail.title },
          { label: 'Status', value: detail.status.replace(/_/g, ' ') },
          { label: 'Posted by', value: detail.client.name },
          { label: 'Client ID', value: detail.client.id },
          {
            label: 'Posted',
            value: new Date(detail.postedDate).toLocaleString(),
          },
          {
            label: 'Last updated',
            value: detail.updatedAt
              ? new Date(detail.updatedAt).toLocaleString()
              : '—',
          },
          { label: 'Likes', value: detail.likes },
          { label: 'Comments', value: detail.comments },
          { label: 'Attachments', value: detail.images.length },
        ],
        paragraphs: [
          {
            label: 'Description',
            text: detail.description || '(No description)',
          },
          ...(imagesText
            ? [{ label: 'Image URLs', text: imagesText }]
            : []),
          {
            label: `Comments (${detail.commentsList.length})`,
            text: commentsText || '(No comments)',
          },
        ],
      };

      await exportToDetailedPDF(filename, [section], {
        title: 'Job Posting — Full Record',
        subtitle: `Generated ${new Date().toLocaleString()}`,
      });

      toast.success('Job record downloaded');
    } catch (e) {
      console.error('Export failed:', e);
      toast.error('Failed to export job record');
    } finally {
      setIsExporting(false);
    }
  };

  if (!jobId) return null;

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
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-xl lg:max-w-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 dark:border-slate-800/60">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100 truncate">Job details</h3>
            {detail && (
              <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{detail.title}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleExportDetail}
              disabled={!detail || isExporting}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Download full record (PDF)"
              aria-label="Download full record"
            >
              {isExporting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading && <SkeletonDrawer />}

          {error && !loading && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {detail && !loading && !error && (
            <div className="space-y-5">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h4 className="font-semibold text-gray-900 dark:text-slate-100 text-base sm:text-lg break-words">
                    {detail.title}
                  </h4>
                  <StatusBadge status={detail.status} />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Posted {formatDistanceToNow(new Date(detail.postedDate), { addSuffix: true })}
                  {' · '}
                  Updated {formatDistanceToNow(new Date(detail.updatedAt), { addSuffix: true })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Avatar name={detail.client.name} src={detail.client.avatar} size={40} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{detail.client.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Client · <span className="font-mono">{detail.client.id.slice(0, 8)}</span>
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Description
                </p>
                <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                  {detail.description}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Heart size={13} /> {detail.likes}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle size={13} /> {detail.comments}
                </span>
              </div>

              {detail.images.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Images
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {detail.images.map((img, i) => (
                      <a
                        key={i}
                        href={img}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative aspect-square rounded-lg overflow-hidden border border-gray-100 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-950"
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <ExternalLink size={16} />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Comments ({detail.commentsList.length})
                </p>
                {detail.commentsList.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-slate-500 italic">No comments yet.</p>
                ) : (
                  <div className="space-y-2">
                    {detail.commentsList.map((c) => (
                      <CommentRow
                        key={c.id}
                        comment={c}
                        onDelete={(comment) => onDeleteComment(detail.id, comment)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {detail && !loading && !error && (
          <div className="border-t border-gray-100 dark:border-slate-800/60 px-4 sm:px-5 py-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-between gap-2">
            <button
              onClick={handleExportDetail}
              disabled={isExporting}
              className="justify-center px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/60 text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-60"
            >
              {isExporting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              Download record
            </button>
            <button
              onClick={() => onDeleteJob(detail)}
              className="justify-center px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 text-sm font-medium inline-flex items-center gap-1.5"
            >
              <Trash2 size={14} /> Remove job
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ---------- Mobile job card ----------
interface JobCardProps {
  job: AdminJob;
  onOpen: () => void;
  onRemove: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onOpen, onRemove }) => (
  <div
    onClick={onOpen}
    className="p-4 hover:bg-gray-50/70 active:bg-gray-100 dark:hover:bg-slate-800/50 dark:active:bg-slate-800 transition-colors cursor-pointer"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900 dark:text-slate-100 truncate">{job.title}</p>
        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mt-0.5">{job.description}</p>
      </div>
      <StatusBadge status={job.status} />
    </div>

    <div className="flex items-center justify-between mt-3 gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <Avatar name={job.client.name} src={job.client.avatar} size={24} />
        <span className="text-xs text-gray-600 dark:text-slate-400 truncate">{job.client.name}</span>
      </div>
      <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
        {formatDistanceToNow(new Date(job.postedDate), { addSuffix: true })}
      </span>
    </div>

    <div
      className="flex items-center justify-end gap-2 mt-3"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onOpen}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700"
      >
        <Eye size={14} /> View
      </button>
      <button
        onClick={onRemove}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60"
      >
        <Trash2 size={14} /> Remove
      </button>
    </div>
  </div>
);

// ---------- Export configuration ----------
const EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'title', header: 'Title', width: 34 },
  { key: 'client', header: 'Client', width: 24 },
  { key: 'clientId', header: 'Client ID', width: 38 },
  { key: 'status', header: 'Status', width: 16 },
  { key: 'posted', header: 'Posted', width: 22 },
  { key: 'updated', header: 'Updated', width: 22 },
  { key: 'likes', header: 'Likes', width: 10, align: 'right' },
  { key: 'comments', header: 'Comments', width: 12, align: 'right' },
  { key: 'images', header: 'Images', width: 10, align: 'right' },
  { key: 'description', header: 'Description', width: 60 },
];

const PDF_COLUMNS: ExportColumn[] = [
  { key: 'title', header: 'Title', width: 40, maxChars: 45 },
  { key: 'client', header: 'Client', width: 22, maxChars: 24 },
  { key: 'status', header: 'Status', width: 14 },
  { key: 'posted', header: 'Posted', width: 22 },
  { key: 'likes', header: 'Likes', width: 8, align: 'right' },
  { key: 'comments', header: 'Comments', width: 11, align: 'right' },
  { key: 'images', header: 'Images', width: 9, align: 'right' },
];

const buildTableRows = (jobs: AdminJob[]): ExportRow[] =>
  jobs.map((j) => ({
    title: j.title,
    client: j.client.name,
    clientId: j.client.id,
    status: j.status.replace(/_/g, ' '),
    posted: j.postedDate ? new Date(j.postedDate).toLocaleString() : '',
    updated: j.updatedAt ? new Date(j.updatedAt).toLocaleString() : '',
    likes: j.likes,
    comments: j.comments,
    images: j.images.length,
    description: j.description,
  }));

// ---------- Tab ----------
type Prompt = {
  title: string;
  description?: string;
  submitLabel: string;
  onConfirm: (reason: string) => Promise<void>;
};

const JobsTab: React.FC = () => {
  const { jobs, loading, error, fetchOne, remove, removeComment } = useJobs();
  const [query, setQuery] = useState('');
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const filtered = useMemo(
    () =>
      jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(query.toLowerCase()) ||
          j.description.toLowerCase().includes(query.toLowerCase()),
      ),
    [jobs, query],
  );

  const handleExport = async (format: ExportFormat) => {
    if (isExporting) return;
    if (filtered.length === 0) {
      toast.info('Nothing to export for the current filters');
      return;
    }

    const dateStamp = new Date().toISOString().slice(0, 10);
    const baseName = `jobs-${dateStamp}`;
    const subtitleParts = [
      `Generated: ${new Date().toLocaleString()}`,
      `${filtered.length} job${filtered.length === 1 ? '' : 's'}`,
    ];
    if (query.trim()) subtitleParts.push(`Search: "${query.trim()}"`);

    setIsExporting(true);
    try {
      if (format === 'csv') {
        await exportToCSV(baseName, EXPORT_COLUMNS, buildTableRows(filtered));
      } else if (format === 'excel') {
        await exportToExcel(
          baseName,
          EXPORT_COLUMNS,
          buildTableRows(filtered),
          'Jobs',
        );
      } else {
        await exportToPDF(baseName, PDF_COLUMNS, buildTableRows(filtered), {
          title: 'Jobs',
          subtitle: subtitleParts.join('  ·  '),
          orientation: 'landscape',
        });
      }
      toast.success(`${format.toUpperCase()} downloaded`);
    } catch (e) {
      console.error('Export failed:', e);
      toast.error(`Failed to export ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  const openRemoveJob = (job: AdminJob) => {
    setPrompt({
      title: 'Remove job',
      description: job.title,
      submitLabel: 'Remove',
      onConfirm: async (reason) => {
        await remove(job.id, reason);
        toast.success('Job removed');
        if (detailId === job.id) setDetailId(null);
      },
    });
  };

  const openRemoveComment = (jobId: string, comment: JobComment) => {
    setPrompt({
      title: 'Delete comment',
      description: comment.content.slice(0, 80),
      submitLabel: 'Delete',
      onConfirm: async (reason) => {
        await removeComment(jobId, comment.id, reason);
        toast.success('Comment deleted');
      },
    });
  };

  if (error) return <EmptyState title="Failed to load jobs" description={error} />;

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">Jobs</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 mt-1">
            Monitor all jobs posted across the platform
          </p>
        </div>
        <ExportMenu onExport={handleExport} disabled={isExporting || loading} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-5">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by title or description..."
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <>
            <SkeletonCardList rows={5} />
            <div className="hidden md:block">
              <SkeletonTable rows={6} />
            </div>
          </>
        ) : filtered.length === 0 ? (
          <EmptyState title="No jobs found" description="Try adjusting your filters." />
        ) : (
          <>
            <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-800/60">
              {filtered.map((j: AdminJob) => (
                <JobCard
                  key={j.id}
                  job={j}
                  onOpen={() => setDetailId(j.id)}
                  onRemove={() => openRemoveJob(j)}
                />
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800/60">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Job</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Posted</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                  {filtered.map((j: AdminJob) => (
                    <tr
                      key={j.id}
                      onClick={() => setDetailId(j.id)}
                      className="hover:bg-gray-50/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4 max-w-xs lg:max-w-md">
                        <p className="font-medium text-gray-900 dark:text-slate-100 truncate">{j.title}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1">{j.description}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar name={j.client.name} src={j.client.avatar} size={28} />
                          <span className="text-sm truncate text-gray-700 dark:text-slate-300">{j.client.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={j.status} /></td>
                      <td className="px-5 py-4 text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(j.postedDate), { addSuffix: true })}
                      </td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailId(j.id)}
                            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                            title="Details"
                            aria-label="View details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openRemoveJob(j)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                            title="Remove"
                            aria-label="Remove job"
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