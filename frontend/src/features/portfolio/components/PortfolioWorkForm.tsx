// src/features/portfolio/components/PortfolioWorkForm.tsx
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Loader2,
  Save,
  X,
  Briefcase,
  Star,
  Calendar,
  Link2,
  Clock,
  UserCheck,
  Coins,
  MessageSquare,
  UploadCloud,
  ImageIcon,
  ArrowRight,
} from 'lucide-react';
import type {
  ClientType,
  DurationUnit,
  Service,
  Work,
  WorkCreateInput,
} from '../types/portfolio.types';
import { CLIENT_TYPES, DURATION_UNITS } from '../types/portfolio.types';

export interface WorkImageFiles {
  before?: File;
  after?: File;
}

interface PortfolioWorkFormProps {
  open: boolean;
  initial?: Work | null;
  services: Service[];
  saving?: boolean;
  onClose: () => void;
  onSubmit: (input: WorkCreateInput, files: WorkImageFiles) => Promise<void>;
}

const EMPTY: WorkCreateInput = {
  title: '',
  description: '',
  service_category: '',
  location: '',
  completed_at: undefined,
  duration_value: undefined,
  duration_unit: undefined,
  team_size: undefined,
  client_type: undefined,
  cost: undefined,
  client_name: '',
  client_testimonial: '',
  rating: undefined,
  service_id: undefined,
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

/* ───────────────────────── Glass design tokens ───────────────────────── */

const GLASS_LABEL =
  'mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300';

const GLASS_INPUT =
  'w-full rounded-lg border border-white/50 dark:border-white/10 ' +
  'bg-white/60 dark:bg-slate-800/40 backdrop-blur-md ' +
  'px-3.5 py-2.5 text-sm text-slate-900 dark:text-white ' +
  'placeholder:text-slate-400 dark:placeholder:text-slate-500 ' +
  'focus:bg-white/90 dark:focus:bg-slate-900/70 ' +
  'focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/25 ' +
  'transition-all duration-200 shadow-sm ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

const GLASS_SELECT = `${GLASS_INPUT} appearance-none pr-9`;

const GLASS_SECTION_TITLE =
  'mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400';

const GLASS_SECTION_CARD =
  'space-y-4 rounded-xl border border-white/50 bg-white/40 p-4 backdrop-blur-md ' +
  'dark:border-white/10 dark:bg-slate-800/30';

/* ───────────────────────── Image upload card ───────────────────────── */

type ImageVariant = 'before' | 'after';

function ImageUploadCard({
  variant,
  label,
  file,
  preview,
  inputRef,
  disabled,
  onPick,
  onClear,
  error,
}: {
  variant: ImageVariant;
  label: string;
  file: File | null;
  preview: string | null;
  inputRef: React.RefObject<HTMLInputElement>;
  disabled: boolean;
  onPick: (f: File | null) => void;
  onClear: () => void;
  error?: string | null;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const hasImage = Boolean(preview);

  const badgeCls =
    variant === 'before'
      ? 'border-slate-300/70 bg-slate-100/80 text-slate-700 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-300'
      : 'border-blue-500/25 bg-blue-500/10 text-blue-700 dark:border-blue-400/25 dark:text-blue-300';

  const handleFiles = (files: FileList | null) => {
    setLocalError(null);
    if (!files || files.length === 0) return;
    const f = files[0];

    if (!f.type.startsWith('image/')) {
      setLocalError('Please pick an image file.');
      return;
    }
    if (f.size > MAX_IMAGE_BYTES) {
      setLocalError('Image must be under 5 MB.');
      return;
    }
    onPick(f);
  };

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border bg-white/40 backdrop-blur-md transition-all
        dark:bg-slate-800/30
        ${
          dragOver
            ? 'border-blue-500/70 ring-2 ring-blue-500/25'
            : 'border-white/60 dark:border-white/10'
        }`}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-slate-200/60 px-3 py-2 dark:border-white/10">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeCls}`}
        >
          {label}
        </span>

        {hasImage && !disabled && (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] font-semibold text-slate-500 transition-colors hover:text-rose-500 dark:text-slate-400"
          >
            Remove
          </button>
        )}
      </div>

      {/* ── Body ── */}
      {hasImage ? (
        <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-900">
          <img
            src={preview!}
            alt={label}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (!disabled) handleFiles(e.dataTransfer.files);
          }}
          className={`group relative flex aspect-[4/3] w-full flex-col items-center justify-center gap-2.5 px-4 py-6 text-center transition-colors
            ${
              dragOver
                ? 'bg-blue-500/10'
                : 'hover:bg-blue-500/5 disabled:cursor-not-allowed disabled:opacity-60'
            }`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-600 shadow-sm shadow-blue-500/10 transition-transform group-hover:scale-105 dark:border-blue-400/20 dark:text-blue-400">
            <UploadCloud className="h-5 w-5" />
          </span>

          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              {dragOver ? 'Drop to upload' : 'Drop image here'}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
              or{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                click to browse
              </span>
            </p>
          </div>

          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            PNG · JPG · max 5 MB
          </p>
        </button>
      )}

      {/* ── Footer when filled ── */}
      {hasImage && (
        <div className="flex items-center justify-between gap-2 border-t border-slate-200/60 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-slate-900/40">
          <span className="flex min-w-0 flex-1 items-center gap-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
            <ImageIcon className="h-3 w-3 shrink-0 text-blue-500" />
            <span className="truncate">
              {file ? file.name : 'Current image'}
            </span>
          </span>

          {!disabled && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Replace
            </button>
          )}
        </div>
      )}

      {/* ── Local error ── */}
      {(localError || error) && (
        <div className="border-t border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-[10px] font-medium text-rose-600 dark:text-rose-400">
          {localError ?? error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

export default function PortfolioWorkForm({
  open,
  initial,
  services,
  saving = false,
  onClose,
  onSubmit,
}: PortfolioWorkFormProps) {
  /* ── Hooks first ── */
  const [form, setForm] = useState<WorkCreateInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);

  const firstFieldRef = useRef<HTMLInputElement>(null);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);
  const createdUrls = useRef<string[]>([]);

  useEffect(() => {
    if (!open) return;

    createdUrls.current.forEach(URL.revokeObjectURL);
    createdUrls.current = [];

    if (initial) {
      setForm({
        title: initial.title,
        description: initial.description ?? '',
        service_category: initial.service_category ?? '',
        location: initial.location ?? '',
        completed_at: initial.completed_at ?? undefined,
        duration_value: initial.duration_value ?? undefined,
        duration_unit: (initial.duration_unit ?? undefined) as
          | DurationUnit
          | undefined,
        team_size: initial.team_size ?? undefined,
        client_type: (initial.client_type ?? undefined) as
          | ClientType
          | undefined,
        cost: initial.cost ?? undefined,
        client_name: initial.client_name ?? '',
        client_testimonial: initial.client_testimonial ?? '',
        rating: initial.rating ?? undefined,
        service_id: initial.service_id ?? undefined,
      });
      setBeforePreview(initial.before_image_url ?? null);
      setAfterPreview(initial.after_image_url ?? null);
    } else {
      setForm(EMPTY);
      setBeforePreview(null);
      setAfterPreview(null);
    }

    setBeforeFile(null);
    setAfterFile(null);
    setError(null);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    const focusTimer = window.setTimeout(
      () => firstFieldRef.current?.focus(),
      50
    );

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [open, initial, saving, onClose]);

  useEffect(() => {
    return () => {
      createdUrls.current.forEach(URL.revokeObjectURL);
      createdUrls.current = [];
    };
  }, []);

  if (!open) return null;

  const update = (patch: Partial<WorkCreateInput>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const pickBefore = (f: File | null) => {
    if (f) {
      const url = URL.createObjectURL(f);
      createdUrls.current.push(url);
      setBeforeFile(f);
      setBeforePreview(url);
    } else {
      setBeforeFile(null);
      setBeforePreview(null);
    }
  };

  const pickAfter = (f: File | null) => {
    if (f) {
      const url = URL.createObjectURL(f);
      createdUrls.current.push(url);
      setAfterFile(f);
      setAfterPreview(url);
    } else {
      setAfterFile(null);
      setAfterPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setError(null);

    if (!form.title.trim() || form.title.trim().length < 2) {
      setError('Title must be at least 2 characters.');
      firstFieldRef.current?.focus();
      return;
    }

    try {
      await onSubmit(
        {
          ...form,
          title: form.title.trim(),
          description: form.description?.trim() || undefined,
          service_category: form.service_category?.trim() || undefined,
          location: form.location?.trim() || undefined,
          client_name: form.client_name?.trim() || undefined,
          client_testimonial: form.client_testimonial?.trim() || undefined,
          completed_at:
            form.completed_at && typeof form.completed_at === 'string'
              ? new Date(form.completed_at).toISOString()
              : undefined,
        },
        {
          before: beforeFile ?? undefined,
          after: afterFile ?? undefined,
        }
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto
                 p-3 pt-4 pb-4 sm:items-center sm:p-6
                 bg-blue-950/75 backdrop-blur-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="work-form-title"
      aria-busy={saving}
    >
      <div
        className="fixed inset-0"
        onClick={!saving ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        className="relative my-auto flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl
                   border border-white/60 dark:border-white/10
                   bg-white/90 dark:bg-slate-900/90
                   shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]
                   backdrop-blur-3xl max-h-[88vh]"
      >
        <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />

        {/* Header */}
        <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-slate-200/60 px-6 py-4 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="work-form-title"
                className="text-base font-semibold tracking-tight text-slate-900 dark:text-white"
              >
                {initial ? 'Edit work project' : 'Add new work project'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {saving
                  ? 'Saving your changes…'
                  : 'Showcase your project details and feedback'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-md
                       bg-slate-200/60 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800
                       text-slate-500 dark:text-slate-400 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form
          id="portfolio-work-form"
          onSubmit={handleSubmit}
          className="relative z-10 flex-1 space-y-5 overflow-y-auto p-6
                     [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3
                         text-xs font-medium text-rose-600 dark:text-rose-400 backdrop-blur-md"
            >
              {error}
            </div>
          )}

          {/* ═══════════ Before / After ═══════════ */}
          <div className={GLASS_SECTION_CARD}>
            <div className={GLASS_SECTION_TITLE}>
              <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
              <span>Project images</span>
              <span className="ml-1 text-[10px] font-medium normal-case tracking-normal text-slate-400 dark:text-slate-500">
                · optional
              </span>
            </div>

            <p className="-mt-2 mb-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Add a before and after photo to show your work in action.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ImageUploadCard
                variant="before"
                label="Before"
                file={beforeFile}
                preview={beforePreview}
                inputRef={beforeInputRef}
                disabled={saving}
                onPick={pickBefore}
                onClear={() => pickBefore(null)}
              />

              <ImageUploadCard
                variant="after"
                label="After"
                file={afterFile}
                preview={afterPreview}
                inputRef={afterInputRef}
                disabled={saving}
                onPick={pickAfter}
                onClear={() => pickAfter(null)}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="wf-title" className={GLASS_LABEL}>
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="wf-title"
              ref={firstFieldRef}
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              disabled={saving}
              placeholder="e.g. House Electrical Installation"
              className={GLASS_INPUT}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="wf-desc" className={GLASS_LABEL}>
              Description
            </label>
            <textarea
              id="wf-desc"
              value={form.description ?? ''}
              onChange={(e) => update({ description: e.target.value })}
              disabled={saving}
              rows={3}
              placeholder="What did you do? Challenges, materials, outcome…"
              className={`${GLASS_INPUT} resize-none`}
            />
          </div>

          {/* Category & Location */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="wf-category" className={GLASS_LABEL}>
                Category
              </label>
              <input
                id="wf-category"
                value={form.service_category ?? ''}
                onChange={(e) => update({ service_category: e.target.value })}
                disabled={saving}
                placeholder="e.g. Electrical"
                className={GLASS_INPUT}
              />
            </div>
            <div>
              <label htmlFor="wf-location" className={GLASS_LABEL}>
                Location
              </label>
              <input
                id="wf-location"
                value={form.location ?? ''}
                onChange={(e) => update({ location: e.target.value })}
                disabled={saving}
                placeholder="e.g. Odza, Yaoundé"
                className={GLASS_INPUT}
              />
            </div>
          </div>

          {/* Completed on & Linked service */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="wf-completed"
                className={`${GLASS_LABEL} flex items-center gap-1.5`}
              >
                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                Completed on
              </label>
              <input
                id="wf-completed"
                type="date"
                value={
                  typeof form.completed_at === 'string'
                    ? form.completed_at.slice(0, 10)
                    : ''
                }
                onChange={(e) =>
                  update({ completed_at: e.target.value || undefined })
                }
                disabled={saving}
                className={GLASS_INPUT}
              />
            </div>
            <div>
              <label
                htmlFor="wf-service"
                className={`${GLASS_LABEL} flex items-center gap-1.5`}
              >
                <Link2 className="h-3.5 w-3.5 text-blue-500" />
                Linked service
              </label>
              <select
                id="wf-service"
                value={form.service_id ?? ''}
                onChange={(e) =>
                  update({ service_id: e.target.value || undefined })
                }
                disabled={saving}
                className={GLASS_SELECT}
              >
                <option value="" className="dark:bg-slate-900">
                  None
                </option>
                {services.map((s) => (
                  <option key={s.id} value={s.id} className="dark:bg-slate-900">
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration / Unit / Team size */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="wf-duration"
                className={`${GLASS_LABEL} flex items-center gap-1.5`}
              >
                <Clock className="h-3.5 w-3.5 text-blue-500" />
                Duration
              </label>
              <input
                id="wf-duration"
                type="number"
                min={0}
                value={form.duration_value ?? ''}
                onChange={(e) =>
                  update({
                    duration_value:
                      e.target.value === ''
                        ? undefined
                        : Number(e.target.value),
                  })
                }
                disabled={saving}
                placeholder="e.g. 3"
                className={GLASS_INPUT}
              />
            </div>
            <div>
              <label htmlFor="wf-unit" className={GLASS_LABEL}>
                Unit
              </label>
              <select
                id="wf-unit"
                value={form.duration_unit ?? ''}
                onChange={(e) =>
                  update({
                    duration_unit: (e.target.value || undefined) as
                      | DurationUnit
                      | undefined,
                  })
                }
                disabled={saving}
                className={GLASS_SELECT}
              >
                <option value="" className="dark:bg-slate-900">
                  —
                </option>
                {DURATION_UNITS.map((u) => (
                  <option key={u} value={u} className="dark:bg-slate-900">
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="wf-team" className={GLASS_LABEL}>
                Team size
              </label>
              <input
                id="wf-team"
                type="number"
                min={1}
                value={form.team_size ?? ''}
                onChange={(e) =>
                  update({
                    team_size:
                      e.target.value === ''
                        ? undefined
                        : Number(e.target.value),
                  })
                }
                disabled={saving}
                placeholder="e.g. 2"
                className={GLASS_INPUT}
              />
            </div>
          </div>

          {/* Client type & Cost */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="wf-client-type"
                className={`${GLASS_LABEL} flex items-center gap-1.5`}
              >
                <UserCheck className="h-3.5 w-3.5 text-blue-500" />
                Client type
              </label>
              <select
                id="wf-client-type"
                value={form.client_type ?? ''}
                onChange={(e) =>
                  update({
                    client_type: (e.target.value || undefined) as
                      | ClientType
                      | undefined,
                  })
                }
                disabled={saving}
                className={GLASS_SELECT}
              >
                <option value="" className="dark:bg-slate-900">
                  —
                </option>
                {CLIENT_TYPES.map((c) => (
                  <option key={c} value={c} className="dark:bg-slate-900">
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="wf-cost"
                className={`${GLASS_LABEL} flex items-center gap-1.5`}
              >
                <Coins className="h-3.5 w-3.5 text-blue-500" />
                Cost (XAF)
              </label>
              <input
                id="wf-cost"
                type="number"
                min={0}
                step={500}
                value={form.cost ?? ''}
                onChange={(e) =>
                  update({
                    cost:
                      e.target.value === ''
                        ? undefined
                        : Number(e.target.value),
                  })
                }
                disabled={saving}
                placeholder="e.g. 25000"
                className={GLASS_INPUT}
              />
            </div>
          </div>

          {/* Client feedback section */}
          <div className={GLASS_SECTION_CARD}>
            <div className={GLASS_SECTION_TITLE}>
              <Star className="h-3.5 w-3.5 text-blue-500" />
              <span>Client feedback</span>
              <span className="ml-1 text-[10px] font-medium normal-case tracking-normal text-slate-400 dark:text-slate-500">
                · optional
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="wf-client-name" className={GLASS_LABEL}>
                  Client name
                </label>
                <input
                  id="wf-client-name"
                  value={form.client_name ?? ''}
                  onChange={(e) => update({ client_name: e.target.value })}
                  disabled={saving}
                  placeholder="e.g. Mrs. Ngu"
                  className={GLASS_INPUT}
                />
              </div>

              <div>
                <label className={GLASS_LABEL}>Rating</label>
                <div className="flex gap-1.5 pt-0.5">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        update({ rating: form.rating === r ? undefined : r })
                      }
                      className={`flex h-9 flex-1 items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
                        form.rating === r
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                          : 'border border-white/50 bg-white/50 text-slate-600 backdrop-blur-md hover:bg-white/70 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      {r} ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="wf-testimonial"
                className={`${GLASS_LABEL} flex items-center gap-1.5`}
              >
                <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                Testimonial
              </label>
              <textarea
                id="wf-testimonial"
                value={form.client_testimonial ?? ''}
                onChange={(e) =>
                  update({ client_testimonial: e.target.value })
                }
                disabled={saving}
                rows={2}
                placeholder="What did the client say?"
                className={`${GLASS_INPUT} resize-none`}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="relative z-10 flex shrink-0 items-center justify-end gap-3 border-t border-slate-200/60 px-6 py-3.5 dark:border-slate-800/60">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg bg-slate-200/60 px-4 py-2 text-xs font-semibold
                       text-slate-700 backdrop-blur-md transition-all
                       hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-300
                       dark:hover:bg-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600
                       px-5 py-2 text-xs font-semibold text-white shadow-md
                       shadow-blue-500/25 transition-all hover:bg-blue-500
                       active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {saving
              ? 'Saving…'
              : initial
              ? 'Save changes'
              : 'Add project'}
          </button>
        </div>

        {/* Loading overlay */}
        {saving && (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3
                       bg-white/70 backdrop-blur-md dark:bg-slate-900/70"
            role="status"
            aria-live="polite"
          >
            <div className="relative flex h-14 w-14 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-white/80 shadow-lg shadow-blue-500/20 backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/80">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </span>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Saving project…
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Please wait, this only takes a moment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}