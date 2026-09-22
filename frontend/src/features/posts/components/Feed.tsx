// src/features/posts/components/Feed.tsx

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
import type { Post } from '../types/post.types';

/* ─────────────── animation variants ─────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

const postVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 320, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -6,
    transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
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
    prependPost,
    replacePost,
    markPostFailed,
    markPostUploading,
  } = useInfiniteFeed({ ...filters, limit: 10 });

  const { toggleLike, deletePost, createComment, deleteComment } =
    useFeedMutations();

  const retryRef = useRef<Map<string, () => void>>(new Map());

  /* ── create pipeline ── */

  const handleOptimisticCreate = useCallback(
    (tempPost: Post, retry: () => void) => {
      prependPost(tempPost);
      if (tempPost._tempId) {
        retryRef.current.set(tempPost._tempId, retry);
      }
    },
    [prependPost]
  );

  const handleCreateSuccess = useCallback(
    (tempId: string, realPost: Post) => {
      const tempUrl = realPost.media?.[0]?.media_url;

      replacePost(tempId, realPost);
      retryRef.current.delete(tempId);

      const decision = realPost.moderation?.decision;
      const status = realPost.status;

      if (decision === 'unsafe' || status === 'rejected') {
        toast.error('Your post was rejected');
      } else if (
        decision === 'review' ||
        status === 'pending_review' ||
        status === 'pending_moderation'
      ) {
        toast.info('Your post is being reviewed');
      } else {
        toast.success('Post created');
      }

      if (tempUrl && tempUrl.startsWith('blob:')) {
        URL.revokeObjectURL(tempUrl);
      }
    },
    [replacePost]
  );

  const handleCreateError = useCallback(
    (tempId: string, err: Error) => {
      markPostFailed(tempId);
      toast.error(err.message || 'Failed to create post');
    },
    [markPostFailed]
  );

  const handleRetryPost = useCallback(
    (post: Post) => {
      const tempId = post._tempId;
      if (!tempId) return;
      const retry = retryRef.current.get(tempId);
      if (!retry) {
        toast.error('Cannot retry this post anymore');
        return;
      }
      markPostUploading(tempId);
      retry();
    },
    [markPostUploading]
  );

  const handleDismissPost = useCallback(
    (post: Post) => {
      const mediaUrl = post.media?.[0]?.media_url;
      if (mediaUrl && mediaUrl.startsWith('blob:')) {
        URL.revokeObjectURL(mediaUrl);
      }
      if (post._tempId) {
        retryRef.current.delete(post._tempId);
      }
      removePost(post.id);
    },
    [removePost]
  );

  /* ── interactions ── */

  const handleLike = useCallback(
    async (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      updatePostInList({
        ...post,
        is_liked: !post.is_liked,
        likes_count: (post.likes_count ?? 0) + (post.is_liked ? -1 : 1),
      });

      try {
        const result = await toggleLike(postId);
        updatePostInList({
          ...post,
          is_liked: result.liked,
          likes_count: (post.likes_count ?? 0) + (result.liked ? 1 : -1),
        });
      } catch (err: any) {
        updatePostInList(post);
        toast.error(err.message || 'Failed to like post');
      }
    },
    [posts, toggleLike, updatePostInList]
  );

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

  const handleComment = useCallback(
    async (postId: string, content: string) => {
      try {
        const comment = await createComment(postId, { content });
        const post = posts.find((p) => p.id === postId);
        if (post) {
          updatePostInList({
            ...post,
            comments: [...(post.comments ?? []), comment],
            comments_count: (post.comments_count ?? 0) + 1,
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
            comments: (post.comments ?? []).filter((c) => c.id !== commentId),
            comments_count: Math.max(0, (post.comments_count ?? 0) - 1),
          });
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete comment');
      }
    },
    [posts, deleteComment, updatePostInList]
  );

  /* ── infinite scroll ── */

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore || !hasMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMore();
          }
        },
        { rootMargin: '200px' }
      );

      if (node) observerRef.current.observe(node);
    },
    [loading, loadingMore, hasMore, loadMore]
  );

  const isEmpty = !loading && posts.length === 0 && !error;
  const showLoadMore = hasMore && posts.length > 0;

  return (
    <div className="w-full overflow-x-hidden pb-6">
      {/* ── Sticky composer + filter ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="sticky top-0 z-30 -mx-3 sm:mx-0 px-3 sm:px-0 bg-slate-50/85 dark:bg-slate-950/85 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-800/60"
      >
        <div className="py-2">
          <PostComposer
            onOptimisticCreate={handleOptimisticCreate}
            onCreateSuccess={handleCreateSuccess}
            onCreateError={handleCreateError}
          />
        </div>

        <AnimatePresence initial={false}>
          {filters?.hashtag && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-blue-500/[0.08] px-3 py-1.5 border border-blue-500/15 text-[12px] font-medium text-blue-700 dark:text-blue-300">
                <div className="flex items-center gap-1.5 truncate">
                  <Filter className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-blue-600/80 dark:text-blue-400/80">
                    Filtering:
                  </span>
                  <span className="font-bold truncate">
                    #{filters.hashtag}
                  </span>
                </div>
                <button
                  onClick={clearFilters}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md p-0.5 hover:bg-blue-500/15 transition-colors"
                  title="Clear filter"
                  aria-label="Clear filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Spacer below sticky ── */}
      <div className="h-3" />

      {/* ── Loading skeletons ── */}
      {loading && posts.length === 0 && (
        <div>
          {Array.from({ length: 3 }).map((_, i) => (
            <FeedSkeleton key={i} />
          ))}
        </div>
      )}

      {/* ── Error state ── */}
      {error && !loading && posts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md rounded-2xl border border-rose-200/70 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-6 text-center backdrop-blur-sm"
        >
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h4 className="text-[14px] font-bold text-slate-900 dark:text-slate-100">
            Couldn&apos;t load your feed
          </h4>
          <p className="mt-1 text-[12.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
            {error}
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={refresh}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-[12.5px] font-semibold text-white shadow-sm shadow-blue-500/20 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </motion.button>
        </motion.div>
      )}

      {/* ── Empty state ── */}
      {isEmpty && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-dashed border-slate-300/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 p-8 text-center backdrop-blur-sm"
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 dark:bg-blue-500/[0.06] blur-3xl" />

          <div className="relative mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <MessageSquarePlus className="h-5.5 w-5.5" />
            <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-amber-400 animate-pulse" />
          </div>

          <h3 className="relative text-[14.5px] font-bold text-slate-900 dark:text-slate-100">
            {filters?.hashtag
              ? `No posts with #${filters.hashtag}`
              : 'Your feed is quiet'}
          </h3>
          <p className="relative mt-1 text-[12.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {filters?.hashtag
              ? 'Try clearing the filter to see everything again.'
              : 'Be the first to share an update, showcase work, or ask a question.'}
          </p>

          {filters?.hashtag && (
            <button
              onClick={clearFilters}
              className="relative mt-3.5 inline-flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/[0.08] px-3 py-1.5 text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/15 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear filter
            </button>
          )}
        </motion.div>
      )}

      {/* ── Feed list ── */}
      {posts.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
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
              >
                <PostCard
                  post={post}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onComment={handleComment}
                  onDeleteComment={handleDeleteComment}
                  onHashtagClick={setHashtag}
                  onRetry={handleRetryPost}
                  onDismiss={handleDismissPost}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Load more trigger (only when there are posts) ── */}
      {showLoadMore && (
        <div
          ref={loadMoreRef}
          className="flex min-h-[44px] items-center justify-center py-3"
        >
          {loadingMore && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 px-3.5 py-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-400 shadow-sm backdrop-blur-xl"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400" />
              <span>Loading more…</span>
            </motion.div>
          )}
        </div>
      )}

      {/* ── End of feed (only when there are posts) ── */}
      {!hasMore && posts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex justify-center pt-4 pb-2"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-slate-100/70 dark:bg-slate-800/50 px-3.5 py-1.5 text-[12px] font-medium text-slate-500 dark:text-slate-400 backdrop-blur-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>You&apos;re all caught up</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Feed;