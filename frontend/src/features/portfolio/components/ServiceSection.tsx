// src/features/portfolio/components/ServiceSection.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wrench, Star } from 'lucide-react';
import type { Service } from '../../../types/portfolio';
import ServiceCard from './ServiceCard';

interface ServiceSectionProps {
  services: Service[];
  onAdd: () => void;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => Promise<void>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export default function ServiceSection({ services, onAdd, onEdit, onDelete }: ServiceSectionProps) {
  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-100">
            <Star size={20} className="text-amber-500 fill-amber-500/20" />
            Offered Services & Offerings
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            List specific services, pricing models, and turnaround times.
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <Plus size={14} /> New Service
        </button>
      </div>

      {/* Main Content Area */}
      {services.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/50 p-10 text-center backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50"
        >
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <Wrench size={28} />
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No services listed yet
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
            Specify what services you provide to let clients easily request or book your work.
          </p>
          <button
            onClick={onAdd}
            className="mt-4 flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-amber-600/20 transition-all hover:bg-amber-700 active:scale-95"
          >
            <Plus size={14} /> Add Service
          </button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {services.map((service) => (
              <motion.div key={service.id} variants={itemVariants} layout exit="exit">
                <ServiceCard
                  service={service}
                  onEdit={() => onEdit(service)}
                  onDelete={() => onDelete(service.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}