// src/features/posts/components/FeedHeader.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Hash, Sparkles } from 'lucide-react';
import { useTrendingHashtags } from '../hooks/useTrendingHashtags';

interface FeedHeaderProps {
  selectedHashtag?: string;
  onSelectHashtag?: (hashtag: string) => void;
}

/* ─────────── count formatter ─────────── */

const formatCount = (count: number): string => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 10_000) return `${Math.round(count / 1000)}k`;
  if (count >= 1_000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
};

/* ─────────── component ─────────── */

const FeedHeader: React.FC<FeedHeaderProps> = ({
  selectedHashtag,
  onSelectHashtag,
}) => {
  const { hashtags, loading } = useTrendingHashtags(10);

  return (
    // ── Hidden on mobile, visible from `sm` (640px) upward ──
    <div className="hidden sm:block relative w-full py-2">
      {/* Edge fade masks — subtle, theme-aware */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10" />

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-1.5 py-1">
        {/* ── Trending label ── */}
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0 bg-gradient-to-r from-orange-500/[0.08] to-rose-500/[0.08] dark:from-orange-500/[0.14] dark:to-rose-500/[0.14] border border-orange-500/15 dark:border-orange-500/25 text-orange-600 dark:text-orange-400 font-bold text-[11px] tracking-wide uppercase backdrop-blur-sm"
        >
          <Flame className="w-3.5 h-3.5 shrink-0" />
          <span>Trending</span>
        </motion.div>

        <div className="h-5 w-px bg-slate-200/80 dark:bg-slate-800/80 shrink-0" />

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="flex items-center gap-2 shrink-0">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-7 rounded-full bg-slate-200/60 dark:bg-slate-800/50 animate-pulse border border-slate-200/40 dark:border-slate-800/40"
                style={{ width: `${70 + i * 14}px` }}
              />
            ))}
          </div>
        )}

        {/* ── Hashtag chips ── */}
        {!loading && hashtags.length > 0 && (
          <AnimatePresence mode="popLayout" initial={false}>
            {hashtags.map((tag) => {
              const isSelected = selectedHashtag === tag.name;

              return (
                <motion.button
                  key={tag.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92, y: 3 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onSelectHashtag?.(tag.name)}
                  className={`
                    group flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-semibold
                    whitespace-nowrap shrink-0 outline-none transition-colors duration-200
                    ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                        : 'bg-white dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700'
                    }
                  `}
                  aria-pressed={isSelected}
                >
                  <Hash
                    className={`w-3 h-3 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isSelected
                        ? 'text-white/85'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span className="leading-none">{tag.name}</span>
                  {typeof tag.usage_count === 'number' && (
                    <span
                      className={`
                        ml-0.5 px-1.5 rounded-full text-[10px] font-bold tabular-nums leading-[16px]
                        ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }
                      `}
                    >
                      {formatCount(tag.usage_count)}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}

        {/* ── Empty state ── */}
        {!loading && hashtags.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 px-3 py-1 text-[12px] text-slate-400 dark:text-slate-500 italic shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
            <span>No trending topics right now</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FeedHeader;