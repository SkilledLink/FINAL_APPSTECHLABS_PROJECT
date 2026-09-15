// src/features/reports/components/ReportModal.tsx
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Check, Flag, Loader2, Send, X } from 'lucide-react';
import { useReport } from '../hooks/useReport';
import {
  REPORT_REASONS,
  type ReportReason,
  type ReportTargetType,
} from '../types/report.types';

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  targetId: string;
  targetType: ReportTargetType;
  /** Optional friendly name shown in the header, e.g. "John Doe" */
  targetLabel?: string;
}

/* ───────────────────────── Glass design tokens ───────────────────────── */

const GLASS_LABEL =
  'mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300';

const GLASS_INPUT =
  'w-full rounded-lg border border-white/50 dark:border-white/10 ' +
  'bg-white/50 dark:bg-slate-800/40 backdrop-blur-md ' +
  'px-3.5 py-2 text-sm text-slate-900 dark:text-white ' +
  'placeholder:text-slate-400 dark:placeholder:text-slate-500 ' +
  'focus:bg-white/80 dark:focus:bg-slate-900/70 ' +
  'focus:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/25 ' +
  'transition-all duration-200 shadow-sm ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

export default function ReportModal({
  open,
  onClose,
  targetId,
  targetType,
  targetLabel,
}: ReportModalProps) {
  const { submitReport, loading, error, success, reset } = useReport();

  const [reason, setReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  /* Reset internal state whenever the modal opens fresh */
  useEffect(() => {
    if (open) {
      setReason('');
      setDescription('');
      setValidationError(null);
      reset();
    }
  }, [open, reset]);

  /* Escape to close + body scroll lock */
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setValidationError(null);

    if (!reason) {
      setValidationError('Please select a reason.');
      return;
    }
    if (reason === 'other' && !description.trim()) {
      setValidationError('Please describe the issue.');
      return;
    }
    if (description.length > 1000) {
      setValidationError('Description must be 1000 characters or fewer.');
      return;
    }

    await submitReport({
      targetId,
      targetType,
      reason,
      description: description.trim() || undefined,
    });
  };

  const displayError = validationError || error;

  const modal = (
    <div
      className="fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto
                 p-3 pt-4 pb-4 sm:items-center sm:p-6
                 bg-blue-950/75 backdrop-blur-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      {/* Backdrop — inert while submitting */}
      <div
        className="fixed inset-0"
        onClick={!loading ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Main Glass Modal Card */}
      <div
        className="relative my-auto flex w-full max-w-lg flex-col overflow-hidden rounded-2xl
                   border border-white/60 dark:border-white/10
                   bg-white/90 dark:bg-slate-900/90
                   shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]
                   backdrop-blur-3xl max-h-[88vh]"
      >
        {/* Soft glow accent */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl" />

        {/* Header */}
        <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-slate-200/60 px-6 py-4 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Flag className="h-4 w-4" />
            </div>
            <div>
              <h3
                id="report-modal-title"
                className="text-base font-semibold tracking-tight text-slate-900 dark:text-white"
              >
                Report {targetType}
              </h3>
              {targetLabel && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {targetLabel}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-md
                       bg-slate-200/60 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800
                       text-slate-500 dark:text-slate-400 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Success state */}
        {success ? (
          <div className="relative z-10 px-6 py-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Check className="h-7 w-7" />
            </div>
            <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
              Report submitted
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Thanks for helping keep the community safe. Our moderators will
              review it shortly.
            </p>
          </div>
        ) : (
          /* Scrollable Form Body */
          <form
            id="report-form"
            onSubmit={handleSubmit}
            className="relative z-10 flex-1 space-y-4 overflow-y-auto p-6
                       [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {displayError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3
                           text-xs font-medium text-rose-600 dark:text-rose-400 backdrop-blur-md"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{displayError}</span>
              </div>
            )}

            {/* Reason picker */}
            <div>
              <label className={GLASS_LABEL}>
                Reason <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1
                              [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {REPORT_REASONS.map((opt) => {
                  const selected = reason === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setReason(opt.value)}
                      disabled={loading}
                      className={`w-full text-left px-3 py-2 rounded-lg border backdrop-blur-md transition-all
                        ${
                          selected
                            ? 'border-rose-500/60 bg-rose-500/10 shadow-sm shadow-rose-500/20'
                            : 'border-white/50 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 hover:bg-white/70 dark:hover:bg-slate-800/60'
                        }
                        disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {opt.label}
                        </span>
                        {selected && (
                          <Check className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {opt.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="report-desc" className={GLASS_LABEL}>
                Additional details{' '}
                <span className="text-slate-400">
                  {reason === 'other' ? '(required)' : '(optional)'}
                </span>
              </label>
              <textarea
                id="report-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
                maxLength={1000}
                placeholder="Tell us what happened..."
                className={`${GLASS_INPUT} resize-none`}
              />
              <div className="mt-1 text-right text-xs text-slate-400">
                {description.length}/1000
              </div>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="relative z-10 flex shrink-0 items-center justify-end gap-3 border-t border-slate-200/60 px-6 py-3.5 dark:border-slate-800/60">
          {success ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-200/60 px-4 py-2 text-xs font-semibold
                         text-slate-700 backdrop-blur-md transition-all
                         hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-300
                         dark:hover:bg-slate-800"
            >
              Close
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
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
                disabled={loading || !reason}
                className="flex items-center justify-center gap-2 rounded-lg bg-rose-600
                           px-5 py-2 text-xs font-semibold text-white shadow-md
                           shadow-rose-500/25 transition-all hover:bg-rose-500
                           active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {loading ? 'Submitting…' : 'Submit report'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}