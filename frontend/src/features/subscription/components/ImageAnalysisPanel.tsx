// src/features/subscription/components/ImageAnalysisPanel.tsx
import { useState } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Loader2,
  AlertCircle,
  Star,
  Wand2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';
import type { ImageAnalysisResponse } from '../types/subscription.types';

interface ImageItem {
  id: string;
  title: string;
  /** Full display URL (already resolved from supabase/cloudinary) */
  imageUrl: string;
  /** Optional service title for context */
  serviceTitle?: string;
  /** Optional location for context */
  location?: string;
}

interface ImageAnalysisPanelProps {
  /** Every work (or service) the user can choose from. */
  images: ImageItem[];
  /** Passed to the endpoint as `context.profession` if known. */
  profession?: string;
  /** The user's subscription level — panel is disabled below 3. */
  tierLevel: number;
  /** Whether to lock the whole panel (e.g. no active sub). */
  disabled?: boolean;
}

function scoreColor(score: number): string {
  if (score >= 8) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 5) return 'text-blue-600 dark:text-blue-400';
  if (score >= 3) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

function scoreBar(score: number): string {
  if (score >= 8) return 'bg-emerald-500';
  if (score >= 5) return 'bg-blue-500';
  if (score >= 3) return 'bg-amber-500';
  return 'bg-rose-500';
}

export default function ImageAnalysisPanel({
  images,
  profession,
  tierLevel,
  disabled = false,
}: ImageAnalysisPanelProps) {
  const [selectedId, setSelectedId] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageAnalysisResponse | null>(null);

  const selected = images.find((i) => i.id === selectedId) ?? null;
  const locked = disabled || tierLevel < 3;

  const handleAnalyze = async () => {
    if (!selected || analyzing || locked) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await subscriptionService.analyzeImage({
        work_id: selected.id,
        context: {
          work_title: selected.title,
          service_title: selected.serviceTitle,
          profession,
          location: selected.location,
        },
      });
      setResult(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Image analysis failed.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:border-violet-400/20 dark:text-violet-400">
            <ImageIcon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Image Analysis
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {locked
                ? 'Level 3 exclusive · upgrade to unlock Gemini vision'
                : 'Gemini reviews a photo, scores it, suggests a caption'}
            </p>
          </div>
        </div>

        {locked && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            Locked
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5">
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3.5 py-2.5 text-xs font-medium text-rose-600 dark:text-rose-400">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {images.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300/70 bg-slate-50/60 px-6 py-8 text-center dark:border-white/10 dark:bg-slate-950/40">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add a work with a before/after photo first — then you can
              analyze it here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
            {/* Left: picker + preview */}
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="image-analysis-picker"
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Pick an image
                </label>
                <select
                  id="image-analysis-picker"
                  value={selectedId}
                  onChange={(e) => {
                    setSelectedId(e.target.value);
                    setResult(null);
                    setError(null);
                  }}
                  disabled={locked || analyzing}
                  className="w-full rounded-lg border border-slate-200/80 bg-white/70 px-3 py-2 text-xs font-medium text-slate-800 outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-200"
                >
                  <option value="">Choose a work…</option>
                  {images.map((img) => (
                    <option key={img.id} value={img.id}>
                      {img.title}
                    </option>
                  ))}
                </select>
              </div>

              {selected && (
                <div className="overflow-hidden rounded-lg border border-slate-200/70 bg-slate-100 dark:border-white/10 dark:bg-slate-800">
                  <img
                    src={selected.imageUrl}
                    alt={selected.title}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!selected || analyzing || locked}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-purple-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {analyzing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wand2 className="h-3.5 w-3.5" />
                )}
                {analyzing
                  ? 'Analyzing…'
                  : locked
                    ? 'Upgrade to Level 3'
                    : 'Analyze with AI'}
              </button>
            </div>

            {/* Right: results */}
            <div className="min-w-0">
              {!result && !analyzing && (
                <div className="flex h-full min-h-[180px] items-center justify-center rounded-lg border border-dashed border-slate-300/70 bg-slate-50/60 px-4 py-6 text-center dark:border-white/10 dark:bg-slate-950/40">
                  <div className="flex flex-col items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-500" />
                    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 max-w-[220px]">
                      Pick a work and tap <strong>Analyze with AI</strong> to
                      see quality feedback and a suggested caption.
                    </p>
                  </div>
                </div>
              )}

              {analyzing && !result && (
                <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                  <span>Reviewing your image…</span>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  {/* Score header */}
                  <div className="flex items-center gap-4 rounded-lg border border-slate-200/70 bg-slate-50/60 p-3.5 dark:border-white/10 dark:bg-slate-950/40">
                    <div className="flex flex-col items-center">
                      <span
                        className={`text-3xl font-extrabold tabular-nums ${scoreColor(result.quality_score)}`}
                      >
                        {result.quality_score}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        / 10
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <Star className="h-3 w-3" />
                        Quality score
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800/60">
                        <div
                          className={`h-full rounded-full ${scoreBar(result.quality_score)}`}
                          style={{ width: `${result.quality_score * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      What the AI sees
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      {result.description}
                    </p>
                  </div>

                  {/* Suggested caption */}
                  {result.suggested_caption && (
                    <div className="rounded-lg border border-violet-500/20 bg-violet-500/[0.04] p-3 dark:bg-violet-500/[0.06]">
                      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                        <CheckCircle2 className="h-3 w-3" />
                        Suggested caption
                      </div>
                      <p className="text-xs italic leading-relaxed text-slate-800 dark:text-slate-200">
                        "{result.suggested_caption}"
                      </p>
                    </div>
                  )}

                  {/* Suggestions */}
                  {result.suggestions.length > 0 && (
                    <div>
                      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        How to improve
                      </div>
                      <ul className="space-y-1">
                        {result.suggestions.map((s, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300"
                          >
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-500" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="border-t border-slate-200/60 pt-2.5 text-[10px] text-slate-400 dark:border-white/10 dark:text-slate-500">
                    Powered by {result.provider} · {result.model}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}