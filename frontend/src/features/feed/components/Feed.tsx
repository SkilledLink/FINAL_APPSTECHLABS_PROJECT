import React, { useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import FeedHeader from './FeedHeader';
import PostComposer from './PostComposer';
import PostCard from './PostCard';
import { FeedSkeleton } from './FeedSkeleton';
import { useInfiniteFeed } from '../hooks/useInfiniteFeed';
import { useFeedMutations } from '../hooks/useFeedMutations';
import { useFeedFilters } from '../hooks/useFeedFilters';
import type { Feed as FeedType } from '../types/feed.types';

const Feed: React.FC = () => {
  const { filters, setHashtag } = useFeedFilters();
  const {
    feeds,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    prependFeed,
    removeFeed,
    updateFeedInList,
    replaceFeed,
    markFeedFailed,
    markFeedUploading,
  } = useInfiniteFeed({ ...filters, limit: 10 });

  const { deleteFeed, toggleLike, createComment, deleteComment } = useFeedMutations();

  // ─── Retry registry for optimistic posts ────────────────
  // Maps tempId -> the function that re-fires the create request.
  const retryRef = useRef<Map<string, () => void>>(new Map());

  // ─── Revoke blob URLs on unmount to avoid memory leaks ──
  useEffect(() => {
    const map = retryRef.current;
    return () => {
      map.clear();
    };
  }, []);

  // ─── New post: optimistic insert ────────────────────────
  const handleOptimisticCreate = useCallback(
    (tempFeed: FeedType, retry: () => void) => {
      prependFeed(tempFeed);
      if (tempFeed._tempId) {
        retryRef.current.set(tempFeed._tempId, retry);
      }
    },
    [prependFeed],
  );

  // ─── New post: server responded with the real feed ──────
  const handleCreateSuccess = useCallback(
    (tempId: string, realFeed: FeedType) => {
      // Revoke the temp media blob URL now that we have the real one.
      const temp = feeds.find((f) => f._tempId === tempId);
      const tempMediaUrl = temp?.media?.[0]?.media_url;
      if (tempMediaUrl && tempMediaUrl.startsWith('blob:')) {
        URL.revokeObjectURL(tempMediaUrl);
      }

      // Swap in place — no reload, no scroll jump.
      replaceFeed(tempId, realFeed);
      retryRef.current.delete(tempId);

      // Fire the right toast based on moderation.
      const decision = realFeed.moderation?.decision;
      const status = realFeed.status;

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
    },
    [feeds, replaceFeed],
  );

  // ─── New post: request failed ───────────────────────────
  const handleCreateError = useCallback(
    (tempId: string, err: Error) => {
      markFeedFailed(tempId);
      toast.error(err.message || 'Failed to create post');
    },
    [markFeedFailed],
  );

  // ─── Retry a failed optimistic post ─────────────────────
  const handleRetryPost = useCallback(
    (feed: FeedType) => {
      const tempId = feed._tempId;
      if (!tempId) return;
      const retry = retryRef.current.get(tempId);
      if (!retry) {
        toast.error('Cannot retry this post anymore');
        return;
      }
      markFeedUploading(tempId);
      retry();
    },
    [markFeedUploading],
  );

  // ─── Dismiss a failed optimistic post ───────────────────
  const handleDismissPost = useCallback(
    (feed: FeedType) => {
      const mediaUrl = feed.media?.[0]?.media_url;
      if (mediaUrl && mediaUrl.startsWith('blob:')) {
        URL.revokeObjectURL(mediaUrl);
      }
      if (feed._tempId) {
        retryRef.current.delete(feed._tempId);
      }
      removeFeed(feed.id);
    },
    [removeFeed],
  );

  // ─── Like toggle ────────────────────────────────────────
  const handleLike = async (feedId: string) => {
    try {
      const result = await toggleLike(feedId);
      const feed = feeds.find((f) => f.id === feedId);
      if (feed) {
        updateFeedInList({
          ...feed,
          is_liked: result.liked,
          likes_count: feed.likes_count + (result.liked ? 1 : -1),
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to like');
    }
  };

  // ─── Delete feed ────────────────────────────────────────
  const handleDelete = async (feedId: string) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deleteFeed(feedId);
      removeFeed(feedId);
      toast.success('Post deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  // ─── Comment ────────────────────────────────────────────
  const handleComment = async (feedId: string, content: string) => {
    try {
      const comment = await createComment(feedId, { content });
      const feed = feeds.find((f) => f.id === feedId);
      if (feed) {
        updateFeedInList({
          ...feed,
          comments: [...feed.comments, comment],
          comments_count: feed.comments_count + 1,
        });
      }
      toast.success('Comment added');
    } catch (err: any) {
      toast.error(err.message || 'Failed to comment');
    }
  };

  const handleDeleteComment = async (feedId: string, commentId: string) => {
    try {
      await deleteComment(commentId);
      const feed = feeds.find((f) => f.id === feedId);
      if (feed) {
        updateFeedInList({
          ...feed,
          comments: feed.comments.filter((c) => c.id !== commentId),
          comments_count: Math.max(0, feed.comments_count - 1),
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete comment');
    }
  };

  // ─── Load more (infinite scroll) ────────────────────────
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, loadingMore, hasMore, loadMore],
  );

  // ─── Render ─────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto p-4">
      <FeedHeader onSelectHashtag={setHashtag} />

      <PostComposer
        onOptimisticCreate={handleOptimisticCreate}
        onCreateSuccess={handleCreateSuccess}
        onCreateError={handleCreateError}
      />

      {loading && feeds.length === 0 && (
        <>
          <FeedSkeleton />
          <FeedSkeleton />
          <FeedSkeleton />
        </>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          <button
            onClick={refresh}
            className="mt-2 px-4 py-1.5 bg-red-600 text-white text-xs rounded-full hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && feeds.length === 0 && !error && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-gray-200 dark:border-slate-700">
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            No posts yet. Be the first to post!
          </p>
        </div>
      )}

      <div className="space-y-4 mt-4">
        {feeds.map((feed) => (
          <PostCard
            key={feed._tempId ?? feed.id}
            feed={feed}
            onLike={handleLike}
            onDelete={handleDelete}
            onComment={handleComment}
            onDeleteComment={handleDeleteComment}
            onHashtagClick={setHashtag}
            onRetry={handleRetryPost}
            onDismiss={handleDismissPost}
          />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-6 flex justify-center">
          {loadingMore && (
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          )}
        </div>
      )}

      {!hasMore && feeds.length > 0 && (
        <p className="text-center text-xs text-gray-400 dark:text-slate-500 py-6">
          You've reached the end
        </p>
      )}
    </div>
  );
};

export default Feed;