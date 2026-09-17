import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { MessageSquare, Sparkles, ChevronDown } from 'lucide-react';
import type { Post } from '../types/post.types';
import PostCard from './PostCard';
import { FeedSkeleton } from './FeedSkeleton';

interface FeedListProps {
  posts: Post[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void;
  onComment?: (postId: string, content: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
  onHashtagClick?: (hashtag: string) => void;
  emptyMessage?: string;
}

// Motion Animation Configurations
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 26,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -8,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
};

export const FeedList: React.FC<FeedListProps> = ({
  posts,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onLike,
  onDelete,
  onComment,
  onDeleteComment,
  onHashtagClick,
  emptyMessage = 'No content available at the moment.',
}) => {
  // ─── Initial Loading State ─────────────────────────────────
  if (isLoading && (!posts || posts.length === 0)) {
    return (
      <div className="space-y-4">
        <FeedSkeleton />
        <FeedSkeleton />
        <FeedSkeleton />
      </div>
    );
  }

  // ─── Empty Feed State ──────────────────────────────────────
  if (!posts || posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden my-4 rounded-2xl border border-dashed border-slate-300/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-8 text-center backdrop-blur-xl shadow-xs"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
          <MessageSquare className="w-5 h-5" />
          <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-amber-500" />
        </div>

        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
          {emptyMessage}
        </p>
      </motion.div>
    );
  }

  // ─── Main Feed List ────────────────────────────────────────
  return (
    <div className="space-y-4">
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              layout
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-200 overflow-hidden"
            >
              <PostCard
                post={post}
                onLike={onLike}
                onDelete={onDelete}
                onComment={onComment}
                onDeleteComment={onDeleteComment}
                onHashtagClick={onHashtagClick}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* ─── Pagination Skeleton State ───────────────────────── */}
      {isLoadingMore && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-2"
        >
          <FeedSkeleton />
        </motion.div>
      )}

      {/* ─── Load More Action ────────────────────────────────── */}
      {hasMore && onLoadMore && !isLoadingMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-2"
        >
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onLoadMore}
            className="w-full py-3 px-4 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-800/60 shadow-xs backdrop-blur-xl transition-all duration-200"
          >
            <span>Load more posts</span>
            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default FeedList;