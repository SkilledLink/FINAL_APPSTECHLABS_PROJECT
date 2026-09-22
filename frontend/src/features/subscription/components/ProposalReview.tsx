// src/features/subscription/components/ProposalReview.tsx
import { useState } from 'react';
import { Sparkles, Loader2, CheckSquare, XSquare, RefreshCw } from 'lucide-react';
import type { AIProposal } from '../types/subscription.types';
import ProposalCard from './ProposalCard';

interface ProposalReviewProps {
  proposals: AIProposal[];
  loading: boolean;
  generating: boolean;
  onGenerate: () => Promise<void>;
  onAccept: (id: string, finalValue?: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
  onAcceptBatch: (ids: string[]) => Promise<void>;
  onRejectBatch: (ids: string[]) => Promise<void>;
}

export default function ProposalReview({
  proposals,
  loading,
  generating,
  onGenerate,
  onAccept,
  onReject,
  onAcceptBatch,
  onRejectBatch,
}: ProposalReviewProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState<'accept' | 'reject' | null>(null);

  const allIds = proposals.map((p) => p.id);
  const allSelected = allIds.length > 0 && selected.size === allIds.length;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allIds));
  };

  const handleBulkAccept = async () => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    setBulkBusy('accept');
    try {
      await onAcceptBatch(ids);
      setSelected(new Set());
    } finally {
      setBulkBusy(null);
    }
  };

  const handleBulkReject = async () => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    setBulkBusy('reject');
    try {
      await onRejectBatch(ids);
      setSelected(new Set());
    } finally {
      setBulkBusy(null);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:border-blue-400/20 dark:text-blue-400">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              AI Suggestions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {proposals.length > 0
                ? `${proposals.length} pending · review and apply`
                : 'No pending suggestions'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-blue-500/25 transition-colors hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50"
        >
          {generating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {generating ? 'Generating…' : 'Generate'}
        </button>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading suggestions…
          </div>
        ) : proposals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300/70 bg-slate-50/60 px-6 py-8 text-center dark:border-white/10 dark:bg-slate-950/40">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No pending suggestions. Click{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Generate
              </span>{' '}
              to ask AI to review your profile.
            </p>
          </div>
        ) : (
          <>
            {/* Bulk actions */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3 dark:border-white/10">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950"
                />
                {allSelected ? 'Deselect all' : 'Select all'}
                {selected.size > 0 && (
                  <span className="ml-1 rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                    {selected.size}
                  </span>
                )}
              </label>

              {selected.size > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBulkReject}
                    disabled={bulkBusy !== null}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200/80 bg-white/70 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-white disabled:opacity-50 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {bulkBusy === 'reject' ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <XSquare className="h-3 w-3" />
                    )}
                    Reject selected
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkAccept}
                    disabled={bulkBusy !== null}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-emerald-500/25 transition-colors hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50"
                  >
                    {bulkBusy === 'accept' ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <CheckSquare className="h-3 w-3" />
                    )}
                    Accept selected
                  </button>
                </div>
              )}
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {proposals.map((p) => (
                <div key={p.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                    className="mt-3 h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                  <div className="min-w-0 flex-1">
                    <ProposalCard
                      proposal={p}
                      onAccept={(v) => onAccept(p.id, v)}
                      onReject={() => onReject(p.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}