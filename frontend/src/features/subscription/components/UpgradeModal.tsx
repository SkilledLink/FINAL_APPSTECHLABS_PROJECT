// src/features/subscription/components/UpgradeModal.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Loader2,
  Check,
  Crown,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';
import type {
  PaymentProvider,
  TierDetail,
} from '../types/subscription.types';
import TierBadge from './TierBadge';

interface UpgradeModalProps {
  open: boolean;
  tiers: TierDetail[];
  currentLevel?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

type Phase = 'select' | 'waiting' | 'success' | 'failed';

/* ── network detection ─────────────────────────────────── */

interface NetworkInfo {
  id: PaymentProvider;
  label: string;
  short: string;
  /** Tailwind classes for the badge */
  badge: string;
  /** Gradient for the accent bar */
  accent: string;
}

const MTN: NetworkInfo = {
  id: 'mtn_momo',
  label: 'MTN Mobile Money',
  short: 'MTN',
  badge:
    'border-yellow-400/40 bg-yellow-400/15 text-yellow-700 dark:text-yellow-300',
  accent: 'from-yellow-400 to-yellow-500',
};

const ORANGE: NetworkInfo = {
  id: 'orange_money',
  label: 'Orange Money',
  short: 'Orange',
  badge:
    'border-orange-400/40 bg-orange-400/15 text-orange-700 dark:text-orange-300',
  accent: 'from-orange-400 to-orange-500',
};

/** Returns the network info for a given phone, or null if undetermined. */
function detectNetwork(phone: string): NetworkInfo | null {
  const digits = phone.replace(/\D/g, '');
  const local = digits.startsWith('237') ? digits.slice(3) : digits;
  if (local.length < 2) return null;

  const p3 = parseInt(local.slice(0, 3), 10);
  const p2 = local.slice(0, 2);

  // MTN: 67x, 650-654, 680-684
  if (
    p2 === '67' ||
    (p3 >= 650 && p3 <= 654) ||
    (p3 >= 680 && p3 <= 684)
  ) {
    return MTN;
  }
  // Orange: 69x, 655-659, 685-689
  if (
    p2 === '69' ||
    (p3 >= 655 && p3 <= 659) ||
    (p3 >= 685 && p3 <= 689)
  ) {
    return ORANGE;
  }
  return null;
}

/* ── polling config ────────────────────────────────────── */

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 60_000;
const AUTO_CLOSE_MS = 2000;

/* ── component ─────────────────────────────────────────── */

export default function UpgradeModal({
  open,
  tiers,
  currentLevel = 0,
  onClose,
  onSuccess,
}: UpgradeModalProps) {
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>('select');
  const [reference, setReference] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [failureReason, setFailureReason] = useState<string | null>(null);
  const [waitSeconds, setWaitSeconds] = useState(0);

  const pollTimerRef = useRef<number | null>(null);
  const autoCloseRef = useRef<number | null>(null);

  const detected = useMemo(() => detectNetwork(phone), [phone]);

  /* Reset on open */
  useEffect(() => {
    if (!open) return;
    setSelectedTierId(null);
    setPhone('');
    setError(null);
    setSubmitting(false);
    setPhase('select');
    setReference(null);
    setInstructions(null);
    setFailureReason(null);
    setWaitSeconds(0);
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (autoCloseRef.current) {
      window.clearTimeout(autoCloseRef.current);
      autoCloseRef.current = null;
    }
  }, [open]);

  /* Body scroll lock + ESC */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting && phase !== 'waiting') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, submitting, phase, onClose]);

  /* Cleanup */
  useEffect(
    () => () => {
      if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
      if (autoCloseRef.current) window.clearTimeout(autoCloseRef.current);
    },
    []
  );

  if (!open) return null;

  const selectedTier = tiers.find((t) => t.id === selectedTierId) ?? null;

  /* ── polling ─────────────────────────────────────────── */

  const stopPolling = () => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const startPolling = (ref: string) => {
    const startedAt = Date.now();

    const tick = async () => {
      try {
        const s = await subscriptionService.getPaymentStatus(ref);
        const status = (s.status || '').toUpperCase();

        if (status === 'SUCCESSFUL' || status === 'SUCCESS' || status === 'SUCCESS') {
          stopPolling();
          setPhase('success');
          onSuccess?.();
          // Auto-close shortly after success so the user isn't left
          // staring at a screen they've already read.
          autoCloseRef.current = window.setTimeout(() => {
            onClose();
          }, AUTO_CLOSE_MS);
          return;
        }
        if (
          status === 'FAILED' ||
          status === 'CANCELLED' ||
          status === 'EXPIRED'
        ) {
          stopPolling();
          setFailureReason(s.reason ?? 'Payment was not completed.');
          setPhase('failed');
          return;
        }
        if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
          stopPolling();
          setFailureReason(
            'We did not receive a confirmation in time. If you approved on your phone, refresh in a moment.'
          );
          setPhase('failed');
        }
      } catch {
        /* transient network hiccup — keep polling */
      }
    };

    tick();
    pollTimerRef.current = window.setInterval(tick, POLL_INTERVAL_MS);
  };

  /* ── wait timer (cosmetic only) ──────────────────────── */

  useEffect(() => {
    if (phase !== 'waiting') return;
    setWaitSeconds(0);
    const t = window.setInterval(() => {
      setWaitSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(t);
  }, [phase]);

  /* ── submit ──────────────────────────────────────────── */

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    if (!selectedTier) {
      setError('Please select a plan.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 8) {
      setError('Enter a valid phone number (min 8 digits).');
      return;
    }
    if (!detected) {
      setError(
        'Could not detect MTN or Orange from this number. Use an MTN (67/68) or Orange (69) number.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await subscriptionService.initiatePayment({
        tier_id: selectedTier.id,
        provider: detected.id,
        payment_method: 'mobile_money',
        phone_number: cleanPhone,
        description: `Upgrade to ${selectedTier.name}`,
      });

      setReference(res.reference);
      setInstructions(res.instructions);
      setPhase('waiting');
      startPolling(res.reference);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── render ──────────────────────────────────────────── */

  const modal = (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto bg-blue-950/75 p-3 pt-4 pb-4 backdrop-blur-2xl sm:items-center sm:p-6">
      <div
        className="fixed inset-0"
        onClick={!submitting && phase !== 'waiting' ? onClose : undefined}
        aria-hidden="true"
      />

      <div className="relative my-auto flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-3xl dark:border-white/10 dark:bg-slate-900/90">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />

        {/* Header */}
        <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-slate-200/60 px-6 py-4 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {phase === 'success'
                  ? 'Subscription activated'
                  : phase === 'failed'
                  ? 'Payment not completed'
                  : phase === 'waiting'
                  ? 'Awaiting confirmation'
                  : 'Choose your plan'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {phase === 'select' && 'Unlock AI features and priority placement'}
                {phase === 'waiting' && 'Check your phone for the PIN prompt'}
                {phase === 'success' && 'You are all set'}
                {phase === 'failed' && 'You can try again'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting || phase === 'waiting'}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-200/60 text-slate-500 hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="relative z-10 flex-1 space-y-5 overflow-y-auto p-6"
        >
          {error && (
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {phase === 'success' && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Check className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Payment confirmed
              </h4>
              <p className="max-w-sm text-sm text-slate-600 dark:text-slate-400">
                Your subscription is active. All AI features and priority
                placement are now unlocked.
              </p>
              {reference && (
                <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                  {reference}
                </p>
              )}
            </div>
          )}

          {/* FAILED */}
          {phase === 'failed' && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Payment not completed
              </h4>
              <p className="max-w-sm text-sm text-slate-600 dark:text-slate-400">
                {failureReason ?? 'Please try again.'}
              </p>
              {reference && (
                <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                  Ref: {reference}
                </p>
              )}
            </div>
          )}

          {/* WAITING */}
          {phase === 'waiting' && detected && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400">
                    <Smartphone className="h-8 w-8" />
                  </div>
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-60" />
                    <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold">
                      {waitSeconds}
                    </span>
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Check your phone
                </h4>
                <p className="max-w-sm text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {instructions ??
                    `A ${detected.label} prompt has been sent to your phone.`}
                </p>
              </div>

              {/* Network chip */}
              <div className="flex justify-center">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${detected.badge}`}
                >
                  <Smartphone className="h-3 w-3" />
                  {detected.label}
                </span>
              </div>

              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                  What to do
                </div>
                <ol className="ml-4 list-decimal space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  <li>Open the mobile money prompt on your phone</li>
                  <li>Enter your PIN to approve</li>
                  <li>
                    Wait a moment — this screen updates automatically
                  </li>
                </ol>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Checking payment status…</span>
              </div>

              {reference && (
                <p className="text-center font-mono text-[11px] text-slate-400 dark:text-slate-500">
                  Ref: {reference}
                </p>
              )}
            </div>
          )}

          {/* SELECT */}
          {phase === 'select' && (
            <>
              <div>
                <div className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select a plan
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {tiers.map((tier) => {
                    const disabled = tier.level <= currentLevel;
                    const isSelected = selectedTierId === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedTierId(tier.id)}
                        className={`relative rounded-xl border p-4 text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/[0.04] ring-2 ring-blue-500/25'
                            : 'border-slate-200/80 bg-white/60 hover:border-blue-500/40 dark:border-white/10 dark:bg-slate-800/40'
                        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                {tier.name}
                              </span>
                              {tier.badge_name && (
                                <TierBadge tier={tier} size="sm" />
                              )}
                            </div>
                            {tier.description && (
                              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                {tier.description}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="mt-3 flex items-baseline gap-1">
                          <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
                            {Number(tier.price).toLocaleString()}
                          </span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {tier.currency} / {tier.duration_days}d
                          </span>
                        </div>
                        {disabled && (
                          <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Current or lower tier
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Phone + network badge */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Mobile money number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 237 6 71 23 45 67"
                    className="w-full rounded-lg border border-white/50 bg-white/60 pl-3.5 pr-24 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/25 dark:border-white/10 dark:bg-slate-800/40 dark:text-white"
                  />
                  {detected && (
                    <span
                      className={`absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${detected.badge}`}
                    >
                      <Smartphone className="h-3 w-3" />
                      {detected.short}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  {detected ? (
                    <>
                      <ShieldCheck className="h-3 w-3 text-emerald-500" />
                      Detected {detected.label}
                    </>
                  ) : (
                    "We'll detect MTN or Orange from your number."
                  )}
                </p>
              </div>

              {selectedTier && (
                <div className="rounded-lg border border-slate-200/70 bg-slate-50/60 p-3.5 dark:border-white/10 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      You'll be charged
                    </span>
                    <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                      {Number(selectedTier.price).toLocaleString()}{' '}
                      {selectedTier.currency}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Duration
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {selectedTier.duration_days} days
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </form>

        {/* Footer */}
        <div className="relative z-10 flex shrink-0 items-center justify-end gap-3 border-t border-slate-200/60 px-6 py-3.5 dark:border-slate-800/60">
          {phase === 'select' && (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg bg-slate-200/60 px-4 py-2 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !selectedTier || !detected}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {submitting ? 'Initiating…' : 'Pay now'}
                {!submitting && <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            </>
          )}

          {phase === 'waiting' && (
            <button
              type="button"
              onClick={() => {
                stopPolling();
                onClose();
              }}
              className="rounded-lg bg-slate-200/60 px-4 py-2 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Close (check later)
            </button>
          )}

          {phase === 'success' && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-500 active:scale-[0.98]"
            >
              Done
            </button>
          )}

          {phase === 'failed' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-slate-200/60 px-4 py-2 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhase('select');
                  setFailureReason(null);
                  setError(null);
                }}
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-500 active:scale-[0.98]"
              >
                Try again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}