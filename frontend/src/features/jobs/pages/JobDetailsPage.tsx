import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  ImageIcon,
  MessageCircle,
  Send,
  Share2,
  X,
  Loader2,
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
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

const STATUS_LABELS: Record<string, string> = {
  published: 'Published',
  draft: 'Draft',
  closed: 'Closed',
  archived: 'Archived',
};

const STATUS_STYLES: Record<string, string> = {
  published:
    'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800',
  draft:
    'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
  closed:
    'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-800',
  archived:
    'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800',
};

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
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [jobId]);

  // Handle escape key for lightbox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setLightbox(null);
    }
  }, []);

  useEffect(() => {
    if (lightbox) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [lightbox, handleKeyDown]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 h-9 w-32 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-4 rounded-lg border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="h-7 w-3/4 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-1/2 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="h-64 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="h-24 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="w-full min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 flex flex-col items-center justify-center text-center">
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {error ?? 'Job not found.'}
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to jobs
        </button>
      </div>
    );
  }

  const authorName = job.user
    ? `${job.user.first_name ?? ''} ${job.user.last_name ?? ''}`.trim() || job.user.username
    : 'Unknown user';
  const authorAvatar = job.user?.profile_image_url ?? undefined;
  const comments = job.comments ?? [];

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
      /* User cancelled sharing */
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
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 transition-colors">
      {/* Top Bar Navigation */}
      <div className="w-full mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to jobs</span>
        </button>
      </div>

      <div className="w-full space-y-6">
        {/* Main Job Card */}
        <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-sm dark:border-slate-800/80">
          {job.images?.length > 0 && (
            <div className="relative aspect-[16/7] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-b border-slate-200/60 dark:border-slate-800/60">
              <img
                src={job.images[0].image_url}
                alt={job.title}
                className="h-full w-full cursor-zoom-in object-cover transition-transform duration-300 hover:scale-102"
                onClick={() => setLightbox(job.images[0].image_url)}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
            </div>
          )}

          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${
                  STATUS_STYLES[job.status] ?? STATUS_STYLES.draft
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    job.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
                {STATUS_LABELS[job.status] ?? job.status}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                Posted {timeAgo(job.created_at)}
              </span>
            </div>

            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl lg:text-4xl">
              {job.title}
            </h1>

            {/* Author Metadata Box */}
            <div className="mt-6 flex items-center gap-3.5 rounded-md border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-800/40 p-4">
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
                    className="inline-flex items-center gap-1.5 font-semibold text-slate-900 transition-colors hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
                  >
                    <span>{authorName}</span>
                    <CheckCircle2 className="h-4 w-4 text-indigo-500" />
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
            </div>

            {/* Job Description */}
            <div className="mt-8">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Description
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300 sm:text-base">
                {job.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-6">
              <button
                type="button"
                onClick={handleLike}
                className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-all ${
                  job.is_liked
                    ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
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
                className="relative inline-flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
                {shareNotice && (
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs text-white dark:bg-slate-100 dark:text-slate-900 shadow-md">
                    Copied to clipboard!
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Media Gallery */}
        {job.images?.length > 1 && (
          <div className="rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                Gallery · {job.images.length}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {job.images.map((img) => (
                <button
                  type="button"
                  key={img.id}
                  onClick={() => setLightbox(img.image_url)}
                  className="group relative aspect-square overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <img
                    src={img.image_url}
                    alt={`${job.title} gallery thumbnail`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Comments
            </h2>
            <span className="ml-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
              {comments.length}
            </span>
          </div>

          {user && (
            <div className="mt-5 flex gap-3">
              <Avatar
                name={`${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || 'You'}
                avatar={user.profile_image_url ?? undefined}
                size="md"
              />
              <div className="flex flex-1 items-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-1.5 transition-colors focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && commentText.trim() && !submittingComment) {
                      handleSubmitComment();
                    }
                  }}
                  placeholder="Add a comment…"
                  className="flex-1 bg-transparent px-2.5 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || submittingComment}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Send comment"
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

          <div className="mt-6 space-y-3">
            {comments.length > 0 ? (
              comments.map((c) => {
                const mine = user?.id === c.user_id;
                const label = mine ? 'You' : 'User';
                return (
                  <div key={c.id} className="flex gap-3">
                    <Avatar name={label} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="rounded-md border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-800/40 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {label}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">
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
              <div className="rounded-md border border-dashed border-slate-200 dark:border-slate-800 py-8 text-center">
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  No comments yet. Start the conversation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="Close image lightbox"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightbox}
            alt="Expanded preview"
            className="max-h-[90vh] max-w-[90vw] rounded-md object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}