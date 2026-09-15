import React, { useEffect, useMemo, useState } from 'react';
import {
  Ban, CheckCircle, Star, XCircle, Flag, Inbox, Search, Eye, X,
  ExternalLink, Shield, Gauge, Trash2, AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useProfessionals } from '../../hooks/useProfessionals';
import type { AdminProfessional, AdminProfessionalDetail } from '../../types/admin.types';
import { formatDistanceToNow } from 'date-fns';
import ReasonPrompt from '../ReasonPrompt';

// ---------- Skeleton primitives ----------
const SkeletonBlock: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style,
}) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} style={style} />
);

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
    <td className="px-5 py-4"><SkeletonBlock className="h-3 w-12" /></td>
    <td className="px-5 py-4"><SkeletonBlock className="h-3 w-10" /></td>
    <td className="px-5 py-4"><SkeletonBlock className="h-3 w-10" /></td>
    <td className="px-5 py-4"><SkeletonBlock className="h-5 w-20 rounded-full" /></td>
    <td className="px-5 py-4"><SkeletonBlock className="h-5 w-24 rounded-full" /></td>
    <td className="px-5 py-4">
      <div className="flex justify-end gap-1">
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
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} />
        ))}
      </tbody>
    </table>
  </div>
);

const SkeletonDrawer: React.FC = () => (
  <div className="space-y-5">
    <div className="flex items-center gap-4">
      <SkeletonBlock className="rounded-full" style={{ width: 64, height: 64 }} />
      <div className="space-y-2 flex-1">
        <SkeletonBlock className="h-4 w-40" />
        <SkeletonBlock className="h-3 w-56" />
        <SkeletonBlock className="h-4 w-24 rounded-full" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <SkeletonBlock className="h-2.5 w-16" />
          <SkeletonBlock className="h-3.5 w-24" />
        </div>
      ))}
    </div>
    <div className="space-y-2">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="h-20 w-full rounded-lg" />
    </div>
    <div className="space-y-2">
      <SkeletonBlock className="h-3 w-24" />
      <div className="flex gap-2">
        <SkeletonBlock className="h-7 w-24 rounded-lg" />
        <SkeletonBlock className="h-7 w-28 rounded-lg" />
      </div>
    </div>
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
  name, src, size = 36, className = '',
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
        className={`inline-flex items-center justify-center rounded-full font-semibold text-white select-none ${className}`}
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
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

// ---------- Local UI ----------
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

// ---------- Trust score prompt ----------
interface TrustScorePromptProps {
  currentScore: number;
  professionalName: string;
  onSubmit: (score: number, reason: string) => Promise<void>;
  onCancel: () => void;
}

const TrustScorePrompt: React.FC<TrustScorePromptProps> = ({
  currentScore, professionalName, onSubmit, onCancel,
}) => {
  const [score, setScore] = useState(String(currentScore));
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    const n = Number(score);
    if (!Number.isInteger(n) || n < 0 || n > 100) {
      setError('Score must be an integer between 0 and 100.');
      return;
    }
    if (reason.trim().length < 5) {
      setError('Reason must be at least 5 characters.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(n, reason.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Change trust score</h3>
            <p className="text-sm text-gray-500 mt-1">{professionalName}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          New score (0–100) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min={0}
          max={100}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
        />

        <label className="block text-sm font-medium text-gray-700 mt-3 mb-1">
          Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Enter a reason (min 5 characters)..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
        />

        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={submitting}
            className="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Update score'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Drawer ----------
interface DrawerProps {
  professionalId: string | null;
  onClose: () => void;
  fetchOne: (id: string) => Promise<AdminProfessionalDetail>;
  onVerify: (p: AdminProfessional, status: 'manual_approved' | 'manual_rejected') => void;
  onSuspend: (p: AdminProfessional) => void;
  onReactivate: (p: AdminProfessional) => void;
  onFlag: (p: AdminProfessional) => void;
  onUnflag: (p: AdminProfessional) => void;
  onTrustScore: (id: string, currentScore: number, name: string) => void;
  onDelete: (id: string, name: string) => void;
}

const ProfessionalDrawer: React.FC<DrawerProps> = ({
  professionalId, onClose, fetchOne,
  onVerify, onSuspend, onReactivate, onFlag, onUnflag, onTrustScore, onDelete,
}) => {
  const [detail, setDetail] = useState<AdminProfessionalDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!professionalId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchOne(professionalId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load professional');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [professionalId, fetchOne]);

  if (!professionalId) return null;

  const isDeleted = detail?.status === 'deleted';
  const canVerify =
    detail &&
    ['pending', 'manual_review', 'not_started'].includes(detail.verificationStatus) &&
    !isDeleted;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">Professional details</h3>
            {detail && (
              <p className="text-xs text-gray-500 truncate">{detail.profession}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && <SkeletonDrawer />}

          {error && !loading && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {detail && !loading && !error && (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center gap-4">
                <Avatar name={detail.name} src={detail.avatar} size={64} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 truncate">{detail.name}</p>
                    {detail.isFlagged && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-red-50 text-red-700 border-red-200">
                        <Flag size={10} /> Flagged
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{detail.profession}</p>
                  {detail.headline && (
                    <p className="text-xs text-gray-400 mt-0.5">{detail.headline}</p>
                  )}
                </div>
              </div>

              {/* Status row */}
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={detail.status} />
                <VerificationBadge status={detail.verificationStatus} verified={detail.isVerified} />
                {detail.available ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400" /> Unavailable
                  </span>
                )}
              </div>

              {/* Key info grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Rating</p>
                  <p className="text-gray-900 inline-flex items-center gap-1">
                    <Star size={13} className="text-yellow-400 fill-yellow-400" />
                    {detail.rating.toFixed(1)}
                    <span className="text-xs text-gray-400">({detail.totalReviews})</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Completed jobs</p>
                  <p className="text-gray-900">{detail.totalJobs}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Trust score</p>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900">{detail.trustScore}</p>
                    <button
                      onClick={() => onTrustScore(detail.id, detail.trustScore, detail.name)}
                      className="text-[10px] text-blue-600 hover:underline"
                    >
                      change
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-gray-900">{detail.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Years of experience</p>
                  <p className="text-gray-900">{detail.yearsOfExperience ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Experience level</p>
                  <p className="text-gray-900 capitalize">{detail.experienceLevel ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Hourly rate</p>
                  <p className="text-gray-900">
                    {detail.hourlyRate != null
                      ? `${detail.hourlyRate.toLocaleString()} ${detail.currency}`
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Response time</p>
                  <p className="text-gray-900">
                    {detail.responseTimeHours != null
                      ? `${detail.responseTimeHours}h`
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Joined</p>
                  <p className="text-gray-900">
                    {new Date(detail.joinedDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Verified at</p>
                  <p className="text-gray-900">
                    {detail.verifiedAt
                      ? new Date(detail.verifiedAt).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
              </div>

              {/* Bio */}
              {detail.bio && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Bio
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.bio}</p>
                </div>
              )}

              {/* Skills / Services / Languages */}
              {detail.skills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.skills.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {detail.services.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Services
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.services.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {detail.languages.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Languages
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.languages.map((l, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {(detail.websiteUrl || detail.linkedinUrl || detail.portfolioUrl) && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Links
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {detail.websiteUrl && (
                      <a href={detail.websiteUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <ExternalLink size={11} /> Website
                      </a>
                    )}
                    {detail.linkedinUrl && (
                      <a href={detail.linkedinUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <ExternalLink size={11} /> LinkedIn
                      </a>
                    )}
                    {detail.portfolioUrl && (
                      <a href={detail.portfolioUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <ExternalLink size={11} /> Portfolio
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Verification & flag info */}
              {(detail.adminOverrideStatus || detail.fraudNotes) && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Admin overrides
                  </p>
                  <div className="space-y-2 text-sm">
                    {detail.adminOverrideStatus && (
                      <div className="flex items-start gap-2">
                        <Shield size={14} className="text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Override status</p>
                          <p className="text-gray-900 capitalize">
                            {detail.adminOverrideStatus.replace(/_/g, ' ')}
                          </p>
                          {detail.adminOverrideReason && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Reason: {detail.adminOverrideReason}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {detail.fraudNotes && (
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Fraud notes</p>
                          <p className="text-gray-700 text-sm whitespace-pre-wrap">
                            {detail.fraudNotes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Deletion info */}
              {isDeleted && (
                <div className="pt-4 border-t border-gray-100 bg-red-50/40 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-2">
                    Deletion
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="text-gray-900 capitalize">{detail.deletionType ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Deleted at</p>
                      <p className="text-gray-900">
                        {detail.deletedAt
                          ? new Date(detail.deletedAt).toLocaleDateString()
                          : '—'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Reason</p>
                      <p className="text-gray-900">{detail.deletionReason ?? '—'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Actions
                </p>
                <div className="flex flex-wrap gap-2">
                  {canVerify && (
                    <>
                      <button
                        onClick={() => onVerify(detail, 'manual_approved')}
                        className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium inline-flex items-center gap-1.5"
                      >
                        <CheckCircle size={13} /> Approve verification
                      </button>
                      <button
                        onClick={() => onVerify(detail, 'manual_rejected')}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium inline-flex items-center gap-1.5"
                      >
                        <XCircle size={13} /> Reject verification
                      </button>
                    </>
                  )}
                  {!isDeleted && detail.status === 'active' && (
                    <button
                      onClick={() => onSuspend(detail)}
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <Ban size={13} /> Suspend
                    </button>
                  )}
                  {!isDeleted && detail.status === 'suspended' && (
                    <button
                      onClick={() => onReactivate(detail)}
                      className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <CheckCircle size={13} /> Reactivate
                    </button>
                  )}
                  {!isDeleted && !detail.isFlagged && (
                    <button
                      onClick={() => onFlag(detail)}
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <Flag size={13} /> Flag
                    </button>
                  )}
                  {!isDeleted && detail.isFlagged && (
                    <button
                      onClick={() => onUnflag(detail)}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <XCircle size={13} /> Unflag
                    </button>
                  )}
                  <button
                    onClick={() => onTrustScore(detail.id, detail.trustScore, detail.name)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    <Gauge size={13} /> Change trust score
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer — delete */}
        {detail && !loading && !error && !isDeleted && (
          <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-end">
            <button
              onClick={() => onDelete(detail.id, detail.name)}
              className="px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium inline-flex items-center gap-1.5"
            >
              <Trash2 size={14} /> Delete professional
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ---------- Tab ----------
type Prompt = {
  title: string;
  description?: string;
  submitLabel: string;
  requireNotes?: boolean;
  onConfirm: (reason: string, notes?: string) => Promise<void>;
};

type TrustPrompt = {
  id: string;
  name: string;
  currentScore: number;
};

type DeletePrompt = {
  id: string;
  name: string;
};

const DELETION_TYPES = [
  { value: 'admin', label: 'Admin' },
  { value: 'ban', label: 'Ban' },
  { value: 'gdpr', label: 'GDPR' },
  { value: 'self', label: 'Self' },
] as const;

const ProfessionalsTab: React.FC = () => {
  const {
    professionals, loading, error, fetchOne,
    verify, suspend, reactivate, flag, unflag, updateTrustScore, remove,
  } = useProfessionals();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [trustPrompt, setTrustPrompt] = useState<TrustPrompt | null>(null);
  const [deletePrompt, setDeletePrompt] = useState<DeletePrompt | null>(null);
  const [deleteType, setDeleteType] = useState<'self' | 'admin' | 'gdpr' | 'ban'>('admin');
  const [detailId, setDetailId] = useState<string | null>(null);

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

  // Drawer action callbacks (all open prompts)
  const openVerify = (p: AdminProfessional, status: 'manual_approved' | 'manual_rejected') => {
    setPrompt({
      title: status === 'manual_approved' ? 'Approve verification' : 'Reject verification',
      description: p.name,
      submitLabel: status === 'manual_approved' ? 'Approve' : 'Reject',
      onConfirm: async (reason) => {
        await verify(p.id, status, reason);
        toast.success(status === 'manual_approved' ? 'Professional verified' : 'Verification rejected');
      },
    });
  };

  const openSuspend = (p: AdminProfessional) => {
    setPrompt({
      title: 'Suspend professional',
      description: p.name,
      submitLabel: 'Suspend',
      onConfirm: async (reason) => {
        await suspend(p.id, reason);
        toast.success('Professional suspended');
      },
    });
  };

  const openReactivate = (p: AdminProfessional) => {
    setPrompt({
      title: 'Reactivate professional',
      description: p.name,
      submitLabel: 'Reactivate',
      onConfirm: async (reason) => {
        await reactivate(p.id, reason);
        toast.success('Professional reactivated');
      },
    });
  };

  const openFlag = (p: AdminProfessional) => {
    setPrompt({
      title: 'Flag professional',
      description: p.name,
      submitLabel: 'Flag',
      requireNotes: true,
      onConfirm: async (reason, notes) => {
        await flag(p.id, reason, notes);
        toast.success('Professional flagged');
      },
    });
  };

  const openUnflag = (p: AdminProfessional) => {
    setPrompt({
      title: 'Unflag professional',
      description: p.name,
      submitLabel: 'Unflag',
      onConfirm: async (reason) => {
        await unflag(p.id, reason);
        toast.success('Flag removed');
      },
    });
  };

  const openTrustScore = (id: string, currentScore: number, name: string) => {
    setTrustPrompt({ id, name, currentScore });
  };

  const openDelete = (id: string, name: string) => {
    setDeleteType('admin');
    setDeletePrompt({ id, name });
  };

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
              disabled={loading}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors disabled:opacity-60 ${
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
        {loading ? (
          <SkeletonTable rows={6} />
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
                    <tr
                      key={p.id}
                      onClick={() => setDetailId(p.id)}
                      className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={p.name} src={p.avatar} size={36} />
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
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailId(p.id)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                            title="Details"
                          >
                            <Eye size={16} />
                          </button>
                          {!isDeleted && canVerify && (
                            <>
                              <button
                                onClick={() => openVerify(p, 'manual_approved')}
                                className="p-2 rounded-lg text-green-600 hover:bg-green-50"
                                title="Approve verification"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => openVerify(p, 'manual_rejected')}
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                                title="Reject verification"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {!isDeleted && canSuspend && (
                            <button
                              onClick={() => openSuspend(p)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                              title="Suspend"
                            >
                              <Ban size={16} />
                            </button>
                          )}
                          {!isDeleted && canReactivate && (
                            <button
                              onClick={() => openReactivate(p)}
                              className="p-2 rounded-lg text-green-600 hover:bg-green-50"
                              title="Reactivate"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {!isDeleted && !p.isFlagged && (
                            <button
                              onClick={() => openFlag(p)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                              title="Flag"
                            >
                              <Flag size={16} />
                            </button>
                          )}
                          {!isDeleted && p.isFlagged && (
                            <button
                              onClick={() => openUnflag(p)}
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

      {/* Reason prompt (verify/suspend/reactivate/flag/unflag) */}
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

      {/* Trust score prompt */}
      {trustPrompt && (
        <TrustScorePrompt
          currentScore={trustPrompt.currentScore}
          professionalName={trustPrompt.name}
          onSubmit={async (score, reason) => {
            await updateTrustScore(trustPrompt.id, score, reason);
            toast.success('Trust score updated');
            setTrustPrompt(null);
          }}
          onCancel={() => setTrustPrompt(null)}
        />
      )}

      {/* Delete prompt */}
      {deletePrompt && (
        <ReasonPrompt
          title="Delete professional"
          description={deletePrompt.name}
          submitLabel="Delete"
          onSubmit={async (reason) => {
            await remove(deletePrompt.id, reason, deleteType);
            toast.success('Professional deleted');
            if (detailId === deletePrompt.id) setDetailId(null);
            setDeletePrompt(null);
          }}
          onCancel={() => setDeletePrompt(null)}
          extraField={
            <div>
              <label className="block text-sm font-medium text-gray-700 mt-3 mb-1">
                Deletion type
              </label>
              <select
                value={deleteType}
                onChange={(e) =>
                  setDeleteType(e.target.value as 'self' | 'admin' | 'gdpr' | 'ban')
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              >
                {DELETION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          }
        />
      )}

      <ProfessionalDrawer
        professionalId={detailId}
        onClose={() => setDetailId(null)}
        fetchOne={fetchOne}
        onVerify={openVerify}
        onSuspend={openSuspend}
        onReactivate={openReactivate}
        onFlag={openFlag}
        onUnflag={openUnflag}
        onTrustScore={openTrustScore}
        onDelete={openDelete}
      />
    </div>
  );
};

export default ProfessionalsTab;