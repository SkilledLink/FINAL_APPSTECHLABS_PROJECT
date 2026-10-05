// src/features/subscription/components/DeepAnalysisPanel.tsx
import { useState } from 'react';
import {
  Brain,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Target,
  Play,
} from 'lucide-react';
import type { DeepAnalysisResponse } from '../types/subscription.types';
import { useRateLimitCooldown } from '../hooks/useRateLimitCooldown';

interface DeepAnalysisPanelProps {
  analysis: DeepAnalysisResponse | null;
  analyzing: boolean;
  onRun: () => Promise<DeepAnalysisResponse | void>;
}

const SECTION_LABELS: Record<string, string> = {
  identity: 'Identity',
  services: 'Services',
  works: 'Works',
  availability: 'Availability',
  trust: 'Trust',
  completeness: 'Completeness',
};

const GRADE_COLORS: Record<string, string> = {
  'A+': 'text-emerald-600 dark:text-emerald-400',
  A: 'text-emerald-600 dark:text-emerald-400',
  'A-': 'text-emerald-600 dark:text-emerald-400',
  'B+': 'text-blue-600 dark:text-blue-400',
  B: 'text-blue-600 dark:text-blue-400',
  'B-': 'text-blue-600 dark:text-blue-400',
  'C+': 'text-amber-600 dark:text-amber-400',
  C: 'text-amber-600 dark:text-amber-400',
  'C-': 'text-amber-600 dark:text-amber-400',
  D: 'text-rose-600 dark:text-rose-400',
  F: 'text-rose-600 dark:text-rose-400',
};

const SEVERITY_CLASSES: Record<string, string> = {
  high: 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  medium: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  low: 'border-slate-300/40 bg-slate-100/60 text-slate-600 dark:text-slate-300',
};

function scoreBarColor(score: number): string {
  if (score >= 75) return 'bg-emerald-500';
  if (score >= 50) return 'bg-blue-500';
  if (score >= 30) return 'bg-amber-500';
  return 'bg-rose-500';
}

export default function DeepAnalysisPanel({
  analysis,
  analyzing,
  onRun,
}: DeepAnalysisPanelProps) {
  const [error, setError] = useState<string | null>(null);

  // ⬇️ separate cooldown key so proposals + deep analysis
  //    don't share the same countdown
  const { cooldown, isLocked, start, handleError } = useRateLimitCooldown(
    'deep-analysis-run',
    120,
  );

  const handleRun = async () => {
    if (analyzing || isLocked) return;
    setError(null);

    try {
      await onRun();
      start();
    } catch (err) {
      setError(
        handleError(err) ?? 'Analysis failed. Please try again.',
      );
    }
  };

  const runDisabled = analyzing || isLocked;

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:border-blue-400/20 dark:text-blue-400">
            <Brain className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Portfolio Deep Analysis
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Level 3 exclusive · AI reviews your entire portfolio
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRun}
          disabled={runDisabled}
          title={isLocked ? `Available in ${cooldown}s` : 'Run deep analysis'}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-blue-500/25 transition-colors hover:bg-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {analyzing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {analyzing
            ? 'Analyzing…'
            : isLocked
              ? `Wait ${cooldown}s`
              : analysis
                ? 'Re-analyze'
                : 'Run analysis'}
        </button>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5">
        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-600 dark:text-rose-400">
            {error}
            {cooldown > 0 && (
              <span className="ml-1 font-semibold">
                Retry in {cooldown}s.
              </span>
            )}
          </div>
        )}

        {!analysis && !analyzing && (
          <div className="rounded-lg border border-dashed border-slate-300/70 bg-slate-50/60 px-6 py-8 text-center dark:border-white/10 dark:bg-slate-950/40">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Click{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Run analysis
              </span>{' '}
              to get a full portfolio review — score, gaps, and prioritized
              next actions.
            </p>
          </div>
        )}

        {analyzing && !analysis && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <span>Reviewing your portfolio…</span>
          </div>
        )}

        {analysis && (
          <div className="space-y-5">
            {/* Overall score + grade */}
            <div className="flex items-center gap-5 rounded-lg border border-slate-200/70 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-slate-950/40">
              <div className="flex flex-col items-center">
                <span
                  className={`text-4xl font-extrabold tabular-nums ${GRADE_COLORS[analysis.grade] ?? 'text-slate-900 dark:text-white'}`}
                >
                  {analysis.overall_score}
                </span>
                <span
                  className={`mt-0.5 text-sm font-bold ${GRADE_COLORS[analysis.grade] ?? ''}`}
                >
                  {analysis.grade}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <TrendingUp className="h-3 w-3" />
                  Overall assessment
                </div>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {analysis.summary}
                </p>
              </div>
            </div>

            {/* Section scores */}
            <div>
              <div className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Section breakdown
              </div>
              <div className="space-y-2.5">
                {Object.entries(analysis.section_scores).map(([key, section]) => (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {SECTION_LABELS[key] ?? key}
                      </span>
                      <span className="font-semibold tabular-nums text-slate-600 dark:text-slate-400">
                        {section.score}
                        <span className="ml-1 text-[10px] font-normal text-slate-400">
                          ({Math.round(section.weight * 100)}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800/60">
                      <div
                        className={`h-full rounded-full ${scoreBarColor(section.score)}`}
                        style={{ width: `${section.score}%` }}
                      />
                    </div>
                    {section.notes && (
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                        {section.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Gaps */}
            {analysis.gaps.length > 0 && (
              <div>
                <div className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                  Gaps to close
                </div>
                <ul className="space-y-1.5">
                  {analysis.gaps.map((gap, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2 rounded-md border px-2.5 py-2 text-xs ${SEVERITY_CLASSES[gap.severity] ?? SEVERITY_CLASSES.low}`}
                    >
                      <span className="mt-0.5 shrink-0 rounded px-1 text-[9px] font-bold uppercase">
                        {gap.severity}
                      </span>
                      <span className="leading-relaxed">{gap.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div>
                <div className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  Recommendations
                </div>
                <ul className="space-y-1.5">
                  {analysis.recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300"
                    >
                      <span className="mt-0.5 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {rec.priority}
                      </span>
                      <span>{rec.action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next actions */}
            {analysis.suggested_next_actions.length > 0 && (
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.04] p-3.5 dark:bg-blue-500/[0.06]">
                <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                  <Target className="h-3 w-3" />
                  Do this week
                </div>
                <ul className="space-y-1.5">
                  {analysis.suggested_next_actions.map((action, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Meta */}
            <div className="border-t border-slate-200/60 pt-3 text-[10px] text-slate-400 dark:border-white/10 dark:text-slate-500">
              Powered by {analysis.provider} · {analysis.model}
              {analysis.prompt_tokens != null && (
                <span>
                  {' '}
                  · {analysis.prompt_tokens + (analysis.completion_tokens ?? 0)}{' '}
                  tokens
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}