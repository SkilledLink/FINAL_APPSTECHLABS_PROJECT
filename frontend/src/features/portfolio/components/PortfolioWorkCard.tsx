// src/features/portfolio/components/PortfolioServiceCard.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit3,
  Trash2,
  Clock,
  MapPin,
  Tag,
  AlertTriangle,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Service } from '../../../types/portfolio';

interface PortfolioServiceCardProps {
  service: Service;
  onEdit: () => void;
  onDelete: () => Promise<void> | void;
  isOwner?: boolean;
}

/* ───────────────────────── Shared tokens ───────────────────────── */

const CARD =
  'group relative flex flex-col justify-between overflow-hidden rounded-md ' +
  'border border-slate-200/70 bg-white/85 backdrop-blur-xl ' +
  'dark:border-white/10 dark:bg-slate-900/60 ' +
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

/* ═══════════════════════════════════════════════════════════════
 * Gallery Mosaic
 * ═══════════════════════════════════════════════════════════════ */

function GalleryMosaic({ images, onOpen }: { images: string[]; onOpen: (index: number) => void }) {
  const count = images.length;
  if (count === 0) return null;

  /* ── 1 image ── */
  if (count === 1) {
    return (
      <button
        type="button"
        onClick={() => onOpen(0)}
        className="mt-3 block w-full overflow-hidden rounded border border-slate-200/70 bg-slate-100 transition-transform hover:scale-[1.01] active:scale-[0.99] dark:border-white/10 dark:bg-slate-800"
        aria-label="Open image"
      >
        <div className="aspect-video w-full">
          <img src={images[0]} alt="" loading="lazy" className="h-full w-full object-cover" />
        </div>
      </button>
    );
  }

  /* ── 2 images ── */
  if (count === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {images.map((url, i) => (
          <button
            key={`${url}-${i}`}
            type="button"
            onClick={() => onOpen(i)}
            className="aspect-square overflow-hidden rounded border border-slate-200/70 bg-slate-100 transition-transform hover:scale-[1.02] active:scale-[0.98] dark:border-white/10 dark:bg-slate-800"
            aria-label={`Open image ${i + 1}`}
          >
            <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    );
  }

  /* ── 3 images ── */
  if (count === 3) {
    return (
      <div className="mt-3 grid aspect-[5/4] grid-cols-2 grid-rows-2 gap-1.5">
        <button
          type="button"
          onClick={() => onOpen(0)}
          className="row-span-2 overflow-hidden rounded border border-slate-200/70 bg-slate-100 transition-transform hover:scale-[1.02] active:scale-[0.98] dark:border-white/10 dark:bg-slate-800"
          aria-label="Open image 1"
        >
          <img src={images[0]} alt="" loading="lazy" className="h-full w-full object-cover" />
        </button>
        <button
          type="button"
          onClick={() => onOpen(1)}
          className="overflow-hidden rounded border border-slate-200/70 bg-slate-100 transition-transform hover:scale-[1.02] active:scale-[0.98] dark:border-white/10 dark:bg-slate-800"
          aria-label="Open image 2"
        >
          <img src={images[1]} alt="" loading="lazy" className="h-full w-full object-cover" />
        </button>
        <button
          type="button"
          onClick={() => onOpen(2)}
          className="overflow-hidden rounded border border-slate-200/70 bg-slate-100 transition-transform hover:scale-[1.02] active:scale-[0.98] dark:border-white/10 dark:bg-slate-800"
          aria-label="Open image 3"
        >
          <img src={images[2]} alt="" loading="lazy" className="h-full w-full object-cover" />
        </button>
      </div>
    );
  }

  /* ── 4+ images ── */
  const visible = images.slice(0, 4);
  const overflow = count - 4;

  return (
    <div className="mt-3 grid aspect-[5/4] grid-cols-2 grid-rows-2 gap-1.5">
      {visible.map((url, i) => {
        const isLast = i === 3;
        const showOverlay = isLast && overflow > 0;
        return (
          <button
            key={`${url}-${i}`}
            type="button"
            onClick={() => onOpen(i)}
            className="relative overflow-hidden rounded border border-slate-200/70 bg-slate-100 transition-transform hover:scale-[1.02] active:scale-[0.98] dark:border-white/10 dark:bg-slate-800"
            aria-label={showOverlay ? `Open gallery (${count} images)` : `Open image ${i + 1}`}
          >
            <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
            {showOverlay && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/65 text-white backdrop-blur-[1px]">
                <span className="text-lg font-bold leading-none">+{overflow}</span>
                <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider opacity-80">
                  more
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * Lightbox
 * ═══════════════════════════════════════════════════════════════ */

const SWIPE_THRESHOLD = 60; // px to trigger prev/next
const WHEEL_THROTTLE_MS = 350; // ms between wheel-driven navigation

function GalleryLightbox({
  images,
  startIndex,
  title,
  onClose,
}: {
  images: string[];
  startIndex: number;
  title: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const total = images.length;

  const wheelLockRef = useRef(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const goTo = useCallback((i: number) => setIndex(((i % total) + total) % total), [total]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  /* ── Preload neighbors so swipes feel instant ── */
  useEffect(() => {
    if (total <= 1) return;
    const neighbors = [images[(index + 1) % total], images[(index - 1 + total) % total]];
    neighbors.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, [index, images, total]);

  /* ── Keyboard nav + body scroll lock ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Home') goTo(0);
      else if (e.key === 'End') goTo(total - 1);
    };
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [prev, next, goTo, total, onClose]);

  /* ── Mouse wheel navigation (throttled) ── */
  const handleWheel = (e: React.WheelEvent) => {
    if (total <= 1) return;
    if (wheelLockRef.current) return;

    // Treat vertical OR horizontal wheel motion as navigation
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

    if (Math.abs(delta) < 10) return;

    wheelLockRef.current = true;
    window.setTimeout(() => {
      wheelLockRef.current = false;
    }, WHEEL_THROTTLE_MS);

    if (delta > 0) next();
    else prev();
  };

  /* ── Touch swipe (mobile) ── */
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartXRef.current = t.clientX;
    touchStartYRef.current = t.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current == null || touchStartYRef.current == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartXRef.current;
    const dy = t.clientY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    // Only treat it as a swipe if horizontal motion dominates
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;

    if (dx < 0) next();
    else prev();
  };

  /* ── Drag (framer-motion, works with mouse + touch on desktop) ── */
  const handleDragEnd = (_e: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const { offset, velocity } = info;
    const swipe = Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > 500;
    if (!swipe) return;
    if (offset.x < 0) next();
    else prev();
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[99999] flex flex-col bg-slate-950/95 backdrop-blur-xl"
      onClick={onClose}
      onWheel={handleWheel}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} gallery`}
    >
      {/* ── Top bar ── */}
      <div className="flex shrink-0 items-center justify-between gap-3 p-4 text-white">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="text-xs tabular-nums text-white/60">
            {index + 1} / {total}
          </p>
        </div>

        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close gallery"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ── Main image ── */}
      <div
        className="relative flex flex-1 select-none items-center justify-center overflow-hidden px-4 pb-2 sm:px-12"
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={index}
            src={images[index]}
            alt={`${title} – image ${index + 1}`}
            className="max-h-full max-w-full cursor-grab rounded-md object-contain shadow-2xl active:cursor-grabbing"
            draggable={false}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            drag={total > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={handleDragEnd}
          />
        </AnimatePresence>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:left-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next image"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:right-4"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnail strip (auto-scrolls to active) ── */}
      {total > 1 && <ThumbnailStrip images={images} index={index} onSelect={goTo} />}

      {/* ── Swipe hint (mobile only, shows briefly) ── */}
      {total > 1 && (
        <p className="shrink-0 pb-3 text-center text-[10px] uppercase tracking-[0.14em] text-white/40 sm:hidden">
          Swipe to browse
        </p>
      )}
    </motion.div>,
    document.body,
  );
}

/* ═══════════════════════════════════════════════════════════════
 * Thumbnail strip — auto-scrolls to keep active thumb in view
 * ═══════════════════════════════════════════════════════════════ */

function ThumbnailStrip({
  images,
  index,
  onSelect,
}: {
  images: string[];
  index: number;
  onSelect: (i: number) => void;
}) {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const active = strip.children[index] as HTMLElement | undefined;
    if (!active) return;
    active.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [index]);

  return (
    <div
      ref={stripRef}
      className="flex shrink-0 items-center justify-start gap-2 overflow-x-auto px-4 pb-3 pt-2 sm:justify-center"
      onClick={e => e.stopPropagation()}
      onWheel={e => {
        // Let horizontal scroll work without triggering lightbox nav
        e.stopPropagation();
      }}
    >
      {images.map((url, i) => (
        <button
          key={`${url}-${i}`}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Go to image ${i + 1}`}
          aria-current={i === index}
          className={`h-12 w-12 shrink-0 overflow-hidden rounded border-2 transition-all ${
            i === index
              ? 'scale-105 border-white opacity-100'
              : 'border-transparent opacity-50 hover:opacity-90'
          }`}
        >
          <img src={url} alt="" className="h-full w-full object-cover" draggable={false} />
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * Card
 * ═══════════════════════════════════════════════════════════════ */

export default function PortfolioServiceCard({
  service,
  onEdit,
  onDelete,
  isOwner = false,
}: PortfolioServiceCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const bannerUrl = service.banner_image_url ?? null;
  const gallery = service.gallery ?? [];

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

    if (service.starting_price === undefined || service.starting_price === null) {
      return 'Custom pricing';
    }

    const currencyCode = (service as { currency?: string }).currency || 'XAF';

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
    service.category || service.estimated_duration || service.service_area,
  );

  /* Combined list used by the lightbox (banner first if present) */
  const lightboxImages = bannerUrl ? [bannerUrl, ...gallery] : gallery;

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
        {/* ── Banner ── */}
        {bannerUrl && (
          <button
            type="button"
            onClick={() => setLightboxIndex(-1)} // -1 = show banner first
            className="relative block aspect-[16/7] w-full overflow-hidden bg-slate-100 dark:bg-slate-800"
            aria-label="Open banner"
          >
            <img
              src={bannerUrl}
              alt={service.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-950/30 to-transparent" />

            {service.is_emergency_service && (
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-sm bg-amber-500/95 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                <AlertTriangle className="h-2.5 w-2.5" />
                Urgent
              </span>
            )}
          </button>
        )}

        {/* ── Body ── */}
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
          <div>
            {/* Header: status + actions */}
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

                {service.is_emergency_service && !bannerUrl && (
                  <span className={CHIP_BLUE}>
                    <AlertTriangle className="h-2.5 w-2.5" />
                    Urgent
                  </span>
                )}
              </div>

              {isOwner && (
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
              )}
            </div>

            {/* Title */}
            <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400">
              {service.title}
            </h3>

            {/* Description */}
            {service.description && (
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {service.description}
              </p>
            )}

            {/* Gallery mosaic */}
            <GalleryMosaic images={gallery} onOpen={i => setLightboxIndex(i)} />

            {/* Metadata */}
            {hasMetadata && (
              <div className="mt-3.5 space-y-1.5 border-t border-slate-200/60 pt-3 text-[11px] font-medium text-slate-500 dark:border-white/10 dark:text-slate-400">
                {service.category && (
                  <div className="flex items-center gap-2">
                    <Tag size={13} className="shrink-0 text-blue-500" />
                    <span className="truncate">{service.category}</span>
                  </div>
                )}
                {service.estimated_duration && (
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="shrink-0 text-blue-500" />
                    <span className="truncate">{service.estimated_duration}</span>
                  </div>
                )}
                {service.service_area && (
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="shrink-0 text-blue-500" />
                    <span className="truncate">{service.service_area}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pricing footer */}
          <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-slate-200/60 pt-3 dark:border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              Rate
            </span>
            <span className="text-base font-bold tabular-nums text-blue-700 dark:text-blue-400">
              {formatPrice()}
            </span>
          </div>
        </div>

        {/* Delete confirm (owner only) */}
        <AnimatePresence>
          {isOwner && showConfirmDelete && (
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

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxIndex !== null && lightboxImages.length > 0 && (
          <GalleryLightbox
            images={lightboxImages}
            startIndex={
              // -1 means "open banner", which is index 0 once combined
              lightboxIndex < 0 ? 0 : bannerUrl ? lightboxIndex + 1 : lightboxIndex
            }
            title={service.title}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
