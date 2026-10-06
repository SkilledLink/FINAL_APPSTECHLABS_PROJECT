// src/features/portfolio/components/PortfolioWorkCard.tsx
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Briefcase,
  Calendar,
  Clock,
  Edit3,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Quote,
  Star,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import type { Work } from '../types/portfolio.types';

interface PortfolioWorkCardProps {
  work: Work;
  isOwner?: boolean;
  onEdit: () => void;
  onDelete: () => Promise<void> | void;
  /** Called when the owner picks replacement images for an existing work. */
  onUploadImages?: (before?: File, after?: File) => Promise<void>;
}

/* ───────────────────────── tokens ───────────────────────── */

const CARD =
  'group relative flex flex-col overflow-hidden rounded-md ' +
  'border border-slate-200/70 bg-white/85 backdrop-blur-xl ' +
  'dark:border-white/10 dark:bg-slate-900/60 ' +
  'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)] ' +
  'dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-16px_rgba(0,0,0,0.5)] ' +
  'transition-all duration-200 hover:border-blue-500/40 hover:shadow-md hover:shadow-blue-500/10 ' +
  'dark:hover:border-blue-500/30';

const ICON_BTN =
  'flex h-7 w-7 items-center justify-center rounded text-slate-400 ' +
  'transition-colors focus:outline-none focus-visible:ring-2 disabled:opacity-50';

const CHIP =
  'inline-flex items-center gap-1 rounded-sm border border-slate-200/80 ' +
  'bg-slate-100/60 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ' +
  'text-slate-600 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-400';

const CHIP_BLUE =
  'inline-flex items-center gap-1 rounded-sm border border-blue-500/25 ' +
  'bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ' +
  'text-blue-700 dark:border-blue-400/25 dark:text-blue-300';

/* ───────────────────────── image viewer ───────────────────────── */

function ImageViewer({
  beforeUrl,
  afterUrl,
  title,
  onClose,
}: {
  beforeUrl?: string | null;
  afterUrl?: string | null;
  title: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const hasBoth = Boolean(beforeUrl && afterUrl);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] flex flex-col bg-slate-950/95 backdrop-blur-xl"
      onClick={onClose}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 p-4 text-white">
        <p className="truncate text-sm font-semibold">{title}</p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/20"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div
        className="flex flex-1 items-center justify-center overflow-hidden p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {hasBoth ? (
          <div className="grid h-full w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="relative flex items-center justify-center overflow-hidden rounded-xl">
              <img
                src={beforeUrl!}
                alt="Before"
                className="max-h-full max-w-full object-contain"
              />
              <span className="absolute left-3 top-3 rounded-md bg-slate-950/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                Before
              </span>
            </div>
            <div className="relative flex items-center justify-center overflow-hidden rounded-xl">
              <img
                src={afterUrl!}
                alt="After"
                className="max-h-full max-w-full object-contain"
              />
              <span className="absolute left-3 top-3 rounded-md bg-blue-600/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                After
              </span>
            </div>
          </div>
        ) : (
          <img
            src={(afterUrl || beforeUrl)!}
            alt={title}
            className="max-h-full max-w-full object-contain"
          />
        )}
      </div>
    </motion.div>,
    document.body
  );
}

/* ───────────────────────── main ───────────────────────── */

export default function PortfolioWorkCard({
  work,
  isOwner = false,
  onEdit,
  onDelete,
  onUploadImages,
}: PortfolioWorkCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const hasImages = Boolean(work.before_image_url || work.after_image_url);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
      setConfirmDelete(false);
    } catch (err) {
      console.error('Failed to delete work:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleUpload = async () => {
    if (!onUploadImages) return;
    if (!beforeFile && !afterFile) return;
    setUploading(true);
    try {
      await onUploadImages(
        beforeFile ?? undefined,
        afterFile ?? undefined
      );
      setBeforeFile(null);
      setAfterFile(null);
    } catch (err) {
      console.error('Failed to upload images:', err);
    } finally {
      setUploading(false);
    }
  };

  const durationLabel =
    work.duration_value != null && work.duration_unit
      ? `${work.duration_value} ${work.duration_unit}`
      : null;

  const completedLabel = work.completed_at
    ? new Date(work.completed_at).toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      })
    : null;

  const costLabel =
    work.cost != null
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'XAF',
          maximumFractionDigits: 0,
        }).format(work.cost)
      : null;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className={CARD}
      >
        {/* ═══ Before / After grid ═══ */}
        {hasImages ? (
          <button
            type="button"
            onClick={() => setViewerOpen(true)}
            className="relative block w-full overflow-hidden bg-slate-100 dark:bg-slate-800"
            aria-label="Open images"
          >
            {work.before_image_url && work.after_image_url ? (
              <div className="grid grid-cols-2 gap-px bg-slate-200/60 dark:bg-slate-800/60">
                <div className="relative aspect-[4/3]">
                  <img
                    src={work.before_image_url}
                    alt="Before"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute left-2 top-2 rounded-md bg-slate-950/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Before
                  </span>
                </div>
                <div className="relative aspect-[4/3]">
                  <img
                    src={work.after_image_url}
                    alt="After"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute left-2 top-2 rounded-md bg-blue-600/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    After
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative aspect-[16/7]">
                <img
                  src={(work.after_image_url || work.before_image_url)!}
                  alt={work.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <span className="absolute left-2 top-2 rounded-md bg-blue-600/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {work.after_image_url ? 'After' : 'Before'}
                </span>
              </div>
            )}
          </button>
        ) : (
          <div className="flex aspect-[16/7] w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
            <div className="flex flex-col items-center gap-1.5 text-slate-400 dark:text-slate-500">
              <ImageIcon className="h-6 w-6" />
              <span className="text-[11px] font-medium">No photos</span>
            </div>
          </div>
        )}

        {/* ═══ Body ═══ */}
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          {/* Header: chips + actions */}
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {work.client_type && (
                <span className={CHIP}>
                  <Users className="h-2.5 w-2.5" />
                  {work.client_type}
                </span>
              )}
              {work.rating != null && work.rating > 0 && (
                <span className={CHIP_BLUE}>
                  <Star className="h-2.5 w-2.5 fill-current" />
                  {work.rating}.0
                </span>
              )}
            </div>

            {isOwner && (
              <div className="-mr-1 -mt-1 flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={onEdit}
                  className={`${ICON_BTN} hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400`}
                  aria-label="Edit work"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className={`${ICON_BTN} hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400`}
                  aria-label="Delete work"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400">
            {work.title}
          </h3>

          {/* Description */}
          {work.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {work.description}
            </p>
          )}

          {/* Meta row */}
          {(work.service_category ||
            work.location ||
            completedLabel ||
            durationLabel) && (
            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-slate-200/60 pt-3 text-[11px] font-medium text-slate-500 dark:border-white/10 dark:text-slate-400">
              {work.service_category && (
                <div className="flex items-center gap-1.5 truncate">
                  <Briefcase className="h-3 w-3 shrink-0 text-blue-500" />
                  <span className="truncate">{work.service_category}</span>
                </div>
              )}
              {work.location && (
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="h-3 w-3 shrink-0 text-blue-500" />
                  <span className="truncate">{work.location}</span>
                </div>
              )}
              {completedLabel && (
                <div className="flex items-center gap-1.5 truncate">
                  <Calendar className="h-3 w-3 shrink-0 text-blue-500" />
                  <span className="truncate">{completedLabel}</span>
                </div>
              )}
              {durationLabel && (
                <div className="flex items-center gap-1.5 truncate">
                  <Clock className="h-3 w-3 shrink-0 text-blue-500" />
                  <span className="truncate">{durationLabel}</span>
                </div>
              )}
            </div>
          )}

          {/* Client testimonial */}
          {work.client_testimonial && (
            <div className="relative mt-3.5 rounded-md border-l-2 border-blue-500 bg-blue-500/5 px-3 py-2.5 dark:bg-blue-500/10">
              <Quote className="absolute right-2 top-2 h-4 w-4 text-blue-200/70 dark:text-blue-800/40" />
              <p className="relative line-clamp-2 text-xs italic leading-relaxed text-slate-700 dark:text-slate-300">
                "{work.client_testimonial}"
              </p>
              {work.client_name && (
                <p className="relative mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  — {work.client_name}
                </p>
              )}
            </div>
          )}

          {/* Owner: quick replace images */}
          {isOwner && onUploadImages && (
            <div className="mt-4 flex items-center gap-2 border-t border-slate-200/60 pt-3 dark:border-white/10">
              <label className="flex flex-1 cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-slate-300/70 bg-white/40 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 hover:border-blue-500/40 hover:text-blue-600 dark:border-white/15 dark:bg-slate-800/30 dark:text-slate-400">
                <Upload className="h-3 w-3" />
                <span className="truncate">
                  {beforeFile ? beforeFile.name : 'Before'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) =>
                    setBeforeFile(e.target.files?.[0] ?? null)
                  }
                />
              </label>
              <label className="flex flex-1 cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-slate-300/70 bg-white/40 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 hover:border-blue-500/40 hover:text-blue-600 dark:border-white/15 dark:bg-slate-800/30 dark:text-slate-400">
                <Upload className="h-3 w-3" />
                <span className="truncate">
                  {afterFile ? afterFile.name : 'After'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) =>
                    setAfterFile(e.target.files?.[0] ?? null)
                  }
                />
              </label>
              {(beforeFile || afterFile) && (
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-blue-500 disabled:opacity-60"
                >
                  {uploading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Upload className="h-3 w-3" />
                  )}
                  Upload
                </button>
              )}
            </div>
          )}

          {/* Cost footer */}
          {costLabel && (
            <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-slate-200/60 pt-3 dark:border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                Project value
              </span>
              <span className="text-base font-bold tabular-nums text-blue-700 dark:text-blue-400">
                {costLabel}
              </span>
            </div>
          )}
        </div>

        {/* ═══ Delete confirmation overlay ═══ */}
        <AnimatePresence>
          {isOwner && confirmDelete && (
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
                Delete project?
              </p>
              <p className="mb-4 mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                "{work.title}"
              </p>
              <div className="flex w-full max-w-[220px] gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="flex-1 rounded border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
                >
                  {deleting ? (
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

      {/* ═══ Full-screen viewer ═══ */}
      <AnimatePresence>
        {viewerOpen && (
          <ImageViewer
            beforeUrl={work.before_image_url}
            afterUrl={work.after_image_url}
            title={work.title}
            onClose={() => setViewerOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}