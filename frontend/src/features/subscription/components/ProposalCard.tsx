// src/features/subscription/components/ProposalCard.tsx
import { useState } from 'react';
import { Check, X, Pencil, Loader2, Sparkles } from 'lucide-react';
import type { AIProposal } from '../types/subscription.types';

interface ProposalCardProps {
  proposal: AIProposal;
  onAccept: (finalValue?: string) => Promise<void>;
  onReject: () => Promise<void>;
}

const FIELD_LABELS: Record<string, string> = {
  'professional.headline': 'Professional headline',
  'professional.bio': 'Professional bio',
  'professional.availability_notes': 'Availability notes',
  'portfolio.headline': 'Portfolio headline',
  'portfolio.tagline': 'Portfolio tagline',
  'portfolio.bio': 'Portfolio bio',
  'portfolio.mission_statement': 'Mission statement',
  'portfolio.business_name': 'Business name',
  'portfolio.business_description': 'Business description',
};

function humanizePath(path: string): string {
  if (FIELD_LABELS[path]) return FIELD_LABELS[path];

  // service:<uuid>.description etc.
  const m = path.match(/^(service|work):([\w-]+)\.(.+)$/);
  if (m) {
    const [, scope, , field] = m;
    const scopeLabel = scope === 'service' ? 'Service' : 'Work';
    const fieldLabel = field.replace(/_/g, ' ');
    return `${scopeLabel} — ${fieldLabel}`;
  }
  return path;
}

const IMPACT_COLORS: Record<string, string> = {
  high: 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  medium: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  low: 'border-slate-300/40 bg-slate-100/60 text-slate-600 dark:text-slate-300',
};

export default function ProposalCard({
  proposal,
  onAccept,
  onReject,
}: ProposalCardProps) {
  const [busy, setBusy] = useState<'accept' | 'reject' | null>(null);
  const [editing, setEditing] = useState(false);
  const [customValue, setCustomValue] = useState(proposal.proposed_value);

  const handleAccept = async () => {
    setBusy('accept');
    try {
      await onAccept(editing ? customValue : undefined);
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async () => {
    setBusy('reject');
    try {
      await onReject();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white/85 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:border-blue-400/20 dark:text-blue-400">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="truncate text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {humanizePath(proposal.field_path)}
          </span>
        </div>
        <span
          className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${IMPACT_COLORS[proposal.impact] ?? IMPACT_COLORS.low}`}
        >
          {proposal.impact}
        </span>
      </div>

      {/* Current value */}
      {proposal.current_value && (
        <div className="mb-3 rounded-lg border border-slate-200/60 bg-slate-50/60 p-2.5 dark:border-white/10 dark:bg-slate-950/40">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Current
          </div>
          <p className="text-xs leading-relaxed text-slate-600 line-through decoration-slate-400/40 dark:text-slate-400">
            {proposal.current_value}
          </p>
        </div>
      )}

      {/* Proposed value */}
      <div className="mb-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-2.5 dark:bg-emerald-500/[0.06]">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          Proposed
        </div>
        {editing ? (
          <textarea
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            rows={4}
            className="w-full resize-none rounded border border-emerald-500/20 bg-white/70 px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 dark:bg-slate-950/60 dark:text-slate-100"
          />
        ) : (
          <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200">
            {proposal.proposed_value}
          </p>
        )}
      </div>

      {/* Reason */}
      {proposal.reason && (
        <div className="mb-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-600 dark:text-slate-300">
            Why:
          </span>{' '}
          {proposal.reason}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          disabled={busy !== null}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200/80 bg-white/70 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-white disabled:opacity-50 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Pencil className="h-3 w-3" />
          {editing ? 'Cancel edit' : 'Customize'}
        </button>

        <button
          type="button"
          onClick={handleReject}
          disabled={busy !== null}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200/80 bg-white/70 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-white disabled:opacity-50 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {busy === 'reject' ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <X className="h-3 w-3" />
          )}
          Reject
        </button>

        <button
          type="button"
          onClick={handleAccept}
          disabled={busy !== null}
          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-emerald-500/25 transition-colors hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50"
        >
          {busy === 'accept' ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Check className="h-3 w-3" />
          )}
          Accept
        </button>
      </div>
    </div>
  );
}