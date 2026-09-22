// src/features/posts/components/Highlights.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { Highlight } from '../../posts/types/post.types';

interface HighlightsProps {
  highlights: Highlight[];
  onAddHighlight: () => void;
}

/* ─────────── animation variants ─────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 340, damping: 26 },
  },
};

/* ─────────── component ─────────── */

const Highlights: React.FC<HighlightsProps> = ({
  highlights,
  onAddHighlight,
}) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="
        w-full min-w-0 flex items-start gap-3.5 overflow-x-auto
        pt-1 pb-3 mb-2 px-0.5
        scrollbar-hide
      "
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* ── Add Highlight ── */}
      <motion.button
        type="button"
        variants={itemVariants}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAddHighlight}
        aria-label="Add highlight"
        className="group flex flex-col items-center shrink-0 outline-none"
      >
        <div className="relative">
          {/* Dashed outer ring */}
          <div
            className="
              flex h-[68px] w-[68px] items-center justify-center rounded-full
              border-2 border-dashed border-slate-300/90 dark:border-slate-700/90
              bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm
              transition-all duration-300
              group-hover:border-blue-500 group-hover:bg-blue-500/[0.06]
              dark:group-hover:border-blue-500 dark:group-hover:bg-blue-500/[0.08]
            "
          >
            <div
              className="
                flex h-10 w-10 items-center justify-center rounded-full
                bg-gradient-to-tr from-blue-600 to-indigo-600 text-white
                shadow-md shadow-blue-500/25
                transition-transform duration-300
                group-hover:scale-110 group-hover:rotate-90
              "
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <span
          className="
            mt-2 text-[11px] font-semibold tracking-tight
            text-slate-600 dark:text-slate-400
            transition-colors duration-200
            group-hover:text-blue-600 dark:group-hover:text-blue-400
            whitespace-nowrap
          "
        >
          Add
        </span>
      </motion.button>

      {/* ── Existing Highlights ── */}
      {highlights.map((h) => (
        <motion.button
          type="button"
          key={h.id}
          variants={itemVariants}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => console.log(`Clicked ${h.label}`)}
          aria-label={`Open ${h.label} highlight`}
          className="group flex flex-col items-center shrink-0 outline-none"
        >
          <div className="relative">
            {/* Gradient ring */}
            <div
              className="
                relative flex h-[68px] w-[68px] items-center justify-center
                rounded-full p-[2.5px]
                bg-gradient-to-tr from-blue-600 via-indigo-500 to-fuchsia-500
                transition-transform duration-300
                group-hover:scale-105
              "
            >
              {/* Inner white gap */}
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-slate-950 p-[2px]">
                <div className="h-full w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <img
                    src={h.imageUrl}
                    alt={h.label}
                    loading="lazy"
                    className="
                      h-full w-full object-cover
                      transition-transform duration-500
                      group-hover:scale-110
                    "
                  />
                </div>
              </div>

              {/* Subtle hover glow */}
              <div
                className="
                  pointer-events-none absolute inset-0 rounded-full
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  shadow-[0_0_0_4px_rgba(59,130,246,0.12)]
                "
              />
            </div>
          </div>

          <span
            className="
              mt-2 max-w-[72px] truncate text-[11px] font-semibold tracking-tight
              text-slate-700 dark:text-slate-300
              transition-colors duration-200
              group-hover:text-blue-600 dark:group-hover:text-blue-400
            "
          >
            {h.label}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default Highlights;