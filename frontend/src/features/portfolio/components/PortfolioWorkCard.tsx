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
  AlertTriangle,
} from 'lucide-react';
import type { Work } from '../../../types/portfolio';

interface PortfolioWorkCardProps {
  work: Work;
  onEdit: () => void;
  onDelete: () => Promise<void> | void;
  onUploadImages: (before?: File, after?: File) => Promise<void>;
}

/* ───────────────────────── Shared tokens ───────────────────────── */

const CARD =
  'group relative flex flex-col justify-between overflow-hidden rounded-md ' +
  'border border-slate-200/70 bg-white/85 backdrop-blur-xl ' +
  'dark:border-white/10 dark:bg-slate-900/60 ' +
  'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)] ' +
  'dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-16px_rgba(0,0,0,0.5)] ' +
  'transition-all duration-200 ' +
  'hover:border-blue-500/40 hover:shadow-[0_8px_24px_-12px_rgba(59,130,246,0.25)] ' +
  'dark:hover:border-blue-500/30';

const CHIP_BLUE =
  'inline-flex items-center gap-1 rounded-sm border border-blue-500/20 ' +
  'bg-blue-500/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ' +
  'text-blue-700 dark:border-blue-400/20 dark:text-blue-300';

const CHIP_MUTED =
  'inline-flex items-center gap-1 rounded-sm border border-slate-200/80 ' +
  'bg-slate-100/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ' +
  'text-slate-600 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-400';

const META_CHIP =
  'inline-flex items-center gap-1 rounded-sm border border-slate-200/70 ' +
  'bg-white/70 px-2 py-1 text-[11px] font-medium text-slate-600 ' +
  'backdrop-blur-md dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-300';

const ICON_BTN =
  'flex h-7 w-7 items-center justify-center rounded text-slate-400 ' +
  'transition-colors focus:outline-none focus-visible:ring-2 disabled:opacity-50';

/* ─────────────────────────────────────────────────────────────── */

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
      setShowConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasMeta = Boolean(
    work.location ||
      (work.duration_value && work.duration_unit) ||
      work.team_size ||
      work.client_type
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
      {/* Corner glow (hover) */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/0 blur-2xl transition-all duration-500 group-hover:bg-blue-500/15" />

      <div className="relative">
        {/* ── Header: category badge + actions ── */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {work.service_category ? (
              <span className={CHIP_BLUE}>
                <Tag size={11} />
                <span className="truncate">{work.service_category}</span>
              </span>
            ) : (
              <span className={CHIP_MUTED}>Project</span>
            )}

            {work.client_type && (
              <span className={CHIP_MUTED}>
                <Briefcase size={10} />
                {work.client_type}
              </span>
            )}
          </div>

          <div className="-mr-1 -mt-1 flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={onEdit}
              title="Edit work"
              aria-label={`Edit ${work.title}`}
              className={`${ICON_BTN} hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 focus-visible:ring-blue-500/25`}
            >
              <Edit3 size={15} />
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              title="Delete work"
              aria-label={`Delete ${work.title}`}
              className={`${ICON_BTN} hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 focus-visible:ring-rose-500/25`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* ── Title ── */}
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400">
          {work.title}
        </h3>

        {/* ── Description ── */}
        {work.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {work.description}
          </p>
        )}

        {/* ── Metadata ── */}
        {hasMeta && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {work.location && (
              <span className={META_CHIP}>
                <MapPin size={11} className="text-blue-500" />
                <span className="truncate">{work.location}</span>
              </span>
            )}
            {work.duration_value && work.duration_unit && (
              <span className={META_CHIP}>
                <Clock size={11} className="text-blue-500" />
                {work.duration_value} {work.duration_unit}
              </span>
            )}
            {work.team_size && (
              <span className={META_CHIP}>
                <Users size={11} className="text-blue-500" />
                {work.team_size} {work.team_size === 1 ? 'person' : 'members'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Before / After grid ── */}
      <div className="relative mt-4 grid grid-cols-2 gap-2 border-t border-slate-200/60 pt-3 dark:border-white/10">
        {/* Before */}
        <ImageSlot
          variant="before"
          label="Before"
          imageUrl={work.before_image_url ?? null}
          uploading={uploading === 'before'}
          disabled={uploading !== null}
          inputRef={beforeRef}
          onPick={() => beforeRef.current?.click()}
        />
        <input
          ref={beforeRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e, 'before')}
        />

        {/* After */}
        <ImageSlot
          variant="after"
          label="After"
          imageUrl={work.after_image_url ?? null}
          uploading={uploading === 'after'}
          disabled={uploading !== null}
          inputRef={afterRef}
          onPick={() => afterRef.current?.click()}
        />
        <input
          ref={afterRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e, 'after')}
        />
      </div>

      {/* ── Delete confirmation overlay ── */}
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
            Delete work?
          </p>
          <p className="mb-4 mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
            "{work.title}"
          </p>

          <div className="flex w-full max-w-[220px] gap-2">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(false)}
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
    </motion.div>
  );
}

/* ───────────────────────── Image slot ───────────────────────── */

function ImageSlot({
  variant,
  label,
  imageUrl,
  uploading,
  disabled,
  onPick,
}: {
  variant: 'before' | 'after';
  label: string;
  imageUrl: string | null;
  uploading: boolean;
  disabled: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onPick: () => void;
}) {
  const hasImage = Boolean(imageUrl);

  return (
    <div className="group/slot relative aspect-video overflow-hidden rounded-sm border border-slate-200/70 bg-slate-100 dark:border-white/10 dark:bg-slate-800/60">
      {hasImage ? (
        <img
          src={imageUrl!}
          alt={`${label} project showcase`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover/slot:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500">
          <ImageIcon size={18} />
          <span className="text-[10px] font-medium">{label}</span>
        </div>
      )}

      {/* Hover overlay — upload / replace */}
      <button
        type="button"
        onClick={onPick}
        disabled={disabled}
        className="absolute inset-0 flex items-center justify-center gap-1.5 bg-slate-950/60 text-[11px] font-semibold text-white opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover/slot:opacity-100 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Camera size={14} />
        )}
        <span>{hasImage ? 'Replace' : 'Upload'}</span>
      </button>

      {/* Corner label */}
      <span
        className={`absolute bottom-1.5 left-1.5 rounded-sm border border-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-md ${
          variant === 'after' ? 'bg-blue-600/90' : 'bg-slate-950/70'
        }`}
      >
        {label}
      </span>
    </div>
  );
}