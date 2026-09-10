import React, { useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  RefreshCw,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  MessageSquarePlus,
  Loader2,
  X,
  Filter,
} from 'lucide-react';
import PostComposer from './PostComposer';
import PostCard from './PostCard';
import { FeedSkeleton } from './FeedSkeleton';
import { useInfiniteFeed } from '../hooks/useInfiniteFeed';
import { useFeedMutations } from '../hooks/useFeedMutations';
import { useFeedFilters } from '../hooks/useFeedFilters';

// Motion Animation Configurations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

const postVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 26,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -8,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
};

const Feed: React.FC = () => {
  const { filters, setHashtag, clearFilters } = useFeedFilters();

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
  } = useInfiniteFeed({ ...filters, limit: 10 });

  const { toggleLike, deletePost, createComment, deleteComment } =
    useFeedMutations();

  // ─── Like ──────────────────────────────────────────────
  const handleLike = useCallback(
    async (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      // Optimistic update
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

  // ─── Delete ────────────────────────────────────────────
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

  // ─── Comment ───────────────────────────────────────────
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

  // ─── Infinite scroll ───────────────────────────────────
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore || !hasMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, loadingMore, hasMore, loadMore]
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-1 sm:px-2 pb-6 overflow-x-hidden space-y-4">
      {/* ─── Sticky Post Composer Wrapper ─────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="sticky top-0 z-30 -mx-1 sm:-mx-2 px-1 sm:px-2 py-2 bg-slate-50/80 dark:bg-[#0b1329]/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-800/60 transition-all duration-300 shadow-xs"
      >
        <PostComposer onPosted={refresh} />

        {/* Active Filter Pill Bar */}
        <AnimatePresence>
          {filters?.hashtag && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-blue-500/10 px-3 py-1.5 border border-blue-500/20 text-xs font-medium text-blue-600 dark:text-blue-400 overflow-hidden"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Filter className="w-3.5 h-3.5 shrink-0" />
                <span>Filtering by:</span>
                <span className="font-bold underline underline-offset-2">#{filters.hashtag}</span>
              </div>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-md p-0.5 hover:bg-blue-500/20 transition-colors"
                title="Clear filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── Loading Skeletons ───────────────────────────── */}
      {loading && posts.length === 0 && (
        <div className="space-y-4">
          <FeedSkeleton />
          <FeedSkeleton />
          <FeedSkeleton />
        </div>
      )}

      {/* ─── Error Alert State ──────────────────────────── */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden my-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-gradient-to-br from-rose-50/80 via-white to-rose-50/30 dark:from-rose-950/30 dark:via-slate-900 dark:to-rose-950/10 p-5 text-center backdrop-blur-xl shadow-xs"
        >
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 ring-4 ring-rose-50 dark:ring-rose-950/20">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Unable to fetch feed updates
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
            Try Refreshing Feed
          </motion.button>
        </motion.div>
      )}

      {/* ─── Empty Feed State ────────────────────────────── */}
      {!loading && posts.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden my-4 rounded-2xl border border-dashed border-slate-300/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-8 text-center backdrop-blur-xl shadow-xs"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <MessageSquarePlus className="h-6 w-6" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-400 animate-pulse" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Your feed is currently quiet
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            {filters?.hashtag
              ? `No posts found with hashtag #${filters.hashtag}. Try clearing your search.`
              : 'Be the first professional to share an update, showcase work, or ask a question!'}
          </p>
          {filters?.hashtag && (
            <button
              onClick={clearFilters}
              className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear Filter
            </button>
          )}
        </motion.div>
      )}

      {/* ─── Feed Posts List ────────────────────────────── */}
      {posts.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {posts.map((post) => (
              <motion.div
                key={post.id}
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
                  onHashtagClick={setHashtag}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ─── Infinite Scroll Loader ──────────── */}
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
              <span>Loading more updates...</span>
            </motion.div>
          )}
        </div>
      )}

      {/* ─── End of Feed Indicator ──────────────────────── */}
      {!hasMore && posts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="py-4 text-center"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100/80 px-3.5 py-1 text-xs font-medium text-slate-600 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>You're all caught up for now</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Feed;