// src/features/subscription/components/UpgradeModal.tsx
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Check, Crown, Sparkles, ArrowRight } from 'lucide-react';
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

function detectProvider(phone: string): PaymentProvider {
  const digits = phone.replace(/\D/g, '');
  const local = digits.startsWith('237') ? digits.slice(3) : digits;
  // Orange: 69x, 655-659, 690-699
  if (
    local.startsWith('69') ||
    (parseInt(local.slice(0, 3), 10) >= 655 &&
      parseInt(local.slice(0, 3), 10) <= 659)
  ) {
    return 'orange_money';
  }
  return 'mtn_momo';
}

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
  const [result, setResult] = useState<{
    reference: string;
    instructions: string | null;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, submitting, onClose]);

  useEffect(() => {
    if (open) {
      setSelectedTierId(null);
      setPhone('');
      setError(null);
      setResult(null);
    }
  }, [open]);

  if (!open) return null;

  const selectedTier = tiers.find((t) => t.id === selectedTierId) ?? null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedTier) {
      setError('Please select a tier.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 8) {
      setError('Enter a valid phone number (min 8 digits).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await subscriptionService.initiatePayment({
        tier_id: selectedTier.id,
        provider: detectProvider(cleanPhone),
        payment_method: 'mobile_money',
        phone_number: cleanPhone,
        description: `Upgrade to ${selectedTier.name}`,
      });
      setResult({
        reference: res.reference,
        instructions: res.instructions,
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto bg-blue-950/75 p-3 pt-4 pb-4 backdrop-blur-2xl sm:items-center sm:p-6">
      <div className="fixed inset-0" onClick={!submitting ? onClose : undefined} aria-hidden="true" />

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
                {result ? 'Complete payment' : 'Choose your plan'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {result
                  ? 'Enter the PIN prompt on your phone to confirm'
                  : 'Unlock AI features and priority placement'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
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

          {result ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                  Payment initiated
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Reference: <span className="font-mono font-semibold">{result.reference}</span>
                </p>
              </div>

              {result.instructions && (
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                    Next step
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {result.instructions}
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Once you confirm on your phone, your subscription will
                activate automatically within a few seconds.
              </p>
            </div>
          ) : (
            <>
              {/* Tier selection */}
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

              {/* Phone */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Mobile money number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 237655123456"
                  className="w-full rounded-lg border border-white/50 bg-white/60 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/25 dark:border-white/10 dark:bg-slate-800/40 dark:text-white"
                />
                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  We'll detect MTN or Orange automatically from the number.
                </p>
              </div>

              {/* Summary */}
              {selectedTier && (
                <div className="rounded-lg border border-slate-200/70 bg-slate-50/60 p-3.5 dark:border-white/10 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      You'll be charged
                    </span>
                    <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                      {Number(selectedTier.price).toLocaleString()} {selectedTier.currency}
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
        {!result && (
          <div className="relative z-10 flex shrink-0 items-center justify-end gap-3 border-t border-slate-200/60 px-6 py-3.5 dark:border-slate-800/60">
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
              disabled={submitting || !selectedTier}
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
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}