// src/features/portfolio/components/PortfolioServiceCard.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Edit3,
  Trash2,
  Clock,
  MapPin,
  Tag,
  DollarSign,
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

  const formatPrice = () => {
    if (!service.starting_price && service.starting_price !== 0) {
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
      case 'quote_required':
        return 'Quote Required';
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
      className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/40 dark:hover:border-cyan-500/30 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/15 transition-all duration-500 pointer-events-none" />

      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Status Badge */}
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                service.is_active !== false
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
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
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <AlertTriangle size={12} /> Urgent Support
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 rounded-xl transition-all duration-200"
              title="Edit service"
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all duration-200"
              title="Delete service"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200 line-clamp-1">
          {service.title}
        </h3>

        {/* Description */}
        {service.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {service.description}
          </p>
        )}

        {/* Metadata Details */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs text-slate-600 dark:text-slate-300">
          {service.category && (
            <div className="flex items-center gap-2">
              <Tag size={13} className="text-slate-400 shrink-0" />
              <span className="truncate">{service.category}</span>
            </div>
          )}

          {service.estimated_duration && (
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-slate-400 shrink-0" />
              <span>{service.estimated_duration}</span>
            </div>
          )}

          {service.service_area && (
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-slate-400 shrink-0" />
              <span className="truncate">{service.service_area}</span>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
          Rate / Investment
        </span>
        <div className="flex items-center gap-1 font-extrabold text-sm text-cyan-600 dark:text-cyan-400">
          <DollarSign size={14} className="-mr-1" />
          <span>{formatPrice()}</span>
        </div>
      </div>

      {/* Delete Confirmation Overlay */}
      {showConfirmDelete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md p-4 flex flex-col justify-center items-center text-center z-20 rounded-3xl"
        >
          <p className="text-xs font-semibold text-slate-200 mb-3">
            Delete <span className="text-white font-bold">"{service.title}"</span>?
          </p>
          <div className="flex gap-2 w-full max-w-[200px]">
            <button
              onClick={() => setShowConfirmDelete(false)}
              disabled={isDeleting}
              className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {isDeleting ? <Loader2 size={12} className="animate-spin" /> : 'Delete'}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}