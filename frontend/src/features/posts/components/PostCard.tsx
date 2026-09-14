import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreHorizontal,
  Trash2,
  Send,
  X,
  Maximize2,
  Volume2,
  VolumeX,
  MessageCircle,
  Sparkles,
  Heart,
  CheckCircle2,
  Smile,
  Globe,
  Loader2,
  AlertTriangle,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import PostActions from './PostActions';
import ShareModal from './ShareModal';
import type { Post } from '../types/post.types';

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void;
  onComment?: (postId: string, content: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
  onHashtagClick?: (hashtag: string) => void;
  onRetry?: (post: Post) => void;
  onDismiss?: (post: Post) => void;
}

type VisualState = 'normal' | 'uploading' | 'failed' | 'rejected' | 'pending';

function getVisualState(post: Post): VisualState {
  if (post._clientStatus === 'uploading') return 'uploading';
  if (post._clientStatus === 'failed') return 'failed';

  const decision = post.moderation?.decision;
  if (decision === 'unsafe' || post.status === 'rejected') return 'rejected';
  if (
    decision === 'review' ||
    post.status === 'pending_review' ||
    post.status === 'pending_moderation'
  ) {
    return 'pending';
  }
  return 'normal';
}

// ─── Initials avatar helpers ───
const getInitials = (first?: string, last?: string): string => {
  const a = (first || '').trim().charAt(0);
  const b = (last || '').trim().charAt(0);
  const initials = (a + b).toUpperCase();
  return initials || '?';
};

const AVATAR_COLORS = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600',
  'from-cyan-500 to-blue-600',
  'from-fuchsia-500 to-purple-600',
  'from-lime-500 to-emerald-600',
];

const getAvatarColor = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// ─── Auto-Playing Video ───
const AutoPlayVideo: React.FC<{
  src: string;
  onClick: () => void;
  onDoubleTap: (e: React.MouseEvent) => void;
}> = ({ src, onClick, onDoubleTap }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => {
                video.muted = true;
                setIsMuted(true);
                video.play().then(() => setIsPlaying(true)).catch(() => {});
              });
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleTap}
      className="group relative w-full overflow-hidden rounded-2xl bg-slate-950 aspect-[4/5] sm:aspect-[16/10] max-h-[520px] flex items-center justify-center cursor-pointer select-none"
    >
      <video
        ref={videoRef}
        src={src}
        loop
        muted={isMuted}
        playsInline
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
        <div className="flex items-center gap-2 rounded-full bg-slate-900/80 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md border border-white/15 shadow-xl group-hover:scale-105 transition-transform">
          <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Expand Media</span>
        </div>
      </div>

      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        className="absolute bottom-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-white backdrop-blur-md border border-white/15 hover:bg-slate-900 hover:scale-110 active:scale-95 transition-all z-10 shadow-lg"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-rose-400" />
        ) : (
          <Volume2 className="w-4 h-4 text-emerald-400" />
        )}
      </button>

      {isPlaying && (
        <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-bold tracking-wider text-white backdrop-blur-md border border-white/15 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="uppercase">Playing</span>
        </div>
      )}
    </div>
  );
};

// ─── Main PostCard ───
export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onDelete,
  onComment,
  onDeleteComment,
  onHashtagClick,
  onRetry,
  onDismiss,
}) => {
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  // Description clamp state
  const descRef = useRef<HTMLParagraphElement>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isDescOverflowing, setIsDescOverflowing] = useState(false);

  const user = post.user;
  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'
    : 'Unknown User';
  const username = user?.first_name
    ? `@${user.first_name.toLowerCase()}${user.last_name ? user.last_name.toLowerCase() : ''}`
    : '@user';

  const primaryMedia = post.media?.[0];

  const visualState = getVisualState(post);
  const isLocked = visualState !== 'normal';

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDoubleTap = useCallback(
    (e: React.MouseEvent) => {
      if (isLocked) return;
      e.stopPropagation();
      onLike(post.id);
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 800);
    },
    [onLike, post.id, isLocked]
  );

  const handleCommentSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!commentText.trim() || !onComment) return;
    onComment(post.id, commentText.trim());
    setCommentText('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMediaOpen) setIsMediaOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMediaOpen]);

  // Detect whether the collapsed description is actually overflowing.
  // Uses ResizeObserver so it re-checks on width changes.
  useEffect(() => {
    const el = descRef.current;
    if (!el) return;

    const check = () => {
      // Only measure while collapsed. When expanded,
      // scrollHeight === clientHeight and we'd get a false negative.
      if (isDescExpanded) return;
      setIsDescOverflowing(el.scrollHeight > el.clientHeight + 1);
    };

    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [post.description, isDescExpanded]);

  const containerCls = (() => {
    switch (visualState) {
      case 'uploading':
        return 'opacity-80';
      case 'failed':
        return 'border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/10';
      case 'rejected':
        return 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20';
      case 'pending':
        return 'border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20';
      default:
        return '';
    }
  })();

  return (
    <>
      <article
        className={`group/card relative w-full overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-slate-300 dark:hover:border-slate-700 mb-5 ${containerCls}`}
      >
        {/* Status banner */}
        {visualState === 'uploading' && (
          <div className="flex items-center gap-2 px-4 sm:px-5 pt-3 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Posting…</span>
          </div>
        )}
        {visualState === 'failed' && (
          <div className="flex items-center gap-2 px-4 sm:px-5 pt-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Failed to post</span>
          </div>
        )}
        {visualState === 'rejected' && (
          <div className="flex items-center gap-2 px-4 sm:px-5 pt-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </div>
        )}
        {visualState === 'pending' && (
          <div className="flex items-center gap-2 px-4 sm:px-5 pt-3 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Pending review</span>
          </div>
        )}

        {/* HEADER */}
        <div className="flex items-center justify-between p-4 sm:p-5 pb-3">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="relative group/avatar cursor-pointer shrink-0">
              {user?.profile_image_url ? (
                <img
                  src={user.profile_image_url}
                  alt={displayName}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 transition-transform duration-300 group-hover/avatar:scale-105"
                />
              ) : (
                <div
                  className={`h-11 w-11 rounded-full bg-gradient-to-br ${getAvatarColor(
                    user?.id || displayName,
                  )} flex items-center justify-center ring-2 ring-slate-100 dark:ring-slate-800 transition-transform duration-300 group-hover/avatar:scale-105`}
                >
                  <span className="text-white font-bold text-sm tracking-tight select-none">
                    {getInitials(user?.first_name, user?.last_name)}
                  </span>
                </div>
              )}
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base tracking-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer break-words">
                  {displayName}
                </span>

                {user?.account_type === 'professional' ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs shrink-0">
                    <Sparkles className="w-2.5 h-2.5" />
                    PRO
                  </span>
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/10 shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5 min-w-0">
                <span className="truncate max-w-[140px]">{username}</span>
                <span className="shrink-0">•</span>
                <span className="shrink-0">{formatTimeAgo(post.created_at)}</span>
                <span className="shrink-0">•</span>
                <span className="inline-flex items-center gap-0.5 shrink-0">
                  <Globe className="w-3 h-3 text-slate-400" />
                </span>
              </div>
            </div>
          </div>

          {onDelete && !isLocked && (
            <div className="relative shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMenu(!showMenu)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="Post settings"
              >
                <MoreHorizontal className="w-5 h-5" />
              </motion.button>

              <AnimatePresence>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setShowMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: 6 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 top-10 z-30 min-w-[170px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-1.5 shadow-xl backdrop-blur-xl"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onDelete(post.id);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                        <span>Delete post</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="px-4 pb-3 sm:px-5 space-y-2">
          {post.title && post.title !== post.description && (
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug break-words [overflow-wrap:anywhere]">
              {post.title}
            </h2>
          )}

          {post.description && (
            <div>
              <p
                ref={descRef}
                className={`text-sm sm:text-[15px] text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${
                  !isDescExpanded ? 'line-clamp-4' : ''
                }`}
              >
                {post.description}
              </p>

              {isDescOverflowing && (
                <button
                  type="button"
                  onClick={() => setIsDescExpanded((v) => !v)}
                  className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {isDescExpanded ? 'See less' : 'See more'}
                </button>
              )}
            </div>
          )}

          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.hashtags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => onHashtagClick?.(tag.name)}
                  className="rounded-lg bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors break-all max-w-full"
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Moderation reason (rejected) */}
        {visualState === 'rejected' && post.moderation?.reason && (
          <div className="mx-4 sm:mx-5 mb-3 text-xs text-rose-700 dark:text-rose-300 bg-rose-100/60 dark:bg-rose-950/30 rounded-lg px-3 py-2 break-words [overflow-wrap:anywhere]">
            {post.moderation.reason}
          </div>
        )}

        {/* MEDIA */}
        {primaryMedia && (
          <div className="relative w-full px-3 sm:px-4">
            {primaryMedia.media_type === 'video' ? (
              <AutoPlayVideo
                src={primaryMedia.media_url}
                onClick={() => setIsMediaOpen(true)}
                onDoubleTap={handleDoubleTap}
              />
            ) : (
              <div
                className="group relative cursor-pointer overflow-hidden rounded-2xl aspect-[4/5] sm:aspect-[16/10] max-h-[520px] flex items-center justify-center bg-slate-950"
                onClick={() => setIsMediaOpen(true)}
                onDoubleClick={handleDoubleTap}
              >
                <img
                  src={primaryMedia.media_url}
                  alt={post.title || 'Post attachment'}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/10 shadow-lg">
                  <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>View full</span>
                </div>
              </div>
            )}

            <AnimatePresence>
              {showHeartAnimation && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.25, opacity: 1 }}
                  exit={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.45, ease: 'backOut' }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                >
                  <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ACTIONS */}
        <div className="px-3 py-2 sm:px-4 mt-1 border-t border-slate-100 dark:border-slate-800/60">
          <PostActions
            post={post}
            onLike={() => onLike(post.id)}
            onCommentToggle={() => setShowComments(!showComments)}
            onShare={() => setIsShareModalOpen(true)}
            disabled={isLocked}
          />
        </div>

        {/* Retry / Dismiss */}
        {visualState === 'failed' && (
          <div className="flex gap-2 px-4 sm:px-5 py-3 border-t border-rose-100 dark:border-rose-900/50">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onRetry?.(post)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full transition shadow-md shadow-blue-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDismiss?.(post)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <X className="w-3.5 h-3.5" />
              Dismiss
            </motion.button>
          </div>
        )}

        {/* COMMENTS */}
        <AnimatePresence>
          {showComments && !isLocked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="border-t border-slate-100 dark:border-slate-800/80 px-4 pt-3 pb-4 space-y-3"
            >
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                {post.comments?.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group/comment flex items-start justify-between gap-2.5 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {comment.user?.profile_image_url ? (
                        <img
                          src={comment.user.profile_image_url}
                          alt=""
                          className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 mt-0.5 shrink-0"
                        />
                      ) : (
                        <div
                          className={`h-7 w-7 rounded-full bg-gradient-to-br ${getAvatarColor(
                            comment.user?.id || comment.id,
                          )} flex items-center justify-center ring-1 ring-slate-200 dark:ring-slate-700 mt-0.5 shrink-0`}
                        >
                          <span className="text-white font-bold text-[10px] tracking-tight select-none">
                            {getInitials(
                              comment.user?.first_name,
                              comment.user?.last_name,
                            )}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs break-words">
                          {comment.user?.first_name} {comment.user?.last_name}
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed break-words [overflow-wrap:anywhere]">
                          {comment.content}
                        </p>
                      </div>
                    </div>

                    {onDeleteComment && (
                      <button
                        type="button"
                        onClick={() => onDeleteComment(post.id, comment.id)}
                        className="opacity-0 group-hover/comment:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity shrink-0"
                        aria-label="Delete comment"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </motion.div>
                ))}

                {(!post.comments || post.comments.length === 0) && (
                  <div className="py-3 text-center">
                    <MessageCircle className="w-5 h-5 mx-auto mb-1 text-slate-300 dark:text-slate-600" />
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      No comments yet. Write the first response!
                    </p>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleCommentSubmit}
                className="flex items-center gap-2 pt-1"
              >
                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-2 pr-9 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
                  />
                  <Smile className="absolute right-3 w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors" />
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!commentText.trim()}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-500/20 disabled:opacity-40 hover:bg-blue-700 transition-all shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </article>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {isMediaOpen && primaryMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMediaOpen(false)}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4 sm:p-6 md:p-10 select-none overflow-hidden"
          >
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2.5">
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/70 backdrop-blur-md">
                Press <kbd className="font-mono text-white">ESC</kbd>
              </span>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMediaOpen(false);
                }}
                aria-label="Close lightbox"
                className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/90 shadow-xl backdrop-blur-xl hover:bg-white/20 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex items-center justify-center w-full max-w-5xl max-h-[85vh] sm:max-h-[90vh] rounded-3xl border border-white/10 bg-black/60 shadow-2xl overflow-hidden backdrop-blur-md"
            >
              {primaryMedia.media_type === 'video' ? (
                <video
                  src={primaryMedia.media_url}
                  controls
                  autoPlay
                  className="w-full h-full max-h-[85vh] sm:max-h-[90vh] object-contain rounded-3xl"
                />
              ) : (
                <img
                  src={primaryMedia.media_url}
                  alt={post.title || 'Lightbox view'}
                  className="w-full h-full max-h-[85vh] sm:max-h-[90vh] object-contain rounded-3xl"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SHARE MODAL */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        post={post}
      />
    </>
  );
};

export default PostCard;