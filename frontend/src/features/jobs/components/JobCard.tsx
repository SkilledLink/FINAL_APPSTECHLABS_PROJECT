import {
  Heart,
  MessageCircle,
  Share2,
  ImageIcon,
  ArrowUpRight,
  Send,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import type { Job } from '../types/job.types';
import { useToggleJobLike, useJobComments } from '../hooks/useJobs';
import { timeAgo, truncate } from '../utils/format';
import { useAuth } from '../../auth/hooks/useAuth';
import Avatar from './Avatar';

interface JobCardProps {
  job: Job;
  onOpenDetails: (jobId: string) => void;
  onPatch?: (jobId: string, patch: Partial<Job>) => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  published: {
    label: 'Active',
    badge: 'bg-emerald-500/10 text-emerald-700 ring-emerald-600/20 backdrop-blur-md dark:text-emerald-400 dark:ring-emerald-400/30',
    dot: 'bg-emerald-500 animate-pulse',
  },
  draft: {
    label: 'Draft',
    badge: 'bg-slate-500/10 text-slate-700 ring-slate-600/20 backdrop-blur-md dark:text-slate-300 dark:ring-slate-400/30',
    dot: 'bg-slate-400',
  },
  closed: {
    label: 'Closed',
    badge: 'bg-rose-500/10 text-rose-700 ring-rose-600/20 backdrop-blur-md dark:text-rose-400 dark:ring-rose-400/30',
    dot: 'bg-rose-500',
  },
  archived: {
    label: 'Archived',
    badge: 'bg-amber-500/10 text-amber-700 ring-amber-600/20 backdrop-blur-md dark:text-amber-400 dark:ring-amber-400/30',
    dot: 'bg-amber-500',
  },
};

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

  const authorName = job.user
    ? `${job.user.first_name || ''} ${job.user.last_name || ''}`.trim() || job.user.username
    : 'Anonymous';
  const authorAvatar = job.user?.profile_image_url ?? undefined;
  const hasImages = job.images && job.images.length > 0;
  const statusInfo = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.draft;

  const pushPatch = (patch: Partial<Job>) => onPatch?.(job.id, patch);

  // Keyboard navigation & body scroll lock for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft' && job.images?.length > 1) {
        setActiveImageIndex((prev) => (prev === 0 ? job.images.length - 1 : prev - 1));
      }
      if (e.key === 'ArrowRight' && job.images?.length > 1) {
        setActiveImageIndex((prev) => (prev === job.images.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, job.images]);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, textarea')) return;
    onOpenDetails(job.id);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasImages) {
      setIsLightboxOpen(true);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!job.images || job.images.length <= 1) return;
    setActiveImageIndex((prev) => (prev === 0 ? job.images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!job.images || job.images.length <= 1) return;
    setActiveImageIndex((prev) => (prev === job.images.length - 1 ? 0 : prev + 1));
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
      /* User cancelled share dialog */
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
      const next = commentsCount + 1;
      setCommentsCount(next);
      pushPatch({ comments_count: next });
    }
  };

  return (
    <>
      <article
        onClick={handleCardClick}
        className="group relative flex flex-col cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:shadow-black/20"
      >
        {/* Visual Header / Media Container */}
        <div
          onClick={handleImageClick}
          className="group/media relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
        >
          {hasImages ? (
            <>
              <img
                key={job.images[activeImageIndex]?.id || activeImageIndex}
                src={job.images[activeImageIndex]?.image_url}
                alt={`${job.title} - Image ${activeImageIndex + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Hover overlay hint */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-950/75 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg">
                  <Maximize2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>View Photos ({job.images.length})</span>
                </span>
              </div>

              {/* Inline Carousel Controls */}
              {job.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/40 text-white backdrop-blur-md transition-all opacity-0 group-hover/media:opacity-100 hover:bg-slate-950/70 hover:scale-110 active:scale-95"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/40 text-white backdrop-blur-md transition-all opacity-0 group-hover/media:opacity-100 hover:bg-slate-950/70 hover:scale-110 active:scale-95"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  {/* Inline Pagination Dots Indicator */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-950/40 backdrop-blur-md">
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
            <div className="relative h-full w-full bg-gradient-to-br from-indigo-600 via-violet-600 to-brand-700 p-6 flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-indigo-400/20 blur-2xl" />

              <div className="relative z-10 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Featured Job Post</span>
              </div>
            </div>
          )}

          {/* Header Badges Overlay */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 shadow-sm ${statusInfo.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </span>

            {hasImages && job.images.length > 1 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/60 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-white ring-1 ring-white/10 shadow-sm">
                <ImageIcon className="h-3.5 w-3.5" />
                <span>
                  {activeImageIndex + 1}/{job.images.length}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Main Card Body */}
        <div className="flex flex-1 flex-col p-5">
          {/* Author Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
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
                    className="block truncate text-sm font-semibold text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400 transition-colors"
                  >
                    {authorName}
                  </Link>
                ) : (
                  <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {authorName}
                  </span>
                )}
                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                  @{job.user?.username ?? 'user'} · {timeAgo(job.created_at)}
                </span>
              </div>
            </div>

            <button
              onClick={() => onOpenDetails(job.id)}
              className="group/btn inline-flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all"
              aria-label="View job details"
            >
              <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </button>
          </div>

          {/* Job Title placed cleanly in the body below author info */}
          <h3 className="mt-3.5 font-display text-lg font-bold leading-snug text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {job.title}
          </h3>

          {/* Description Body */}
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
            {truncate(job.description, 130)}
          </p>

          {/* Action Controls Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleLike}
                className={`group/heart inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  isLiked
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
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
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComments((v) => !v);
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  showComments
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="tabular-nums">{commentsCount}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="relative inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
                {shareNotice && (
                  <span className="absolute -top-9 right-0 inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-md dark:bg-slate-100 dark:text-slate-900 animate-in fade-in zoom-in-95 duration-150">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 dark:text-emerald-600" />
                    Copied
                  </span>
                )}
              </button>

              <button
                onClick={() => onOpenDetails(job.id)}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
              >
                View
              </button>
            </div>
          </div>

          {/* Collapsible Comments Drawer */}
          {showComments && (
            <div
              className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {comments.length > 0 ? (
                <div className="space-y-3 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                  {comments.map((c) => {
                    const mine = user?.id === c.user_id;
                    const label = mine ? 'You' : 'User';
                    return (
                      <div key={c.id} className="flex items-start gap-2.5 text-xs">
                        <Avatar name={label} size="sm" />
                        <div className="flex-1 min-w-0 rounded-2xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-200">
                              {label}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {timeAgo(c.created_at)}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-600 dark:text-slate-300 leading-normal">
                            {c.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-2 italic">
                  No comments yet. Start the conversation!
                </p>
              )}

              {/* Input area */}
              <div className="flex items-center gap-2">
                <Avatar name="You" size="sm" />
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmitComment(e);
                    }}
                    placeholder="Write a comment..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-3 pr-9 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-400"
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() || isSubmittingComment}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-transparent dark:text-indigo-400 dark:hover:bg-indigo-950/50 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </article>

      {/* ─── FULL-SCREEN PHOTO GALLERY LIGHTBOX (PORTAL TO DOCUMENT BODY) ─── */}
      {isLightboxOpen &&
        hasImages &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] flex flex-col items-center justify-between bg-slate-950/95 p-4 sm:p-6 backdrop-blur-2xl select-none animate-in fade-in duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
          >
            {/* Top Bar Header with safe padding to avoid website navbar overlay */}
            <div className="w-full max-w-6xl flex items-center justify-between text-white z-50 pt-2 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-semibold text-slate-200 truncate max-w-xs sm:max-w-md">
                  {job.title}
                </span>
                <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur-md">
                  {activeImageIndex + 1} / {job.images.length}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                  Press <kbd className="font-mono text-white">ESC</kbd> to exit
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(false);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label="Close photo popup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Main Photo Display Area */}
            <div
              className="relative flex-1 w-full max-w-5xl flex items-center justify-center overflow-hidden my-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                key={job.images[activeImageIndex]?.id || activeImageIndex}
                src={job.images[activeImageIndex]?.image_url}
                alt={`${job.title} - Image ${activeImageIndex + 1}`}
                className="max-h-[72vh] max-w-full object-contain rounded-2xl shadow-2xl transition-transform duration-300"
              />

              {/* Lightbox Prev / Next Arrows */}
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
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/80 text-white border border-white/15 hover:bg-slate-900 hover:scale-110 active:scale-95 transition-all shadow-xl"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) =>
                        prev === job.images.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/80 text-white border border-white/15 hover:bg-slate-900 hover:scale-110 active:scale-95 transition-all shadow-xl"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Thumbnails Strip */}
            {job.images.length > 1 && (
              <div
                className="flex items-center gap-2 overflow-x-auto p-2 max-w-full z-10 scrollbar-none"
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
                    className={`h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-indigo-500 scale-105 ring-2 ring-indigo-500/40 opacity-100'
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