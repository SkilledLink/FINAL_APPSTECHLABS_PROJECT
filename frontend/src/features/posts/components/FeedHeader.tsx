import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Hash, Sparkles } from 'lucide-react';
import { useTrendingHashtags } from '../hooks/useTrendingHashtags';

interface FeedHeaderProps {
  selectedHashtag?: string;
  onSelectHashtag?: (hashtag: string) => void;
}

// Utility function to format usage counts cleanly (e.g. 1.2k)
const formatCount = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}m`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
};

const FeedHeader: React.FC<FeedHeaderProps> = ({
  selectedHashtag,
  onSelectHashtag,
}) => {
  const { hashtags, loading } = useTrendingHashtags(10);

  return (
    <div className="relative w-full py-2.5">
      {/* Edge gradient fade masks for smooth overflow hint */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-slate-50 dark:from-[#0b1329] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-slate-50 dark:from-[#0b1329] to-transparent z-10" />

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-1 py-1">
        {/* ─── Trending Badge Label ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 dark:from-amber-500/20 dark:via-orange-500/20 dark:to-rose-500/20 border border-orange-500/20 dark:border-orange-500/30 text-orange-600 dark:text-orange-400 font-bold text-xs tracking-wide shadow-2xs backdrop-blur-md"
        >
          <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse shrink-0" />
          <span>Trending</span>
        </motion.div>

        {/* ─── Skeleton Loading State ──────────────────────── */}
        {loading && (
          <div className="flex items-center gap-2 shrink-0">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-7 w-24 bg-slate-200/70 dark:bg-slate-800/60 rounded-full animate-pulse border border-slate-200/50 dark:border-slate-800/50"
              />
            ))}
          </div>
        )}

        {/* ─── Hashtag Chips List ───────────────────────────── */}
        {!loading && (
          <AnimatePresence mode="popLayout">
            {hashtags.map((tag) => {
              const isSelected = selectedHashtag === tag.name;

              return (
                <motion.button
                  key={tag.id}
                  initial={{ opacity: 0, scale: 0.9, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onSelectHashtag?.(tag.name)}
                  className={`
                    group flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                    whitespace-nowrap transition-all duration-200 shrink-0 outline-none
                    ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/30'
                        : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800/80 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800/60 shadow-2xs'
                    }
                  `}
                >
                  <Hash
                    className={`w-3 h-3 transition-transform group-hover:scale-110 ${
                      isSelected
                        ? 'text-white'
                        : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500'
                    }`}
                  />
                  <span>{tag.name}</span>
                  <span
                    className={`
                      px-1.5 py-0.2 rounded-full text-[10px] font-medium transition-colors
                      ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:text-blue-600 dark:group-hover:text-blue-300'
                      }
                    `}
                  >
                    {formatCount(tag.usage_count)}
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}

        {/* ─── Empty State ──────────────────────────────────── */}
        {!loading && hashtags.length === 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 text-xs text-slate-400 dark:text-slate-500 italic">
            <Sparkles className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
            <span>No trending topics right now</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedHeader;