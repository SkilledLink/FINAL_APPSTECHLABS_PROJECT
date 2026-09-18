// src/features/profile/components/ProfilePostsTab.tsx

import React, { useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageSquarePlus,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import PostCard from '../../posts/components/PostCard';
import { FeedSkeleton } from '../../posts/components/FeedSkeleton';
import { useInfiniteFeed } from '../../posts/hooks/useInfiniteFeed';
import { useFeedMutations } from '../../posts/hooks/useFeedMutations';

interface ProfilePostsTabProps {
  userId: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

const postVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 26 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -8,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
};

/* Responsive grid — 1 col mobile, 2 cols tablet, 3 cols desktop */
const GRID_CLASSES =
  'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4';

export const ProfilePostsTab: React.FC<ProfilePostsTabProps> = ({ userId }) => {
  const {
    posts,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    removePost,
    updatePostInList,
  } = useInfiniteFeed({ user_id: userId, limit: 10 });

  const { toggleLike, deletePost, createComment, deleteComment } =
    useFeedMutations();

  /* ── Like ─────────────────────────────────────────── */
  const handleLike = useCallback(
    async (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      updatePostInList({
        ...post,
        is_liked: !post.is_liked,
        likes_count: post.likes_count + (post.is_liked ? -1 : 1),
      });

      try {
        const result = await toggleLike(postId);
        updatePostInList({
          ...post,
          is_liked: result.liked,
          likes_count: post.likes_count + (result.liked ? 1 : -1),
        });
      } catch (err: any) {
        updatePostInList(post);
        toast.error(err.message || 'Failed to like post');
      }
    },
    [posts, toggleLike, updatePostInList]
  );

  /* ── Delete ───────────────────────────────────────── */
  const handleDelete = useCallback(
    async (postId: string) => {
      if (!window.confirm('Are you sure you want to delete this post?')) return;
      try {
        await deletePost(postId);
        removePost(postId);
        toast.success('Post deleted successfully');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete post');
      }
    },
    [deletePost, removePost]
  );

  /* ── Comments ─────────────────────────────────────── */
  const handleComment = useCallback(
    async (postId: string, content: string) => {
      try {
        const comment = await createComment(postId, { content });
        const post = posts.find((p) => p.id === postId);
        if (post) {
          updatePostInList({
            ...post,
            comments: [...post.comments, comment],
            comments_count: post.comments_count + 1,
          });
        }
        toast.success('Comment added');
      } catch (err: any) {
        toast.error(err.message || 'Failed to add comment');
      }
    },
    [posts, createComment, updatePostInList]
  );

  const handleDeleteComment = useCallback(
    async (postId: string, commentId: string) => {
      try {
        await deleteComment(commentId);
        const post = posts.find((p) => p.id === postId);
        if (post) {
          updatePostInList({
            ...post,
            comments: post.comments.filter((c) => c.id !== commentId),
            comments_count: Math.max(0, post.comments_count - 1),
          });
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete comment');
      }
    },
    [posts, deleteComment, updatePostInList]
  );

  /* ── Infinite scroll sentinel ─────────────────────── */
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore || !hasMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) loadMore();
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, loadingMore, hasMore, loadMore]
  );

  /* ── Initial loading skeleton ─────────────────────── */
  if (loading && posts.length === 0) {
    return (
      <div className={GRID_CLASSES}>
        <FeedSkeleton />
        <FeedSkeleton />
        <FeedSkeleton />
      </div>
    );
  }

  /* ── Error ────────────────────────────────────────── */
  if (error && !loading && posts.length === 0) {
    return (
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden my-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-gradient-to-br from-rose-50/80 via-white to-rose-50/30 dark:from-rose-950/30 dark:via-slate-900 dark:to-rose-950/10 p-5 text-center backdrop-blur-xl shadow-xs max-w-md mx-auto"
        >
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 ring-4 ring-rose-50 dark:ring-rose-950/20">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Unable to fetch posts
          </h4>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            {error}
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={refresh}
            className="mt-3.5 inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  /* ── Empty ────────────────────────────────────────── */
  if (!loading && posts.length === 0 && !error) {
    return (
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden my-4 rounded-2xl border border-dashed border-slate-300/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-8 text-center backdrop-blur-xl shadow-xs max-w-md mx-auto"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <MessageSquarePlus className="h-6 w-6" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-400 animate-pulse" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            No posts yet
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            When this user shares something, it will show up here.
          </p>
        </motion.div>
      </div>
    );
  }

  /* ── Posts grid ───────────────────────────────────── */
  return (
    <div className="w-full space-y-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={GRID_CLASSES}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {posts.map((post) => (
            <motion.div
              key={post._tempId ?? post.id}
              layout
              variants={postVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-200 overflow-hidden"
            >
              <PostCard
                post={post}
                onLike={handleLike}
                onDelete={handleDelete}
                onComment={handleComment}
                onDeleteComment={handleDeleteComment}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex min-h-[40px] items-center justify-center py-3"
        >
          {loadingMore && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:text-slate-300"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400" />
              <span>Loading more posts...</span>
            </motion.div>
          )}
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="py-4 text-center"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100/80 px-3.5 py-1 text-xs font-medium text-slate-600 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>You're all caught up</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePostsTab;