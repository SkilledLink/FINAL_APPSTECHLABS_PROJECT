// src/features/portfolio/components/WorkSection.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderPlus } from 'lucide-react';
import type { Work } from '../../../types/portfolio';
import WorkCard from './WorkCard';

interface WorkSectionProps {
  works: Work[];
  onAdd: () => void;
  onEdit: (work: Work) => void;
  onDelete: (workId: string) => Promise<void>;
  onUploadImages: (
    workId: string,
    before?: File,
    after?: File
  ) => Promise<void>;
}

/* ───────────────────────── Shared tokens ───────────────────────── */

const BTN_PRIMARY =
  'group inline-flex w-full items-center justify-center gap-1.5 rounded ' +
  'bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white ' +
  'shadow-sm shadow-blue-500/25 transition-colors hover:bg-blue-500 ' +
  'active:scale-[0.98] sm:w-auto';

/* ───────────────────────── Motion ───────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

/* ─────────────────────────────────────────────────────────────── */

export default function WorkSection({
  works,
  onAdd,
  onEdit,
  onDelete,
  onUploadImages,
}: WorkSectionProps) {
  const count = works.length;

  return (
    <section className="space-y-5 sm:space-y-6">
      {/* ═══════════ Header ═══════════ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:border-blue-400/20 dark:text-blue-400">
            <FolderPlus className="h-4 w-4" />
          </span>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
                Featured projects
              </h2>
              {count > 0 && (
                <span className="inline-flex h-5 items-center rounded-sm border border-slate-200/80 bg-white/70 px-1.5 text-[10px] font-bold tabular-nums text-slate-600 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-300">
                  {count}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Showcase real work, before/after images, and project details.
            </p>
          </div>
        </div>

        {count > 0 && (
          <button type="button" onClick={onAdd} className={BTN_PRIMARY}>
            <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
            <span>New work</span>
          </button>
        )}
      </div>

      {/* ═══════════ Empty state ═══════════ */}
      {count === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-md border border-dashed border-blue-500/25 bg-blue-500/[0.03] px-6 py-10 text-center backdrop-blur-sm dark:border-blue-400/20 dark:bg-blue-500/[0.04]"
        >
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative flex flex-col items-center">
            <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-600 shadow-sm shadow-blue-500/10 dark:border-blue-400/20 dark:text-blue-400">
              <FolderPlus className="h-6 w-6" />
            </div>

            <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
              No completed works yet
            </h3>
            <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Add completed client projects or personal showcases to build
              trust with potential clients.
            </p>

            <button
              type="button"
              onClick={onAdd}
              className="group mt-5 inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
            >
              <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
              <span>Add your first project</span>
            </button>
          </div>
        </motion.div>
      ) : (
        /* ═══════════ Grid ═══════════ */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2"
        >
          <AnimatePresence mode="popLayout">
            {works.map((work) => (
              <motion.div
                key={work.id}
                variants={itemVariants}
                layout
                exit="exit"
                className="min-w-0"
              >
                <WorkCard
                  work={work}
                  onEdit={() => onEdit(work)}
                  onDelete={() => onDelete(work.id)}
                  onUploadImages={(before, after) =>
                    onUploadImages(work.id, before, after)
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}