// src/features/portfolio/components/PortfolioWorkCard.tsx
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Edit3,
  Trash2,
  Camera,
  MapPin,
  Users,
  Clock,
  Image as ImageIcon,
  Tag,
  Briefcase,
  Loader2,
} from 'lucide-react';
import type { Work } from '../../../types/portfolio';

interface PortfolioWorkCardProps {
  work: Work;
  onEdit: () => void;
  onDelete: () => Promise<void> | void;
  onUploadImages: (before?: File, after?: File) => Promise<void>;
}

export default function PortfolioWorkCard({
  work,
  onEdit,
  onDelete,
  onUploadImages,
}: PortfolioWorkCardProps) {
  const [uploading, setUploading] = useState<'before' | 'after' | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);

  const handleFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'before' | 'after'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(type);
    try {
      await onUploadImages(
        type === 'before' ? file : undefined,
        type === 'after' ? file : undefined
      );
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
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
      {/* Background Refraction Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/15 transition-all duration-500 pointer-events-none" />

      <div>
        {/* Header Badges & Actions */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {work.service_category ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 truncate">
                <Tag size={11} />
                <span className="truncate">{work.service_category}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Project Showcase
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={onEdit}
              className="p-1.5 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 rounded-xl transition-all duration-200"
              title="Edit work"
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all duration-200"
              title="Delete work"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200 line-clamp-1">
          {work.title}
        </h3>

        {/* Description */}
        {work.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {work.description}
          </p>
        )}

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-1.5 mt-3 text-[11px] font-medium text-slate-600 dark:text-slate-300">
          {work.location && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl">
              <MapPin size={12} className="text-slate-400" />
              <span>{work.location}</span>
            </span>
          )}
          {work.duration_value && work.duration_unit && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl">
              <Clock size={12} className="text-slate-400" />
              <span>
                {work.duration_value} {work.duration_unit}
              </span>
            </span>
          )}
          {work.team_size && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl">
              <Users size={12} className="text-slate-400" />
              <span>{work.team_size} members</span>
            </span>
          )}
          {work.client_type && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl">
              <Briefcase size={12} className="text-slate-400" />
              <span>{work.client_type}</span>
            </span>
          )}
        </div>
      </div>

      {/* Before / After Showcase Grid */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2.5">
        {/* Before Image Box */}
        <div className="relative group/aspect aspect-video bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl overflow-hidden">
          {work.before_image_url ? (
            <img
              src={work.before_image_url}
              alt="Before project showcase"
              className="w-full h-full object-cover transition-transform duration-500 group-hover/aspect:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <ImageIcon size={20} />
              <span className="text-[10px] font-medium mt-1">Before Image</span>
            </div>
          )}

          <button
            onClick={() => beforeRef.current?.click()}
            disabled={uploading !== null}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover/aspect:opacity-100 transition-all duration-200 flex items-center justify-center text-white text-xs font-medium gap-1.5"
          >
            {uploading === 'before' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Camera size={16} />
            )}
            <span>{work.before_image_url ? 'Replace' : 'Upload'}</span>
          </button>

          <input
            ref={beforeRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e, 'before')}
          />

          <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold bg-slate-950/70 backdrop-blur-md text-white px-2 py-0.5 rounded-lg border border-white/10">
            Before
          </span>
        </div>

        {/* After Image Box */}
        <div className="relative group/aspect aspect-video bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl overflow-hidden">
          {work.after_image_url ? (
            <img
              src={work.after_image_url}
              alt="After project showcase"
              className="w-full h-full object-cover transition-transform duration-500 group-hover/aspect:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <ImageIcon size={20} />
              <span className="text-[10px] font-medium mt-1">After Image</span>
            </div>
          )}

          <button
            onClick={() => afterRef.current?.click()}
            disabled={uploading !== null}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover/aspect:opacity-100 transition-all duration-200 flex items-center justify-center text-white text-xs font-medium gap-1.5"
          >
            {uploading === 'after' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Camera size={16} />
            )}
            <span>{work.after_image_url ? 'Replace' : 'Upload'}</span>
          </button>

          <input
            ref={afterRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e, 'after')}
          />

          <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold bg-cyan-500/90 backdrop-blur-md text-white px-2 py-0.5 rounded-lg border border-white/10 shadow-sm">
            After
          </span>
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
            Delete <span className="text-white font-bold">"{work.title}"</span>?
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