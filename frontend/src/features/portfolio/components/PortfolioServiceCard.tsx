// src/features/portfolio/components/PortfolioServiceCard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit3,
  Trash2,
  Clock,
  MapPin,
  Tag,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import type { Service } from '../../../types/portfolio';

interface PortfolioServiceCardProps {
  service: Service;
  onEdit: () => void;
  onDelete: () => Promise<void> | void;
}

export default function PortfolioServiceCard({
  service,
  onEdit,
  onDelete,
}: PortfolioServiceCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const closeDeleteConfirm = useCallback(() => {
    if (!isDeleting) {
      setShowConfirmDelete(false);
    }
  }, [isDeleting]);

  // Handle ESC key to dismiss delete confirmation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDeleteConfirm();
    };

    if (showConfirmDelete) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showConfirmDelete, closeDeleteConfirm]);

  const formatPrice = () => {
    if (service.pricing_type === 'quote_required') {
      return 'Quote Required';
    }

    if (service.starting_price === undefined || service.starting_price === null) {
      return 'Custom Pricing';
    }

    const price = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(service.starting_price);

    switch (service.pricing_type) {
      case 'starting_from':
        return `From ${price}`;
      case 'hourly':
        return `${price} / hr`;
      case 'daily':
        return `${price} / day`;
      case 'fixed':
      default:
        return price;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5 dark:border-slate-800/80 dark:bg-slate-900/80 dark:hover:border-cyan-500/30"
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-500/5 blur-2xl transition-all duration-500 group-hover:bg-cyan-500/15 dark:bg-cyan-500/10" />

      <div>
        {/* Top Badges & Actions */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Status Badge */}
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                service.is_active !== false
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {service.is_active !== false ? (
                <>
                  <CheckCircle2 size={12} /> Active
                </>
              ) : (
                <>
                  <XCircle size={12} /> Paused
                </>
              )}
            </span>

            {/* Emergency Service Badge */}
            {service.is_emergency_service && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                <AlertTriangle size={12} /> Urgent Support
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-90 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-xl p-1.5 text-slate-400 transition-all duration-200 hover:bg-cyan-50 hover:text-cyan-600 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-400"
              title="Edit service"
              aria-label="Edit service"
            >
              <Edit3 size={15} />
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="rounded-xl p-1.5 text-slate-400 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
              title="Delete service"
              aria-label="Delete service"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="line-clamp-1 text-base font-bold text-slate-900 transition-colors duration-200 group-hover:text-cyan-600 dark:text-slate-100 dark:group-hover:text-cyan-400">
          {service.title}
        </h3>

        {/* Description */}
        {service.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {service.description}
          </p>
        )}

        {/* Metadata Details */}
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600 dark:border-slate-800/80 dark:text-slate-300">
          {service.category && (
            <div className="flex items-center gap-2">
              <Tag size={13} className="shrink-0 text-slate-400" />
              <span className="truncate">{service.category}</span>
            </div>
          )}

          {service.estimated_duration && (
            <div className="flex items-center gap-2">
              <Clock size={13} className="shrink-0 text-slate-400" />
              <span>{service.estimated_duration}</span>
            </div>
          )}

          {service.service_area && (
            <div className="flex items-center gap-2">
              <MapPin size={13} className="shrink-0 text-slate-400" />
              <span className="truncate">{service.service_area}</span>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Rate / Investment
        </span>
        <div className="font-extrabold text-sm text-cyan-600 dark:text-cyan-400">
          <span>{formatPrice()}</span>
        </div>
      </div>

      {/* Delete Confirmation Overlay */}
      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl bg-slate-950/80 p-4 text-center backdrop-blur-md"
          >
            <p className="mb-3 text-xs font-semibold text-slate-200">
              Delete <span className="font-bold text-white">"{service.title}"</span>?
            </p>
            <div className="flex w-full max-w-[200px] gap-2">
              <button
                type="button"
                onClick={closeDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 size={12} className="animate-spin" /> : 'Delete'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}