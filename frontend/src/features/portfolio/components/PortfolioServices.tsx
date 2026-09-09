// src/features/portfolio/components/PortfolioServices.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wrench, Star } from 'lucide-react';
import type { Service } from '../../../types/portfolio';
import PortfolioServiceCard from './PortfolioServiceCard';

interface PortfolioServicesProps {
  services: Service[];
  onAdd: () => void;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => Promise<void> | void;
  loading?: boolean;
}

export default function PortfolioServices({
  services,
  onAdd,
  onEdit,
  onDelete,
  loading = false,
}: PortfolioServicesProps) {
  // Safety: ensure services is an array and filter out any undefined/null values
  const validServices = (Array.isArray(services) ? services : []).filter(
    (item): item is Service => Boolean(item) && typeof item === 'object'
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Star size={20} className="text-amber-500" />
            Services Offered
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            List the services you provide to potential clients
          </p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus size={16} /> Add Service
        </button>
      </div>

      {validServices.length === 0 ? (
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center">
          <Wrench size={32} className="text-slate-400 dark:text-slate-500 mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No services added</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Add services to let clients know what you offer.
          </p>
          <button
            onClick={onAdd}
            className="mt-4 px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-md hover:bg-amber-700 transition"
          >
            <Plus size={14} className="inline mr-1" /> Add First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {validServices.map((service) => (
              <PortfolioServiceCard
                key={service.id}
                service={service}
                onEdit={() => onEdit(service)}
                onDelete={() => onDelete(service.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}