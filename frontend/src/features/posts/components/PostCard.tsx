// src/features/posts/components/PostCard.tsx

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
  Smile,
  Globe,
  Loader2,
  AlertTriangle,
  RefreshCw,
  XCircle,
  Play,
  Share2,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import ShareModal from './ShareModal';
import ProfileLink from '../../profile/components/ProfileLink';
import VerifiedBadge from '../../subscription/components/VerifiedBadge';
import { readTierBadge } from '../../subscription/tierCache';
import type { TierInfo } from '../../subscription/types/subscription.types';
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
  canDelete?: boolean;
}

type VisualState = 'normal' | 'uploading' | 'failed' | 'rejected' | 'pending';

type IdentityFields = {
  id?: string | number;
  user_id?: string | number;
  userId?: string | number;
};

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

function cachedTierToTierInfo(raw: {
  tier_id: string;
  level: number;
  name: string;
  badge_name?: string | null;
  badge_code?: string | null;
  badge_icon?: string | null;
  badge_color?: string | null;
  badge_secondary_color?: string | null;
  badge_shape?: string | null;
}): TierInfo {
  return {
    id: raw.tier_id,
    name: raw.name,
    level: raw.level,
    badge_name: raw.badge_name ?? null,
    badge_code: raw.badge_code ?? null,
    badge_icon: raw.badge_icon ?? null,
    badge_color: raw.badge_color ?? null,
    badge_secondary_color: raw.badge_secondary_color ?? null,
    badge_shape: raw.badge_shape ?? null,
  } as TierInfo;
}

const readStoredUserId = (): string | null => {
  try {
    for (const key of ['current_user', 'currentUser', 'user', 'auth_user', 'authUser']) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.id) return String(parsed.id);
          if (parsed?.user?.id) return String(parsed.user.id);
        } catch { /* ignore */ }
      }
    }
    const token = localStorage.getItem('access_token');
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          if (payload?.sub) return String(payload.sub);
          if (payload?.user_id) return String(payload.user_id);
          if (payload?.id) return String(payload.id);
        } catch { /* ignore */ }
      }
    }
  } catch { /* ignore */ }
  return null;
};

const getInitials = (first?: string, last?: string): string => {
  const a = (first || '').trim().charAt(0);
  const b = (last || '').trim().charAt(0);
  return (a + b).toUpperCase() || '?';
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
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const formatCount = (n: number): string => {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
};

const AutoPlayVideo: React.FC<{
  src: string;
  onClick: () => void;
  onDoubleTap: (e: React.MouseEvent) => void;
}> = ({ src, onClick, onDoubleTap }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().then(() => { setIsPlaying(true); setHasStarted(true); }).catch(() => {
              video.muted = true;
              setIsMuted(true);
              video.play().then(() => { setIsPlaying(true); setHasStarted(true); }).catch(() => {});
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
      className="group/video relative w-full overflow-hidden rounded-2xl bg-slate-950 aspect-[4/5] sm:aspect-[16/10] max-h-[580px] flex items-center justify-center cursor-pointer select-none"
    >
      <video
        ref={videoRef}
        src={src}
        loop
        muted={isMuted}
        playsInline
        className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover/video:scale-[1.02]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70 group-hover/video:opacity-100 transition-opacity duration-300 pointer-events-none" />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur-md border border-white/25 shadow-2xl">
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </div>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-3 flex items-center justify-between px-3 pointer-events-none">
        <div className="flex items-center gap-2">
          {hasStarted && isPlaying && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/70 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white backdrop-blur-lg border border-white/15 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="uppercase">Playing</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/70 text-white backdrop-blur-lg border border-white/15 hover:bg-slate-900 hover:scale-105 active:scale-95 transition-all z-10 shadow-lg"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ActionBtnProps {
  icon: React.ReactNode;
  label?: string;
  onClick: () => void;
  active?: boolean;
  activeColor?: 'rose' | 'blue';
  disabled?: boolean;
  ariaLabel?: string;
}

const ActionBtn: React.FC<ActionBtnProps> = ({
  icon, label, onClick, active = false, activeColor = 'rose', disabled = false, ariaLabel,
}) => {
  const activeText = activeColor === 'rose' ? 'text-rose-500' : 'text-blue-500';
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`group/action flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
        active
          ? `${activeText} hover:bg-slate-100 dark:hover:bg-slate-800/60`
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
      }`}
    >
      <span className="transition-transform duration-200 group-hover/action:scale-110">{icon}</span>
      {label && <span className="tabular-nums tracking-tight">{label}</span>}
    </motion.button>
  );
};

export const PostCard: React.FC<PostCardProps> = ({
  post, onLike, onDelete, onComment, onDeleteComment, onHashtagClick, onRetry, onDismiss, canDelete = false,
}) => {
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [currentTime, setCurrentTime] = useState<number | null>(null);

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

  const [authorTier, setAuthorTier] = useState<TierInfo | null>(null);
  useEffect(() => {
    if (!user?.id) { setAuthorTier(null); return; }
    const cached = readTierBadge(String(user.id));
    setAuthorTier(cached ? cachedTierToTierInfo(cached) : null);
  }, [user?.id]);

  /* ── Author KYC state — comes from user payload if present. ── */
  const authorKyc = (() => {
    const u = user as unknown as Record<string, unknown> | undefined;
    if (!u) return null;
    if (typeof u.is_verified === 'boolean') return u.is_verified;
    if (typeof u.isVerified === 'boolean') return u.isVerified;
    const prof = (u as any).professional;
    if (prof && typeof prof.isVerified === 'boolean') return prof.isVerified;
    if (prof && typeof prof.is_verified === 'boolean') return prof.is_verified;
    return null;
  })();

  const primaryMedia = post.media?.[0];
  const visualState = getVisualState(post);
  const isLocked = visualState !== 'normal';

  const storedUserId = readStoredUserId();
  const userIdentity = user as unknown as IdentityFields;
  const postIdentity = post as unknown as IdentityFields;
  const postAuthorId =
    userIdentity.id ?? userIdentity.user_id ?? postIdentity.user_id ?? postIdentity.userId ?? null;
  const isOwner =
    !!storedUserId && !!postAuthorId && String(storedUserId) === String(postAuthorId);
  const effectiveCanDelete = canDelete || isOwner;
  const showDelete = effectiveCanDelete && !isLocked && !!onDelete;

  const p = post as unknown as Record<string, unknown>;
  const likesArr = Array.isArray(p.likes) ? (p.likes as unknown[]) : null;

  const isLiked = Boolean(
    p.is_liked ?? p.liked_by_me ?? p.isLiked ?? p.has_liked ??
      (likesArr && storedUserId
        ? likesArr.some((l) => {
            const item = l as Record<string, unknown>;
            return String(item?.user_id ?? item?.userId ?? item?.id ?? '') === String(storedUserId);
          })
        : false)
  );

  const likeCount: number =
    (typeof p.likes_count === 'number' && (p.likes_count as number)) ||
    (typeof p.like_count === 'number' && (p.like_count as number)) ||
    (likesArr ? likesArr.length : 0);

  const commentCount: number =
    post.comments?.length ??
    (typeof p.comments_count === 'number' ? (p.comments_count as number) : 0);

  useEffect(() => {
    const updateCurrentTime = () => setCurrentTime(Date.now());
    updateCurrentTime();
    const intervalId = window.setInterval(updateCurrentTime, 60000);
    return () => window.clearInterval(intervalId);
  }, []);

  const formatTimeAgo = (dateStr: string) => {
    const diff = (currentTime ?? new Date(dateStr).getTime()) - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape' && isMediaOpen) setIsMediaOpen(false); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMediaOpen]);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    const check = () => {
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
      case 'uploading': return 'opacity-85';
      case 'failed': return 'border-rose-200/70 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10';
      case 'rejected': return 'border-rose-200/70 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/15';
      case 'pending': return 'border-amber-200/70 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/15';
      default: return '';
    }
  })();

  const statusBanner = (() => {
    switch (visualState) {
      case 'uploading':
        return { icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, text: 'Posting…', cls: 'text-blue-600 dark:text-blue-400' };
      case 'failed':
        return { icon: <AlertTriangle className="w-3.5 h-3.5" />, text: 'Failed to post', cls: 'text-rose-600 dark:text-rose-400' };
      case 'rejected':
        return { icon: <XCircle className="w-3.5 h-3.5" />, text: 'Post rejected', cls: 'text-rose-600 dark:text-rose-400' };
      case 'pending':
        return { icon: <AlertTriangle className="w-3.5 h-3.5" />, text: 'Pending review', cls: 'text-amber-600 dark:text-amber-400' };
      default: return null;
    }
  })();

  return (
    <>
      <article className={`group/card relative w-full overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 hover:border-slate-300/80 dark:hover:border-slate-700/80 hover:shadow-[0_10px_40px_-12px_rgba(15,23,42,0.15)] dark:hover:shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)] mb-4 ${containerCls}`}>
        {statusBanner && (
          <div className={`flex items-center gap-2 px-4 sm:px-5 py-2 text-[11px] font-bold tracking-wide uppercase border-b border-slate-100 dark:border-slate-800/60 ${statusBanner.cls}`}>
            {statusBanner.icon}
            <span>{statusBanner.text}</span>
          </div>
        )}

        <div className="flex items-start justify-between gap-3 px-4 sm:px-5 pt-4 pb-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <ProfileLink
              userId={user?.id}
              ariaLabel={`View ${displayName}'s profile`}
              className="relative group/avatar cursor-pointer shrink-0 inline-block"
            >
              {user?.profile_image_url ? (
                <img
                  src={user.profile_image_url}
                  alt={displayName}
                  className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200/70 dark:ring-slate-700/70 transition-transform duration-300 group-hover/avatar:scale-105"
                />
              ) : (
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${getAvatarColor(user?.id || displayName)} flex items-center justify-center ring-1 ring-slate-200/70 dark:ring-slate-700/70 transition-transform duration-300 group-hover/avatar:scale-105`}>
                  <span className="text-white font-bold text-[13px] tracking-tight select-none">
                    {getInitials(user?.first_name, user?.last_name)}
                  </span>
                </div>
              )}
            </ProfileLink>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <ProfileLink
                  userId={user?.id}
                  className="font-semibold text-[14.5px] text-slate-900 dark:text-slate-100 tracking-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer break-words leading-tight"
                >
                  {displayName}
                </ProfileLink>

                {/* Tier badge from cache — only badge next to name. */}
                {authorTier && <VerifiedBadge tier={authorTier} size="sm" />}

                {user?.account_type === 'professional' && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-1.5 py-[2px] text-[9px] font-bold text-white shadow-sm shrink-0 tracking-wide">
                    <Sparkles className="w-2.5 h-2.5" />
                    PRO
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[12px] text-slate-500 dark:text-slate-500 font-medium mt-0.5 min-w-0">
                <ProfileLink
                  userId={user?.id}
                  className="truncate max-w-[140px] inline-block hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {username}
                </ProfileLink>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="shrink-0">{formatTimeAgo(post.created_at)}</span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <Globe className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
              </div>

              {/* Identity chip — shown when the author is a professional. */}
              {authorKyc !== null && (
                <div className="mt-1.5">
                  {authorKyc ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-900/60 text-[9px] font-bold uppercase tracking-wide">
                      <ShieldCheck size={9} />
                      Identity verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-900/60 text-[9px] font-bold uppercase tracking-wide">
                      <ShieldAlert size={9} />
                      Unverified identity
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {showDelete && (
            <div className="relative shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMenu((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="Post options"
                aria-haspopup="menu"
                aria-expanded={showMenu}
              >
                <MoreHorizontal className="w-[18px] h-[18px]" />
              </motion.button>

              <AnimatePresence>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.94, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.94, y: 4 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 top-9 z-30 min-w-[168px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-1 shadow-xl backdrop-blur-xl"
                    >
                      <button
                        type="button"
                        onClick={() => { setShowMenu(false); onDelete!(post.id); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete post</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {(post.title || post.description || (post.hashtags && post.hashtags.length > 0)) && (
          <div className="px-4 sm:px-5 pb-3 space-y-2">
            {post.title && post.title !== post.description && (
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug break-words [overflow-wrap:anywhere]">
                {post.title}
              </h2>
            )}
            {post.description && (
              <div>
                <p ref={descRef} className={`text-[14.5px] text-slate-700 dark:text-slate-300 leading-[1.6] whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${!isDescExpanded ? 'line-clamp-5' : ''}`}>
                  {post.description}
                </p>
                {isDescOverflowing && (
                  <button
                    type="button"
                    onClick={() => setIsDescExpanded((v) => !v)}
                    className="mt-1 text-[12px] font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {isDescExpanded ? 'See less' : 'See more'}
                  </button>
                )}
              </div>
            )}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {post.hashtags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => onHashtagClick?.(tag.name)}
                    className="rounded-md bg-blue-50/80 dark:bg-blue-950/30 px-2 py-[3px] text-[11.5px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors break-all max-w-full"
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {visualState === 'rejected' && post.moderation?.reason && (
          <div className="mx-4 sm:mx-5 mb-3 text-[12px] text-rose-700 dark:text-rose-300 bg-rose-50/80 dark:bg-rose-950/30 rounded-lg px-3 py-2 break-words [overflow-wrap:anywhere] border border-rose-100 dark:border-rose-900/40">
            {post.moderation.reason}
          </div>
        )}

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
                className="group/media relative cursor-pointer overflow-hidden rounded-2xl aspect-[4/5] sm:aspect-[16/10] max-h-[580px] flex items-center justify-center bg-slate-950"
                onClick={() => setIsMediaOpen(true)}
                onDoubleClick={handleDoubleTap}
              >
                <img
                  src={primaryMedia.media_url}
                  alt={post.title || 'Post attachment'}
                  className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover/media:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-slate-900/70 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-lg opacity-0 group-hover/media:opacity-100 translate-y-1 group-hover/media:translate-y-0 transition-all duration-300 border border-white/10 shadow-lg">
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

        <div className="flex items-center gap-0.5 px-2 sm:px-3 py-1.5 mt-1 border-t border-slate-100 dark:border-slate-800/60">
          <ActionBtn
            ariaLabel={isLiked ? 'Unlike' : 'Like'}
            icon={
              <Heart
                className={`w-[18px] h-[18px] transition-all duration-200 ${
                  isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-500 dark:text-slate-400'
                }`}
              />
            }
            label={likeCount > 0 ? formatCount(likeCount) : 'Like'}
            onClick={() => !isLocked && onLike(post.id)}
            active={isLiked}
            activeColor="rose"
            disabled={isLocked}
          />
          <ActionBtn
            ariaLabel="Comments"
            icon={
              <MessageCircle
                className={`w-[18px] h-[18px] transition-all duration-200 ${
                  showComments ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400'
                }`}
              />
            }
            label={commentCount > 0 ? formatCount(commentCount) : 'Comment'}
            onClick={() => setShowComments((v) => !v)}
            active={showComments}
            activeColor="blue"
            disabled={isLocked}
          />
          <ActionBtn
            ariaLabel="Share"
            icon={<Share2 className="w-[18px] h-[18px] text-slate-500 dark:text-slate-400" />}
            label="Share"
            onClick={() => setIsShareModalOpen(true)}
            disabled={isLocked}
          />
        </div>

        {visualState === 'failed' && (
          <div className="flex gap-2 px-4 sm:px-5 py-3 border-t border-rose-100 dark:border-rose-900/40">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onRetry?.(post)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition shadow-sm shadow-blue-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDismiss?.(post)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <X className="w-3.5 h-3.5" />
              Dismiss
            </motion.button>
          </div>
        )}

        <AnimatePresence>
          {showComments && !isLocked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="border-t border-slate-100 dark:border-slate-800/70 px-4 pt-3.5 pb-4 space-y-3 bg-slate-50/40 dark:bg-slate-950/20"
            >
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                {post.comments?.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group/comment flex items-start justify-between gap-2.5 bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <ProfileLink
                        userId={comment.user?.id}
                        ariaLabel={`View ${comment.user?.first_name ?? ''} ${comment.user?.last_name ?? ''}'s profile`.trim()}
                        className="mt-0.5 shrink-0 inline-block"
                      >
                        {comment.user?.profile_image_url ? (
                          <img
                            src={comment.user.profile_image_url}
                            alt=""
                            className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200/80 dark:ring-slate-700/80"
                          />
                        ) : (
                          <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${getAvatarColor(comment.user?.id || comment.id)} flex items-center justify-center ring-1 ring-slate-200/80 dark:ring-slate-700/80`}>
                            <span className="text-white font-bold text-[10px] tracking-tight select-none">
                              {getInitials(comment.user?.first_name, comment.user?.last_name)}
                            </span>
                          </div>
                        )}
                      </ProfileLink>
                      <div className="flex-1 min-w-0">
                        <ProfileLink
                          userId={comment.user?.id}
                          className="font-semibold text-slate-900 dark:text-slate-100 text-[12px] break-words hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {comment.user?.first_name} {comment.user?.last_name}
                        </ProfileLink>
                        <p className="text-[12.5px] text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed break-words [overflow-wrap:anywhere]">
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
                  <div className="py-4 text-center">
                    <MessageCircle className="w-5 h-5 mx-auto mb-1.5 text-slate-300 dark:text-slate-600" />
                    <p className="text-[12px] text-slate-400 dark:text-slate-500">
                      No comments yet. Be the first!
                    </p>
                  </div>
                )}
              </div>

              <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-1">
                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    placeholder="Write a comment…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/80 px-4 py-2 pr-9 text-[12.5px] font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                  />
                  <Smile className="absolute right-3 w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!commentText.trim()}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-500 transition-all shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </article>

      <AnimatePresence>
        {isMediaOpen && primaryMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMediaOpen(false)}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/92 backdrop-blur-2xl p-4 sm:p-6 md:p-10 select-none overflow-hidden"
          >
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2.5">
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/70 backdrop-blur-md">
                Press <kbd className="font-mono text-white">ESC</kbd>
              </span>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={(e) => { e.stopPropagation(); setIsMediaOpen(false); }}
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
              className="relative flex items-center justify-center w-full max-w-5xl max-h-[85vh] sm:max-h-[90vh] rounded-2xl border border-white/10 bg-black/60 shadow-2xl overflow-hidden backdrop-blur-md"
            >
              {primaryMedia.media_type === 'video' ? (
                <video
                  src={primaryMedia.media_url}
                  controls
                  autoPlay
                  className="w-full h-full max-h-[85vh] sm:max-h-[90vh] object-contain rounded-2xl"
                />
              ) : (
                <img
                  src={primaryMedia.media_url}
                  alt={post.title || 'Lightbox view'}
                  className="w-full h-full max-h-[85vh] sm:max-h-[90vh] object-contain rounded-2xl"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        post={post}
      />
    </>
  );
};

export default PostCard;