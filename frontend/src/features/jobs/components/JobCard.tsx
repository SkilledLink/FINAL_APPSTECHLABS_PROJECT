import {
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  ImageIcon,
  Maximize2,
  MessageCircle,
  Send,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { useJobComments, useToggleJobLike } from '../hooks/useJobs';
import type { Job } from '../types/job.types';
import { timeAgo, truncate } from '../utils/format';
import Avatar from './Avatar';

interface JobCardProps {
  job: Job;
  onOpenDetails: (jobId: string) => void;
  onPatch?: (jobId: string, patch: Partial<Job>) => void;
}

/* ───────────────────────── Shared tokens ───────────────────────── */

const CARD =
  'group relative flex cursor-pointer flex-col overflow-hidden rounded-md ' +
  'border border-slate-200/70 bg-white/85 backdrop-blur-xl ' +
  'dark:border-white/10 dark:bg-slate-900/60 ' +
  'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)] ' +
  'dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-16px_rgba(0,0,0,0.5)] ' +
  'transition-all duration-200 ' +
  'hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-[0_8px_24px_-12px_rgba(59,130,246,0.25)] ' +
  'dark:hover:border-blue-500/30 dark:hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)]';

const BTN_PRIMARY =
  'inline-flex items-center gap-1 rounded bg-blue-600 px-3.5 py-1.5 ' +
  'text-xs font-semibold text-white shadow-sm shadow-blue-500/25 ' +
  'transition-colors hover:bg-blue-500 active:scale-[0.98]';

const BTN_GHOST =
  'inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold ' +
  'text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 ' +
  'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200';

const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  published: {
    label: 'Active',
    badge:
      'border border-blue-500/25 bg-blue-500/8 text-blue-700 ' +
      'dark:border-blue-400/25 dark:text-blue-300',
    dot: 'bg-blue-600 animate-pulse',
  },
  draft: {
    label: 'Draft',
    badge:
      'border border-slate-200/80 bg-white/70 text-slate-600 ' +
      'dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-300',
    dot: 'bg-slate-400',
  },
  closed: {
    label: 'Closed',
    badge:
      'border border-rose-500/25 bg-rose-500/8 text-rose-700 ' +
      'dark:border-rose-400/25 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
  archived: {
    label: 'Archived',
    badge:
      'border border-slate-200/80 bg-white/70 text-slate-500 ' +
      'dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-400',
    dot: 'bg-slate-400',
  },
};

/* ─────────────────────────────────────────────────────────────── */

export default function JobCard({ job, onOpenDetails, onPatch }: JobCardProps) {
  const { user } = useAuth();
  const { toggleLike } = useToggleJobLike();
  const { createComment } = useJobComments();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(job.is_liked);
  const [likesCount, setLikesCount] = useState(job.likes_count);
  const [commentsCount, setCommentsCount] = useState(job.comments_count);
  const [comments, setComments] = useState(job.comments ?? []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [shareNotice, setShareNotice] = useState(false);
  const [animateLike, setAnimateLike] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    setIsLiked(job.is_liked);
    setLikesCount(job.likes_count);
    setCommentsCount(job.comments_count);
    setComments(job.comments ?? []);
    setActiveImageIndex(0);
  }, [job]);

  const authorName = job.user
    ? `${job.user.first_name || ''} ${job.user.last_name || ''}`.trim() ||
      job.user.username
    : 'Anonymous';
  const authorAvatar = job.user?.profile_image_url ?? undefined;
  const hasImages = Array.isArray(job.images) && job.images.length > 0;
  const statusInfo = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.draft;

  const pushPatch = (patch: Partial<Job>) => onPatch?.(job.id, patch);

  useEffect(() => {
    if (!isLightboxOpen || !hasImages) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft' && job.images.length > 1) {
        setActiveImageIndex((prev) =>
          prev === 0 ? job.images.length - 1 : prev - 1
        );
      }
      if (e.key === 'ArrowRight' && job.images.length > 1) {
        setActiveImageIndex((prev) =>
          prev === job.images.length - 1 ? 0 : prev + 1
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, hasImages, job.images?.length]);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, textarea')) return;
    onOpenDetails(job.id);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasImages) setIsLightboxOpen(true);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasImages || job.images.length <= 1) return;
    setActiveImageIndex((prev) =>
      prev === 0 ? job.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasImages || job.images.length <= 1) return;
    setActiveImageIndex((prev) =>
      prev === job.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleSelectImage = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setActiveImageIndex(index);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLiked = !isLiked;
    const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));

    setIsLiked(nextLiked);
    setLikesCount(nextCount);
    pushPatch({ is_liked: nextLiked, likes_count: nextCount });

    setAnimateLike(true);
    setTimeout(() => setAnimateLike(false), 450);

    const res = await toggleLike(job.id);
    if (!res) {
      setIsLiked(!nextLiked);
      setLikesCount(likesCount);
      pushPatch({ is_liked: !nextLiked, likes_count: likesCount });
    } else {
      setIsLiked(res.liked);
      pushPatch({ is_liked: res.liked });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/jobs/${job.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: job.title, text: job.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareNotice(true);
        setTimeout(() => setShareNotice(false), 2000);
      }
    } catch {
      /* cancelled */
    }
  };

  const handleSubmitComment = async (
    e: React.MouseEvent | React.KeyboardEvent
  ) => {
    e.stopPropagation();
    const text = commentText.trim();
    if (!text || isSubmittingComment) return;

    setIsSubmittingComment(true);
    const res = await createComment(job.id, { content: text });
    setIsSubmittingComment(false);

    if (res) {
      setCommentText('');
      setComments((prev) => [...prev, res]);
      const nextCount = commentsCount + 1;
      setCommentsCount(nextCount);
      pushPatch({ comments_count: nextCount });
    }
  };

  return (
    <>
      <article onClick={handleCardClick} className={CARD}>
        {/* ─────────── Media ─────────── */}
        <div
          onClick={handleImageClick}
          className="group/media relative aspect-[16/9] w-full cursor-pointer overflow-hidden bg-slate-100 dark:bg-slate-800"
        >
          {hasImages ? (
            <>
              <img
                key={job.images[activeImageIndex]?.id || activeImageIndex}
                src={job.images[activeImageIndex]?.image_url}
                alt={`${job.title} - Image ${activeImageIndex + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />

              {/* Hover overlay */}
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/media:opacity-100">
                <span className="inline-flex items-center gap-2 rounded border border-white/20 bg-slate-950/75 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
                  <Maximize2 className="h-3.5 w-3.5 text-blue-400" />
                  <span>View photos ({job.images.length})</span>
                </span>
              </div>

              {/* Carousel nav */}
              {job.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/40 text-white opacity-0 backdrop-blur-md transition-all hover:scale-105 hover:bg-slate-950/70 active:scale-95 group-hover/media:opacity-100"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/40 text-white opacity-0 backdrop-blur-md transition-all hover:scale-105 hover:bg-slate-950/70 active:scale-95 group-hover/media:opacity-100"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-950/40 px-2 py-1 backdrop-blur-md">
                    {job.images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => handleSelectImage(e, idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          activeImageIndex === idx
                            ? 'w-4 bg-white'
                            : 'w-1.5 bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 p-6">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-blue-300/20 blur-2xl" />

              <div className="relative z-10 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/85">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Featured opportunity</span>
              </div>
            </div>
          )}

          {/* Top overlay */}
          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${statusInfo.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </span>

            {hasImages && job.images.length > 1 && (
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-white/10 bg-slate-950/60 px-2 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-md">
                <ImageIcon className="h-3 w-3" />
                <span className="tabular-nums">
                  {activeImageIndex + 1}/{job.images.length}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* ─────────── Body ─────────── */}
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          {/* Author */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              {job.user?.username ? (
                <Link
                  to={`/profile/${job.user.username}`}
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 transition-transform active:scale-95"
                >
                  <Avatar name={authorName} avatar={authorAvatar} size="md" />
                </Link>
              ) : (
                <Avatar name={authorName} avatar={authorAvatar} size="md" />
              )}

              <div className="min-w-0 flex-1">
                {job.user?.username ? (
                  <Link
                    to={`/profile/${job.user.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="block truncate text-[13px] font-semibold text-slate-900 transition-colors hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
                  >
                    {authorName}
                  </Link>
                ) : (
                  <span className="block truncate text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                    {authorName}
                  </span>
                )}
                <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">
                  @{job.user?.username ?? 'user'} · {timeAgo(job.created_at)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenDetails(job.id)}
              aria-label="View job details"
              className="group/btn flex h-8 w-8 items-center justify-center rounded text-slate-400 transition-colors hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </button>
          </div>

          {/* Title */}
          <h3 className="mt-3.5 line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400">
            {job.title}
          </h3>

          {/* Description */}
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {truncate(job.description, 130)}
          </p>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-200/60 pt-3 dark:border-white/10">
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handleLike}
                className={`group/heart inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  isLiked
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Heart
                  className={`h-4 w-4 transition-transform duration-300 ${
                    animateLike ? 'scale-125' : 'group-hover/heart:scale-110'
                  } ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`}
                />
                <span className="tabular-nums">{likesCount}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComments((v) => !v);
                }}
                className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  showComments
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="tabular-nums">{commentsCount}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleShare}
                className={`relative ${BTN_GHOST}`}
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
                {shareNotice && (
                  <span className="absolute -top-9 right-0 inline-flex items-center gap-1 rounded border border-slate-800/10 bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md dark:border-white/10 dark:bg-slate-100 dark:text-slate-900">
                    <CheckCircle2 className="h-3 w-3 text-blue-400 dark:text-blue-600" />
                    Copied
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onOpenDetails(job.id)}
                className={BTN_PRIMARY}
              >
                View
              </button>
            </div>
          </div>

          {/* Comments */}
          {showComments && (
            <div
              className="mt-4 space-y-3 border-t border-slate-200/60 pt-4 dark:border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {comments.length > 0 ? (
                <div className="max-h-52 space-y-2.5 overflow-y-auto pr-1 scrollbar-thin">
                  {comments.map((c) => {
                    const isMine = user?.id === c.user_id;
                    const commentAuthor = isMine ? 'You' : 'User';
                    return (
                      <div
                        key={c.id}
                        className="flex items-start gap-2.5 text-xs"
                      >
                        <Avatar name={commentAuthor} size="sm" />
                        <div className="min-w-0 flex-1 rounded-sm border border-slate-200/60 bg-white/70 p-2.5 dark:border-white/10 dark:bg-slate-800/40">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-200">
                              {commentAuthor}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {timeAgo(c.created_at)}
                            </span>
                          </div>
                          <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">
                            {c.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="py-2 text-center text-xs italic text-slate-400">
                  No comments yet. Start the conversation.
                </p>
              )}

              <div className="flex items-center gap-2">
                <Avatar name={user?.first_name || 'You'} size="sm" />
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmitComment(e);
                    }}
                    placeholder="Write a comment…"
                    className="w-full rounded border border-slate-200/80 bg-white/70 py-2 pl-3 pr-9 text-xs text-slate-900 outline-none backdrop-blur-md transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/25 dark:border-white/10 dark:bg-slate-800/40 dark:text-white dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() || isSubmittingComment}
                    className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-blue-600 transition-colors hover:bg-blue-500/10 disabled:opacity-30 dark:text-blue-400"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </article>

      {/* ─────────── Lightbox (portal) ─────────── */}
      {isLightboxOpen &&
        hasImages &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox gallery"
            className="fixed inset-0 z-[999999] flex select-none flex-col items-center justify-between bg-slate-950/95 p-4 backdrop-blur-2xl sm:p-6"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
          >
            {/* Top bar */}
            <div className="z-50 flex w-full max-w-6xl items-center justify-between border-b border-white/10 pb-3 pt-2 text-white">
              <div className="flex min-w-0 items-center gap-3">
                <span className="max-w-xs truncate text-sm font-semibold text-slate-200 sm:max-w-md">
                  {job.title}
                </span>
                <span className="shrink-0 rounded-sm border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-slate-300 backdrop-blur-md">
                  {activeImageIndex + 1} / {job.images.length}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden items-center gap-1 rounded-sm border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-400 sm:inline-flex">
                  Press <kbd className="font-mono text-white">ESC</kbd> to exit
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(false);
                  }}
                  aria-label="Close photo gallery"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-all hover:bg-white/25 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Viewport */}
            <div
              className="relative my-4 flex w-full max-w-5xl flex-1 items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                key={job.images[activeImageIndex]?.id || activeImageIndex}
                src={job.images[activeImageIndex]?.image_url}
                alt={`${job.title} - Image ${activeImageIndex + 1}`}
                className="max-h-[72vh] max-w-full rounded-md object-contain shadow-2xl"
              />

              {job.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) =>
                        prev === 0 ? job.images.length - 1 : prev - 1
                      );
                    }}
                    className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-slate-900/80 text-white shadow-xl transition-all hover:scale-105 hover:bg-slate-900 active:scale-95 sm:left-4"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) =>
                        prev === job.images.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-slate-900/80 text-white shadow-xl transition-all hover:scale-105 hover:bg-slate-900 active:scale-95 sm:right-4"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {job.images.length > 1 && (
              <div
                className="z-10 flex max-w-full items-center gap-2 overflow-x-auto p-2 scrollbar-none"
                onClick={(e) => e.stopPropagation()}
              >
                {job.images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(idx);
                    }}
                    className={`h-14 w-14 shrink-0 overflow-hidden rounded-sm border-2 transition-all sm:h-16 sm:w-16 ${
                      activeImageIndex === idx
                        ? 'scale-105 border-blue-500 opacity-100 ring-2 ring-blue-500/40'
                        : 'border-transparent opacity-40 hover:opacity-80'
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}