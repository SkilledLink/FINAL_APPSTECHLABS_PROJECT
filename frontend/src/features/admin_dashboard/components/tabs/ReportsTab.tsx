// src/features/admin/components/tabs/ReportsTab.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Ban,
  Briefcase,
  CheckCircle,
  ChevronRight,
  Eye,
  Filter,
  Flag,
  Gavel,
  Inbox,
  Loader2,
  MessageSquareWarning,
  Rss,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  UserX,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { useReports } from '../../hooks/useReports';
import type {
  AdminReport,
  ReportAction,
  ReportReason,
  ReportReviewPayload,
  ReportStatus,
  ReportTargetType,
} from '../../types/admin.types';

/* ───────────────────────── Metadata ───────────────────────── */

const STATUS_META: Record<
  ReportStatus,
  { label: string; tone: string; dot: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Pending',
    tone:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60',
    dot: 'bg-amber-500',
    icon: <AlertTriangle size={12} />,
  },
  reviewing: {
    label: 'Reviewing',
    tone:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60',
    dot: 'bg-blue-500',
    icon: <Eye size={12} />,
  },
  resolved: {
    label: 'Resolved',
    tone:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60',
    dot: 'bg-emerald-500',
    icon: <CheckCircle size={12} />,
  },
  dismissed: {
    label: 'Dismissed',
    tone:
      'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-gray-400 dark:bg-slate-500',
    icon: <XCircle size={12} />,
  },
};

const REASON_META: Record<ReportReason, { label: string; tone: string }> = {
  spam: {
    label: 'Spam',
    tone:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
  harassment: {
    label: 'Harassment',
    tone:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60',
  },
  fraud: {
    label: 'Fraud',
    tone:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60',
  },
  inappropriate_content: {
    label: 'Inappropriate',
    tone:
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/60',
  },
  fake_account: {
    label: 'Fake account',
    tone:
      'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900/60',
  },
  scam: {
    label: 'Scam',
    tone:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60',
  },
  impersonation: {
    label: 'Impersonation',
    tone:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/60',
  },
  other: {
    label: 'Other',
    tone:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
};

const TARGET_META: Record<
  ReportTargetType,
  { label: string; icon: React.ReactNode; tone: string }
> = {
  user: {
    label: 'User',
    icon: <Users size={11} />,
    tone:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60',
  },
  professional: {
    label: 'Professional',
    icon: <ShieldCheck size={11} />,
    tone:
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/60',
  },
  job: {
    label: 'Job',
    icon: <Briefcase size={11} />,
    tone:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60',
  },
  feed: {
    label: 'Feed',
    icon: <Rss size={11} />,
    tone:
      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-900/60',
  },
};

const ACTION_META: Record<
  ReportAction,
  { label: string; icon: React.ReactNode; tone: string }
> = {
  none: {
    label: 'No action',
    icon: <Shield size={13} />,
    tone:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  },
  warned: {
    label: 'Warning issued',
    icon: <MessageSquareWarning size={13} />,
    tone:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60',
  },
  content_removed: {
    label: 'Content removed',
    icon: <XCircle size={13} />,
    tone:
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/60',
  },
  user_suspended: {
    label: 'User suspended',
    icon: <UserX size={13} />,
    tone:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60',
  },
  user_banned: {
    label: 'User banned',
    icon: <Ban size={13} />,
    tone:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60',
  },
};

const shortId = (id?: string) => (id ? id.slice(0, 8) : '—');

/* ───────────────────────── Skeletons ───────────────────────── */

const SkeletonBlock: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className = '', style }) => (
  <div
    className={`animate-pulse rounded bg-gray-200 dark:bg-slate-700 ${className}`}
    style={style}
  />
);

const SkeletonRow: React.FC = () => (
  <tr>
    <td className="px-5 py-4">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="rounded-full" style={{ width: 32, height: 32 }} />
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-2.5 w-20" />
        </div>
      </div>
    </td>
    <td className="px-5 py-4">
      <SkeletonBlock className="h-5 w-24 rounded-full" />
    </td>
    <td className="px-5 py-4">
      <SkeletonBlock className="h-5 w-20 rounded-full" />
    </td>
    <td className="px-5 py-4">
      <SkeletonBlock className="h-5 w-24 rounded-full" />
    </td>
    <td className="px-5 py-4">
      <SkeletonBlock className="h-3 w-20" />
    </td>
    <td className="px-5 py-4">
      <SkeletonBlock className="ml-auto h-8 w-8 rounded-lg" />
    </td>
  </tr>
);

const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800/60">
          {['Reporter', 'Target', 'Reason', 'Status', 'Reported', ''].map((h, i) => (
            <th
              key={i}
              className={`px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider ${
                i === 5 ? 'text-right' : 'text-left'
              }`}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </tbody>
    </table>
  </div>
);

const SkeletonCard: React.FC = () => (
  <div className="p-4 space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="rounded-full" style={{ width: 36, height: 36 }} />
        <div className="space-y-2">
          <SkeletonBlock className="h-3.5 w-28" />
          <SkeletonBlock className="h-2.5 w-24" />
        </div>
      </div>
      <SkeletonBlock className="h-5 w-16 rounded-full" />
    </div>
    <div className="flex flex-wrap gap-2">
      <SkeletonBlock className="h-5 w-20 rounded-full" />
      <SkeletonBlock className="h-5 w-24 rounded-full" />
    </div>
    <SkeletonBlock className="h-3 w-2/3" />
  </div>
);

const SkeletonCardList: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-800/60">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

/* ───────────────────────── Local UI ───────────────────────── */

const EmptyState: React.FC<{ title: string; description?: string }> = ({
  title,
  description,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl text-gray-400 dark:text-slate-500 mb-4">
      <Inbox size={28} />
    </div>
    <p className="font-semibold text-gray-900 dark:text-slate-100">{title}</p>
    {description && (
      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-sm">
        {description}
      </p>
    )}
  </div>
);

const SearchInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="relative w-full sm:max-w-sm">
    <Search
      size={16}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:focus:bg-slate-900"
    />
  </div>
);

/* ───────────────────────── Badges ───────────────────────── */

const StatusBadge: React.FC<{ status: ReportStatus }> = ({ status }) => {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${meta.tone}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

const ReasonBadge: React.FC<{ reason: ReportReason }> = ({ reason }) => {
  const meta = REASON_META[reason];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${meta.tone}`}
    >
      {meta.label}
    </span>
  );
};

const TargetBadge: React.FC<{ target: ReportTargetType; id: string }> = ({
  target,
  id,
}) => {
  const meta = TARGET_META[target];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${meta.tone}`}
    >
      {meta.icon}
      {meta.label}
      <span className="ml-0.5 font-mono text-[10px] opacity-70">
        {shortId(id)}
      </span>
    </span>
  );
};

/* ───────────────────────── Stats Row ───────────────────────── */

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  accent: string;
  hint?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  gradient,
  accent,
  hint,
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-5">
    <div
      className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${gradient} opacity-50 blur-2xl transition-opacity duration-300 group-hover:opacity-80`}
    />
    <div
      className={`absolute inset-x-0 top-0 h-[3px] ${accent} opacity-70 transition-opacity group-hover:opacity-100`}
    />
    <div className="relative flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-1.5 text-2xl font-bold tabular-nums text-gray-900 dark:text-slate-100">
          {value.toLocaleString()}
        </p>
        {hint && (
          <p className="mt-0.5 text-[11px] text-gray-400 dark:text-slate-500">
            {hint}
          </p>
        )}
      </div>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent} text-white shadow-sm`}
      >
        {icon}
      </div>
    </div>
  </div>
);

/* ───────────────────────── Review Drawer ───────────────────────── */

interface DrawerProps {
  report: AdminReport | null;
  onClose: () => void;
  onReview: (id: string, payload: ReportReviewPayload) => Promise<void>;
}

const ReviewDrawer: React.FC<DrawerProps> = ({ report, onClose, onReview }) => {
  const [status, setStatus] = useState<Exclude<ReportStatus, 'pending'>>(
    'reviewing',
  );
  const [action, setAction] = useState<ReportAction>('none');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!report) return;
    if (report.status === 'pending') {
      setStatus('reviewing');
      setAction('none');
      setNotes('');
    } else {
      setStatus(report.status as Exclude<ReportStatus, 'pending'>);
      setAction(report.actionTaken);
      setNotes(report.reviewNotes ?? '');
    }
  }, [report]);

  useEffect(() => {
    if (!report) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [report]);

  useEffect(() => {
    if (!report) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [report, submitting, onClose]);

  if (!report) return null;

  const meta = STATUS_META[report.status];
  const reason = REASON_META[report.reason];
  const target = TARGET_META[report.targetType];
  const isReviewed =
    report.status === 'resolved' || report.status === 'dismissed';

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onReview(report.id, {
        status,
        action_taken: action,
        review_notes: notes.trim() || undefined,
      });
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to review report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={!submitting ? onClose : undefined}
        aria-hidden="true"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        role="dialog"
        aria-modal="true"
        className="fixed right-0 top-0 bottom-0 z-50 flex w-full flex-col bg-white shadow-2xl dark:bg-slate-900 sm:max-w-xl lg:max-w-2xl"
      >
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-slate-800/60">
          <div className={`pointer-events-none absolute inset-x-0 top-0 h-[3px] ${meta.dot}`} />
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-sm shadow-blue-500/30">
              <Flag size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-gray-900 dark:text-slate-100">
                Report details
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Reported{' '}
                {formatDistanceToNow(new Date(report.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-5 p-5">
            {/* Target + status banner */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/60 p-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950/60">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${target.tone}`}
                  >
                    {target.icon}
                    {target.label}
                  </span>
                  <span className="font-mono text-xs text-gray-500 dark:text-slate-400">
                    {report.targetId}
                  </span>
                </div>
                <StatusBadge status={report.status} />
              </div>
            </div>

            {/* Reason + description */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Reason
              </p>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${reason.tone}`}
              >
                {reason.label}
              </span>
              {report.description && (
                <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50/80 p-3 text-sm leading-relaxed text-gray-700 dark:border-slate-800/60 dark:bg-slate-950/40 dark:text-slate-300">
                  <p className="whitespace-pre-wrap break-words">
                    {report.description}
                  </p>
                </div>
              )}
            </div>

            {/* Reporter */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Reported by
              </p>
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3 dark:border-slate-800/60 dark:bg-slate-950/40">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-bold text-white shadow-sm">
                  {report.reporterId.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    Reporter
                  </p>
                  <p className="truncate font-mono text-xs text-gray-500 dark:text-slate-400">
                    {report.reporterId}
                  </p>
                </div>
              </div>
            </div>

            {/* Existing review info */}
            {isReviewed && report.reviewedAt && (
              <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="flex items-center gap-2">
                  <Gavel
                    size={14}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Previous review
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Action taken
                    </p>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${ACTION_META[report.actionTaken].tone}`}
                      >
                        {ACTION_META[report.actionTaken].icon}
                        {ACTION_META[report.actionTaken].label}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Reviewed
                    </p>
                    <p className="text-gray-900 dark:text-slate-100">
                      {formatDistanceToNow(new Date(report.reviewedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                {report.reviewNotes && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Notes
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-gray-700 dark:text-slate-300">
                      {report.reviewNotes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Review form */}
            <div className="space-y-4 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-blue-500" />
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  {isReviewed ? 'Update decision' : 'Take action'}
                </p>
              </div>

              {/* Status selector */}
              <div>
                <p className="mb-2 text-xs font-medium text-gray-700 dark:text-slate-300">
                  Decision
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(['reviewing', 'resolved', 'dismissed'] as const).map((s) => {
                    const m = STATUS_META[s];
                    const active = status === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        disabled={submitting}
                        className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-semibold transition-all disabled:opacity-60 ${
                          active
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-400'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${m.dot}`} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action selector */}
              <div>
                <p className="mb-2 text-xs font-medium text-gray-700 dark:text-slate-300">
                  Action taken against target
                </p>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {(Object.keys(ACTION_META) as ReportAction[]).map((a) => {
                    const m = ACTION_META[a];
                    const active = action === a;
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAction(a)}
                        disabled={submitting}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all disabled:opacity-60 ${
                          active
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-400'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <span className={active ? '' : 'text-gray-400'}>
                          {m.icon}
                        </span>
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="report-review-notes"
                  className="mb-2 block text-xs font-medium text-gray-700 dark:text-slate-300"
                >
                  Review notes
                  <span className="ml-1 text-gray-400 dark:text-slate-500">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="report-review-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={submitting}
                  rows={3}
                  placeholder="Context for the decision, follow-up steps…"
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/60 px-5 py-3 dark:border-slate-800/60 dark:bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ShieldCheck size={14} />
            )}
            {submitting
              ? 'Saving…'
              : isReviewed
                ? 'Update review'
                : 'Submit review'}
          </button>
        </div>
      </motion.div>
    </>
  );
};

/* ───────────────────────── Mobile Card ───────────────────────── */

interface ReportCardProps {
  report: AdminReport;
  onOpen: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onOpen }) => (
  <button
    onClick={onOpen}
    className="group flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-gray-50/70 active:bg-gray-100 dark:hover:bg-slate-800/50 dark:active:bg-slate-800"
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-sm">
      <Flag size={16} />
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-slate-100">
            {REASON_META[report.reason].label}
          </p>
          <p className="truncate font-mono text-[11px] text-gray-500 dark:text-slate-400">
            {TARGET_META[report.targetType].label} · {shortId(report.targetId)}
          </p>
        </div>
        <StatusBadge status={report.status} />
      </div>
      {report.description && (
        <p className="mt-2 line-clamp-2 text-xs text-gray-600 dark:text-slate-400">
          {report.description}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-gray-400 dark:text-slate-500">
        <span className="truncate font-mono">
          by {shortId(report.reporterId)}
        </span>
        <span className="whitespace-nowrap">
          {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
    <ChevronRight
      size={16}
      className="mt-3 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500 dark:text-slate-600 dark:group-hover:text-slate-400"
    />
  </button>
);

/* ───────────────────────── Filter Bar ───────────────────────── */

type StatusFilter = 'all' | ReportStatus;
type TargetFilter = 'all' | ReportTargetType;

interface FilterBarProps {
  status: StatusFilter;
  setStatus: (s: StatusFilter) => void;
  target: TargetFilter;
  setTarget: (t: TargetFilter) => void;
  counts: Record<ReportStatus, number>;
  disabled?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  status,
  setStatus,
  target,
  setTarget,
  counts,
  disabled,
}) => {
  const statuses: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'reviewing', label: 'Reviewing' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'dismissed', label: 'Dismissed' },
  ];

  const total =
    counts.pending + counts.reviewing + counts.resolved + counts.dismissed;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-1.5">
        {statuses.map((s) => {
          const active = status === s.key;
          const count = s.key === 'all' ? total : counts[s.key as ReportStatus];
          return (
            <button
              key={s.key}
              onClick={() => setStatus(s.key)}
              disabled={disabled}
              className={`group inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all disabled:opacity-60 ${
                active
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-900/60'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800/60'
              }`}
            >
              {s.label}
              <span
                className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums ${
                  active
                    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Filter size={14} className="text-gray-400 dark:text-slate-500" />
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value as TargetFilter)}
          disabled={disabled}
          className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none transition-all hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:focus:bg-slate-900"
        >
          <option value="all">All targets</option>
          <option value="user">Users</option>
          <option value="professional">Professionals</option>
          <option value="job">Jobs</option>
          <option value="feed">Feeds</option>
        </select>
      </div>
    </div>
  );
};

/* ───────────────────────── Main Tab ───────────────────────── */

const ReportsTab: React.FC = () => {
  const { reports, loading, error, review } = useReports();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [targetFilter, setTargetFilter] = useState<TargetFilter>('all');
  const [selected, setSelected] = useState<AdminReport | null>(null);

  const counts = useMemo(
    () => ({
      pending: reports.filter((r) => r.status === 'pending').length,
      reviewing: reports.filter((r) => r.status === 'reviewing').length,
      resolved: reports.filter((r) => r.status === 'resolved').length,
      dismissed: reports.filter((r) => r.status === 'dismissed').length,
    }),
    [reports],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (targetFilter !== 'all' && r.targetType !== targetFilter) return false;
      if (!q) return true;
      return (
        (r.description ?? '').toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        r.targetId.toLowerCase().includes(q) ||
        r.reporterId.toLowerCase().includes(q)
      );
    });
  }, [reports, statusFilter, targetFilter, query]);

  if (error) {
    return <EmptyState title="Failed to load reports" description={error} />;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/25">
            <Flag size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 sm:text-2xl">
              Reports
            </h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400 sm:text-base">
              Review user-submitted reports and take action
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Pending"
          value={counts.pending}
          icon={<AlertTriangle size={16} />}
          gradient="bg-amber-400/30"
          accent="bg-gradient-to-r from-amber-500 to-orange-500"
          hint="Awaiting first review"
        />
        <StatCard
          label="Reviewing"
          value={counts.reviewing}
          icon={<Eye size={16} />}
          gradient="bg-blue-400/30"
          accent="bg-gradient-to-r from-blue-500 to-indigo-500"
          hint="In progress"
        />
        <StatCard
          label="Resolved"
          value={counts.resolved}
          icon={<CheckCircle size={16} />}
          gradient="bg-emerald-400/30"
          accent="bg-gradient-to-r from-emerald-500 to-teal-500"
          hint="Action taken"
        />
        <StatCard
          label="Dismissed"
          value={counts.dismissed}
          icon={<XCircle size={16} />}
          gradient="bg-slate-400/30"
          accent="bg-gradient-to-r from-slate-500 to-slate-600"
          hint="No violation found"
        />
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by description, reason, or ID…"
        />
      </div>

      {/* Filters */}
      <div className="mb-5">
        <FilterBar
          status={statusFilter}
          setStatus={setStatusFilter}
          target={targetFilter}
          setTarget={setTargetFilter}
          counts={counts}
          disabled={loading}
        />
      </div>

      {/* Content */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <>
            <SkeletonCardList rows={4} />
            <div className="hidden md:block">
              <SkeletonTable rows={6} />
            </div>
          </>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={
              reports.length === 0
                ? 'No reports yet'
                : 'No reports match your filters'
            }
            description={
              reports.length === 0
                ? 'Reports submitted by users will appear here.'
                : 'Try adjusting your search or filters.'
            }
          />
        ) : (
          <>
            {/* Mobile */}
            <div className="divide-y divide-gray-100 dark:divide-slate-800/60 md:hidden">
              {filtered.map((r) => (
                <ReportCard key={r.id} report={r} onOpen={() => setSelected(r)} />
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 dark:border-slate-800/60 dark:bg-slate-950">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                      Reporter
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                      Target
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                      Reason
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                      Reported
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                  <AnimatePresence initial={false}>
                    {filtered.map((r) => (
                      <motion.tr
                        key={r.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setSelected(r)}
                        className="group cursor-pointer transition-colors hover:bg-gray-50/70 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-[10px] font-bold text-white shadow-sm">
                              {r.reporterId.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                Reporter
                              </p>
                              <p className="truncate font-mono text-[11px] text-gray-500 dark:text-slate-400">
                                {shortId(r.reporterId)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <TargetBadge target={r.targetType} id={r.targetId} />
                        </td>
                        <td className="px-5 py-4">
                          <ReasonBadge reason={r.reason} />
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-5 py-4 text-xs whitespace-nowrap text-gray-500 dark:text-slate-400">
                          {formatDistanceToNow(new Date(r.createdAt), {
                            addSuffix: true,
                          })}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(r);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            title="Review"
                            aria-label="Review report"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {selected && (
          <ReviewDrawer
            report={selected}
            onClose={() => setSelected(null)}
            onReview={async (id, payload) => {
              await review(id, payload);
              toast.success('Report reviewed');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportsTab;