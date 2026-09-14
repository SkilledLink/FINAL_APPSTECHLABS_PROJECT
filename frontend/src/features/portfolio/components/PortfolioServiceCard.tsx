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
  Loader2,
} from 'lucide-react';
import type { Service } from '../../../types/portfolio';

interface PortfolioServiceCardProps {
  service: Service;
  onEdit: () => void;
  onDelete: () => Promise<void> | void;
}

/* ───────────────────────── Shared tokens ───────────────────────── */

const CARD =
  'group relative flex flex-col justify-between rounded-md border border-slate-200/70 ' +
  'bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 ' +
  'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)] ' +
  'dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-16px_rgba(0,0,0,0.5)] ' +
  'transition-all duration-200 ' +
  'hover:border-blue-500/40 hover:shadow-md hover:shadow-blue-500/10 ' +
  'dark:hover:border-blue-500/30';

const CHIP_BLUE =
  'inline-flex items-center gap-1.5 rounded-sm border border-blue-500/25 ' +
  'bg-blue-500/8 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ' +
  'text-blue-700 dark:border-blue-400/25 dark:text-blue-300';

const CHIP_MUTED =
  'inline-flex items-center gap-1.5 rounded-sm border border-slate-200/80 ' +
  'bg-slate-100/60 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ' +
  'text-slate-600 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-400';

const ICON_BTN =
  'flex h-7 w-7 items-center justify-center rounded text-slate-400 ' +
  'transition-colors focus:outline-none focus-visible:ring-2 ' +
  'disabled:opacity-50';

/* ─────────────────────────────────────────────────────────────── */

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
      setShowConfirmDelete(false);
    } catch (error) {
      console.error('Failed to delete service:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteConfirm = useCallback(() => {
    if (!isDeleting) setShowConfirmDelete(false);
  }, [isDeleting]);

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
    if (service.pricing_type === 'negotiable') {
      return 'Negotiable';
    }

    if (
      service.starting_price === undefined ||
      service.starting_price === null
    ) {
      return 'Custom pricing';
    }

    const currencyCode =
      (service as { currency?: string }).currency || 'XAF';

    const price = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(service.starting_price);

    switch (service.pricing_type) {
      case 'starting_from':
        return `From ${price}`;
      case 'hourly':
        return `${price} / hr`;
      case 'daily':
        return `${price} / day`;
      case 'monthly':
        return `${price} / mo`;
      case 'fixed':
      default:
        return price;
    }
  };

  const hasMetadata = Boolean(
    service.category || service.estimated_duration || service.service_area
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`${CARD} p-4 sm:p-5`}
    >
      <div>
        {/* ── Header: status + actions ── */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {service.is_active !== false ? (
              <span className={CHIP_BLUE}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-600" />
                </span>
                Active
              </span>
            ) : (
              <span className={CHIP_MUTED}>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                Paused
              </span>
            )}

            {service.is_emergency_service && (
              <span className={CHIP_BLUE}>
                <AlertTriangle className="h-2.5 w-2.5" />
                Urgent
              </span>
            )}
          </div>

          {/* Actions — 32px tap targets on mobile, tighter on desktop */}
          <div className="-mr-1 -mt-1 flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={onEdit}
              title="Edit service"
              aria-label={`Edit ${service.title}`}
              className={`${ICON_BTN} hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 focus-visible:ring-blue-500/25`}
            >
              <Edit3 size={15} />
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              title="Delete service"
              aria-label={`Delete ${service.title}`}
              className={`${ICON_BTN} hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 focus-visible:ring-rose-500/25`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* ── Title ── */}
        <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400">
          {service.title}
        </h3>

        {/* ── Description ── */}
        {service.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {service.description}
          </p>
        )}

        {/* ── Metadata ── */}
        {hasMetadata && (
          <div className="mt-3.5 space-y-1.5 border-t border-slate-200/60 pt-3 text-[11px] font-medium text-slate-500 dark:border-white/10 dark:text-slate-400">
            {service.category && (
              <div className="flex items-center gap-2">
                <Tag
                  size={13}
                  className="shrink-0 text-blue-500"
                />
                <span className="truncate">{service.category}</span>
              </div>
            )}
            {service.estimated_duration && (
              <div className="flex items-center gap-2">
                <Clock
                  size={13}
                  className="shrink-0 text-blue-500"
                />
                <span className="truncate">{service.estimated_duration}</span>
              </div>
            )}
            {service.service_area && (
              <div className="flex items-center gap-2">
                <MapPin
                  size={13}
                  className="shrink-0 text-blue-500"
                />
                <span className="truncate">{service.service_area}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Pricing footer ── */}
      <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-slate-200/60 pt-3 dark:border-white/10">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          Rate
        </span>
        <span className="text-base font-bold tabular-nums text-blue-700 dark:text-blue-400">
          {formatPrice()}
        </span>
      </div>

      {/* ── Delete confirm ── */}
      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-md border border-white/60 bg-white/95 p-5 text-center backdrop-blur-md dark:border-white/10 dark:bg-slate-900/95"
          >
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle size={16} />
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Delete service?
            </p>
            <p className="mb-4 mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
              "{service.title}"
            </p>

            <div className="flex w-full max-w-[220px] gap-2">
              <button
                type="button"
                onClick={closeDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 rounded border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex flex-1 items-center justify-center gap-1.5 rounded bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-rose-500/25 transition-colors hover:bg-rose-500 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}