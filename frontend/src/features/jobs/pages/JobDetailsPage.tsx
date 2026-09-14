import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  ImageIcon,
  MessageCircle,
  MessageSquarePlus,
  Send,
  Share2,
  X,
  Loader2,
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useJob, useJobComments, useToggleJobLike } from '../hooks/useJobs';
import type { JobComment } from '../types/job.types';
import { timeAgo } from '../utils/format';
import { useAuth } from '../../auth/hooks/useAuth';
import Avatar from '../components/Avatar';

interface JobDetailsPageProps {
  jobId: string;
  onBack?: () => void;
}

/* ───────────────────────── Status styles ───────────────────────── */

const STATUS_LABELS: Record<string, string> = {
  published: 'Published',
  draft: 'Draft',
  closed: 'Closed',
  archived: 'Archived',
};

const STATUS_STYLES: Record<string, string> = {
  published:
    'border-blue-500/25 bg-blue-500/8 text-blue-700 dark:border-blue-400/25 dark:text-blue-300',
  draft:
    'border-slate-200/80 bg-white/70 text-slate-600 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-300',
  closed:
    'border-rose-500/25 bg-rose-500/8 text-rose-700 dark:border-rose-400/25 dark:text-rose-300',
  archived:
    'border-slate-200/80 bg-white/70 text-slate-500 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-400',
};

const STATUS_DOTS: Record<string, string> = {
  published: 'bg-blue-600 animate-pulse',
  draft: 'bg-slate-400',
  closed: 'bg-rose-500',
  archived: 'bg-slate-400',
};

/* ───────────────────────── Shared tokens ───────────────────────── */

const CARD =
  'overflow-hidden rounded-md border border-slate-200/70 bg-white/85 ' +
  'backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 ' +
  'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)] ' +
  'dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-16px_rgba(0,0,0,0.5)]';

const BTN_GHOST =
  'inline-flex items-center gap-2 rounded border border-slate-200/80 ' +
  'bg-white/70 px-3.5 py-2 text-sm font-semibold text-slate-700 backdrop-blur-md ' +
  'transition-colors hover:bg-white dark:border-white/10 dark:bg-slate-800/40 ' +
  'dark:text-slate-200 dark:hover:bg-slate-800/70';

const BTN_OUTLINE =
  'inline-flex items-center gap-2 rounded border border-slate-200/80 ' +
  'bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur-md ' +
  'transition-colors hover:bg-white dark:border-white/10 dark:bg-slate-800/40 ' +
  'dark:text-slate-200 dark:hover:bg-slate-800/70';

const BTN_PRIMARY =
  'inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-semibold ' +
  'text-white shadow-sm shadow-blue-500/25 transition-colors hover:bg-blue-500 ' +
  'active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed';

/* Skeleton tokens — blue-tinted (matches JobGrid) */
const SKEL_SOFT = 'animate-pulse bg-blue-500/5 dark:bg-white/[0.03]';
const SKEL_BLOCK = 'animate-pulse bg-blue-500/8 dark:bg-white/5';
const SKEL_STRONG = 'animate-pulse bg-blue-500/12 dark:bg-white/[0.07]';

/* ─────────────────────────────────────────────────────────────── */

export default function JobDetailsPage({ jobId, onBack }: JobDetailsPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { job, loading, error, setJob, refresh } = useJob(jobId);
  const { toggleLike } = useToggleJobLike();
  const { createComment } = useJobComments();

  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [shareNotice, setShareNotice] = useState(false);
  const [animateLike, setAnimateLike] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [jobId]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setLightbox(null);
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    window.addEventListener('keydown', handleKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prev;
    };
  }, [lightbox, handleKeyDown]);

  /* ═══════════ Loading skeleton ═══════════ */
  if (loading) {
    return (
      <div className="relative w-full bg-slate-50/50 transition-colors dark:bg-slate-950">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

        <div className="relative w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mb-6">
            <div className={`h-9 w-32 rounded ${SKEL_BLOCK}`} />
          </div>

          <div className="space-y-5 sm:space-y-6">
            <div className={CARD}>
              <div className={`aspect-[16/7] w-full ${SKEL_STRONG}`} />

              <div className="p-5 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between gap-3">
                  <div className={`h-6 w-24 rounded-sm ${SKEL_BLOCK}`} />
                  <div className={`h-3 w-28 rounded-sm ${SKEL_SOFT}`} />
                </div>

                <div className={`mt-4 h-8 w-3/4 rounded ${SKEL_STRONG}`} />

                <div className="mt-5 flex items-center gap-3.5 rounded border border-slate-200/60 bg-white/60 p-3.5 backdrop-blur-md dark:border-white/10 dark:bg-slate-800/40">
                  <div className={`h-12 w-12 shrink-0 rounded-full ${SKEL_STRONG}`} />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className={`h-4 w-40 rounded-sm ${SKEL_BLOCK}`} />
                    <div className={`h-3 w-32 rounded-sm ${SKEL_SOFT}`} />
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <div className={`h-3 w-24 rounded-sm ${SKEL_SOFT}`} />
                  <div className={`h-3 w-full rounded-sm ${SKEL_BLOCK}`} />
                  <div className={`h-3 w-full rounded-sm ${SKEL_BLOCK}`} />
                  <div className={`h-3 w-2/3 rounded-sm ${SKEL_SOFT}`} />
                </div>

                <div className="mt-6 flex gap-2 border-t border-slate-200/60 pt-5 dark:border-white/10">
                  <div className={`h-9 w-24 rounded ${SKEL_STRONG}`} />
                  <div className={`h-9 w-24 rounded ${SKEL_BLOCK}`} />
                  <div className={`h-9 w-24 rounded ${SKEL_SOFT}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !job) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50/50 px-6 text-center dark:bg-slate-950">
        <p className="font-medium text-slate-500 dark:text-slate-400">
          {error ?? 'Job not found.'}
        </p>
        <button type="button" onClick={handleBack} className={`mt-4 ${BTN_GHOST}`}>
          <ArrowLeft className="h-4 w-4" />
          Back to jobs
        </button>
      </div>
    );
  }

  const authorName = job.user
    ? `${job.user.first_name ?? ''} ${job.user.last_name ?? ''}`.trim() ||
      job.user.username
    : 'Unknown user';
  const authorAvatar = job.user?.profile_image_url ?? undefined;
  const comments = job.comments ?? [];

  /* ── Ownership / messaging gates ── */
  const isOwnJob = Boolean(user?.id && job.user?.id && user.id === job.user.id);
  const canMessage = Boolean(job.user?.id) && !isOwnJob;

  /* ── Handlers ── */

  const handleShare = async () => {
    const url = `${window.location.origin}/jobs/${job.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: job.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareNotice(true);
        setTimeout(() => setShareNotice(false), 2000);
      }
    } catch {
      /* cancelled */
    }
  };

  const handleLike = async () => {
    const nextLiked = !job.is_liked;
    setJob((prev) =>
      prev
        ? {
            ...prev,
            is_liked: nextLiked,
            likes_count: Math.max(0, prev.likes_count + (nextLiked ? 1 : -1)),
          }
        : prev
    );
    setAnimateLike(true);
    setTimeout(() => setAnimateLike(false), 400);

    const res = await toggleLike(job.id);
    if (!res) refresh();
    else setJob((prev) => (prev ? { ...prev, is_liked: res.liked } : prev));
  };

  /**
   * Open a conversation with the job poster.
   * - Unauthenticated → send to login with a return path
   * - Authenticated → navigate to messages with recipient + job context
   */
  const handleMessage = () => {
    if (!job.user?.id) return;

    if (!user) {
      const returnTo = encodeURIComponent(`/jobs/${job.id}`);
      navigate(`/login?returnTo=${returnTo}`);
      return;
    }

    const params = new URLSearchParams({
      to: job.user.id,
      context: 'job',
      job: job.id,
      subject: `Re: ${job.title}`,
    });
    navigate(`/home/messages?${params.toString()}`);
  };

  const handleSubmitComment = async () => {
    const text = commentText.trim();
    if (!text || submittingComment) return;

    setSubmittingComment(true);
    const res = await createComment(job.id, { content: text });
    setSubmittingComment(false);

    if (res) {
      setCommentText('');
      setJob((prev) =>
        prev
          ? {
              ...prev,
              comments: [...(prev.comments ?? []), res as JobComment],
              comments_count: (prev.comments_count ?? 0) + 1,
            }
          : prev
      );
    }
  };

  return (
    <div className="relative w-full bg-slate-50/50 transition-colors dark:bg-slate-950">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="relative w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Back */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <button type="button" onClick={handleBack} className={BTN_GHOST}>
            <ArrowLeft className="h-4 w-4" />
            <span>Back to jobs</span>
          </button>
        </div>

        <div className="space-y-5 sm:space-y-6">
          {/* ═════ Main card ═════ */}
          <div className={CARD}>
            {job.images?.length > 0 && (
              <div className="relative aspect-[16/7] w-full overflow-hidden border-b border-slate-200/60 bg-slate-100 dark:border-white/10 dark:bg-slate-800">
                <img
                  src={job.images[0].image_url}
                  alt={job.title}
                  className="h-full w-full cursor-zoom-in object-cover transition-transform duration-300 hover:scale-[1.02]"
                  onClick={() => setLightbox(job.images[0].image_url)}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
              </div>
            )}

            <div className="p-5 sm:p-6 lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                    STATUS_STYLES[job.status] ?? STATUS_STYLES.draft
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      STATUS_DOTS[job.status] ?? STATUS_DOTS.draft
                    }`}
                  />
                  {STATUS_LABELS[job.status] ?? job.status}
                </span>
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  Posted {timeAgo(job.created_at)}
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {job.title}
              </h1>

              {/* ── Author box (with quick message action) ── */}
              <div className="mt-5 flex flex-wrap items-center gap-3.5 rounded border border-slate-200/60 bg-white/60 p-3.5 backdrop-blur-md dark:border-white/10 dark:bg-slate-800/40">
                {job.user?.username ? (
                  <Link to={`/profile/${job.user.username}`}>
                    <Avatar name={authorName} avatar={authorAvatar} size="lg" />
                  </Link>
                ) : (
                  <Avatar name={authorName} avatar={authorAvatar} size="lg" />
                )}

                <div className="min-w-0 flex-1">
                  {job.user?.username ? (
                    <Link
                      to={`/profile/${job.user.username}`}
                      className="inline-flex items-center gap-1.5 font-semibold text-slate-900 transition-colors hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
                    >
                      <span>{authorName}</span>
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    </Link>
                  ) : (
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {authorName}
                    </span>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    @{job.user?.username ?? 'unknown'}
                    {job.user?.account_type ? ` · ${job.user.account_type}` : ''}
                  </p>
                </div>

                {canMessage && (
                  <button
                    type="button"
                    onClick={handleMessage}
                    className={BTN_PRIMARY}
                  >
                    <MessageSquarePlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Message</span>
                  </button>
                )}
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                  Description
                </h2>
                <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {job.description}
                </p>
              </div>

              {/* ── Primary CTA — message the poster ── */}
              {canMessage && job.status === 'published' && (
                <div className="mt-6 flex flex-col gap-3 rounded border border-blue-500/25 bg-blue-500/5 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between dark:border-blue-400/20 dark:bg-blue-500/10">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Send className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-slate-900 dark:text-white">
                        Interested in this job?
                      </p>
                      <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                        Send a direct message to {authorName.split(' ')[0]}{' '}
                        about this opportunity.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleMessage}
                    className={`${BTN_PRIMARY} w-full justify-center sm:w-auto`}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Message {authorName.split(' ')[0]}</span>
                  </button>
                </div>
              )}

              {/* Actions row */}
              <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-200/60 pt-5 dark:border-white/10">
                <button
                  type="button"
                  onClick={handleLike}
                  className={`inline-flex items-center gap-2 rounded border px-4 py-2 text-sm font-semibold transition-all ${
                    job.is_liked
                      ? 'border-rose-500/25 bg-rose-500/8 text-rose-600 dark:text-rose-400'
                      : 'border-slate-200/80 bg-white/70 text-slate-700 backdrop-blur-md hover:bg-white dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 transition-transform ${
                      animateLike ? 'scale-125' : ''
                    } ${job.is_liked ? 'fill-rose-500 text-rose-500' : ''}`}
                  />
                  <span>
                    {job.likes_count} {job.likes_count === 1 ? 'like' : 'likes'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className={`relative ${BTN_OUTLINE}`}
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                  {shareNotice && (
                    <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border border-slate-800/10 bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md dark:border-white/10 dark:bg-slate-100 dark:text-slate-900">
                      Copied to clipboard!
                    </span>
                  )}
                </button>

                {canMessage && (
                  <button
                    type="button"
                    onClick={handleMessage}
                    className={`ml-auto ${BTN_OUTLINE}`}
                  >
                    <Send className="h-4 w-4" />
                    <span>Message</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ═════ Gallery ═════ */}
          {job.images?.length > 1 && (
            <div className={`${CARD} p-5 sm:p-6`}>
              <div className="mb-4 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-blue-500" />
                <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
                  Gallery ·{' '}
                  <span className="tabular-nums">{job.images.length}</span>
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {job.images.map((img) => (
                  <button
                    type="button"
                    key={img.id}
                    onClick={() => setLightbox(img.image_url)}
                    className="group relative aspect-square overflow-hidden rounded-sm border border-slate-200/70 bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:border-white/10 dark:bg-slate-800"
                  >
                    <img
                      src={img.image_url}
                      alt={`${job.title} gallery thumbnail`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═════ Comments ═════ */}
          <div className={`${CARD} p-5 sm:p-6`}>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-blue-500" />
              <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
                Comments
              </h2>
              <span className="ml-1 inline-flex h-5 items-center rounded-sm border border-slate-200/80 bg-white/70 px-1.5 text-[10px] font-bold tabular-nums text-slate-600 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-300">
                {comments.length}
              </span>
            </div>

            {user && (
              <div className="mt-4 flex gap-3">
                <Avatar
                  name={
                    `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() ||
                    'You'
                  }
                  avatar={user.profile_image_url ?? undefined}
                  size="md"
                />
                <div className="flex flex-1 items-center gap-2 rounded border border-slate-200/80 bg-white/70 p-1.5 backdrop-blur-md transition-colors focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/25 dark:border-white/10 dark:bg-slate-800/40">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === 'Enter' &&
                        commentText.trim() &&
                        !submittingComment
                      ) {
                        handleSubmitComment();
                      }
                    }}
                    placeholder="Add a comment…"
                    className="flex-1 bg-transparent px-2.5 py-1.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() || submittingComment}
                    aria-label="Send comment"
                    className="inline-flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white shadow-sm shadow-blue-500/25 transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    {submittingComment ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 space-y-3">
              {comments.length > 0 ? (
                comments.map((c) => {
                  const mine = user?.id === c.user_id;
                  const label = mine ? 'You' : 'User';
                  return (
                    <div key={c.id} className="flex gap-3">
                      <Avatar name={label} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="rounded-sm border border-slate-200/60 bg-white/70 px-3.5 py-2.5 backdrop-blur-md dark:border-white/10 dark:bg-slate-800/40">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                              {label}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              {timeAgo(c.created_at)}
                            </span>
                          </div>
                          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            {c.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-sm border border-dashed border-slate-200/80 py-8 text-center dark:border-white/10">
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    No comments yet. Start the conversation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═════ Lightbox (portal) ═════ */}
      {lightbox &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] flex items-center justify-center
                       bg-blue-950/90 p-4 backdrop-blur-2xl"
            onClick={() => setLightbox(null)}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Close image lightbox"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center
                         rounded-full border border-white/10 bg-white/10 text-white
                         backdrop-blur-md transition-colors
                         hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={lightbox}
              alt="Expanded preview"
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] max-w-[90vw] rounded-md object-contain shadow-2xl"
            />
          </div>,
          document.body
        )}
    </div>
  );
}