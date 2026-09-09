// src/features/portfolio/components/PortfolioWorks.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderPlus, Briefcase } from 'lucide-react';
import type { Work } from '../../../types/portfolio';
import PortfolioWorkCard from './PortfolioWorkCard';

interface Props {
  works: Work[];
  onAdd: () => void;
  onEdit: (work: Work) => void;
  onDelete: (workId: string) => Promise<void>;
  onUploadImages: (workId: string, before?: File, after?: File) => Promise<void>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export default function PortfolioWorks({ works, onAdd, onEdit, onDelete, onUploadImages }: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-100">
            <Briefcase size={20} className="text-blue-600" />
            Portfolio Projects
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showcase your completed work with before/after images
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <Plus size={14} /> Add Work
        </button>
      </div>

      {works.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/50 p-10 text-center backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50"
        >
          <FolderPlus size={28} className="mb-3 text-slate-400 dark:text-slate-500" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No works added yet
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
            Add a project to showcase your skills and attract clients.
          </p>
          <button
            onClick={onAdd}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-blue-700"
          >
            <Plus size={14} className="mr-1 inline" /> Add First Project
          </button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          <AnimatePresence mode="popLayout">
            {works.map((work) => (
              <motion.div key={work.id} variants={itemVariants} layout exit="exit">
                <PortfolioWorkCard
                  work={work}
                  onEdit={() => onEdit(work)}
                  onDelete={() => onDelete(work.id)}
                  onUploadImages={(before, after) => onUploadImages(work.id, before, after)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}