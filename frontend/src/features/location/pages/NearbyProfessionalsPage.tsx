// src/features/location/pages/NearbyProfessionalsPage.tsx
import {
  Compass,
  List,
  Map as MapIcon,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useDiscoverProfessionals } from '../hooks/useDiscoverProfessionals';
import NearbySearchControls, {
  type NearbySearchState,
} from '../components/NearbySearchControls';
import NearbyProfessionalsList from '../components/NearbyProfessionalsList';
import type { DiscoverParams } from '../types/location.types';

import { useAISearch } from '../../ai/hooks/useAISearch';
import AISearchBar from '../../ai/components/AISearchBar';

type SearchMode = 'manual' | 'ai';

export default function NearbyProfessionalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  /* ── Mode ─────────────────────────────────────────────── */
  const [mode, setMode] = useState<SearchMode>('manual');

  /* ── Manual browse state ──────────────────────────────── */
  const [form, setForm] = useState<NearbySearchState>({
    profession: '',
    location: null,
    radiusKm: 10,
    verifiedOnly: false,
  });

  const [params, setParams] = useState<DiscoverParams>({
    location: null,
    radiusKm: 10,
    profession: undefined,
    verifiedOnly: false,
    availableOnly: true,
    limit: 50,
  });

  const [view, setView] = useState<'list' | 'map'>('map');
  const [activeId, setActiveId] = useState<string | null>(null);

  const manualSearch = useDiscoverProfessionals(params);

  /* ── AI search state ──────────────────────────────────── */
  const aiSearch = useAISearch();
  const [aiInitialQuery, setAiInitialQuery] = useState('');

  /* ── Unified results for list/map rendering ──────────── */
  const isAI = mode === 'ai';
  const professionals = isAI ? aiSearch.professionals : manualSearch.professionals;
  const total = isAI ? aiSearch.total : manualSearch.total;
  const loading = isAI ? aiSearch.loading : manualSearch.loading;
  const error = isAI ? aiSearch.error : manualSearch.error;
  const searchCenter = isAI ? null : manualSearch.searchCenter;
  const refresh = isAI ? () => {} : manualSearch.refresh;

  /* ── Counts for hero chips ────────────────────────────── */
  const verifiedCount = useMemo(
    () => (professionals ?? []).filter((p) => p.is_verified).length,
    [professionals]
  );

  const hasSearched = useMemo(
    () => Boolean(form.profession || form.location || form.verifiedOnly),
    [form]
  );

  /* ── Auto-trigger AI search from URL params ───────────── */
  useEffect(() => {
    const q = searchParams.get('query');
    const city = searchParams.get('city');
    const profession = searchParams.get('profession');
    const radius = searchParams.get('radius_km');
    const verified = searchParams.get('verified_only');

    if (!q && !city && !profession) return;

    setMode('ai');
    setAiInitialQuery(q ?? '');

    void aiSearch.search({
      query: q ?? undefined,
      city: city ?? undefined,
      radiusKm: radius ? Number(radius) : undefined,
      verifiedOnly: verified === 'true' ? true : undefined,
      limit: 20,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Manual handlers ──────────────────────────────────── */
  const handleManualSearch = useCallback(() => {
    setParams({
      location: form.location
        ? { lat: form.location.latitude, lng: form.location.longitude }
        : null,
      radiusKm: form.radiusKm,
      profession: form.profession || undefined,
      verifiedOnly: form.verifiedOnly,
      availableOnly: true,
      limit: 50,
    });
  }, [form]);

  const handleReset = useCallback(() => {
    setForm({
      profession: '',
      location: null,
      radiusKm: 10,
      verifiedOnly: false,
    });
    setParams({
      location: null,
      radiusKm: 10,
      profession: undefined,
      verifiedOnly: false,
      availableOnly: true,
      limit: 50,
    });
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  /* ── AI handlers ──────────────────────────────────────── */
  const handleAISubmit = useCallback(
    (query: string, image: File | null) => {
      void aiSearch.search({
        query: query || undefined,
        image,
        limit: 20,
      });
    },
    [aiSearch]
  );

  const handleAIReset = useCallback(() => {
    aiSearch.reset();
    setAiInitialQuery('');
    setSearchParams({}, { replace: true });
  }, [aiSearch, setSearchParams]);

  /* ── Mode switch ──────────────────────────────────────── */
  const switchMode = (next: SearchMode) => {
    if (next === mode) return;
    setMode(next);
    if (next === 'ai') {
      handleReset();               // clear manual
    } else {
      handleAIReset();             // clear AI
    }
  };

  /* ── View toggle disabled in AI mode (no coords from AI) ─ */
  const effectiveView = isAI ? 'list' : view;

  return (
    <div className="relative min-h-screen w-full bg-slate-50/50 transition-colors dark:bg-slate-950">
      {/* ═══════════ Hero ═══════════ */}
      <section className="relative overflow-hidden border-b border-slate-200/70 bg-slate-950 text-white dark:border-white/10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-28 -top-28 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute -right-20 top-12 h-80 w-80 rounded-full bg-blue-400/15 blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-blue-900/25 blur-[120px]" />
        </div>

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative mx-auto w-full px-4 pt-10 pb-8 sm:px-6 lg:px-8 lg:pt-12 lg:pb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-300 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                </span>
                <span>Talent discovery & mapping</span>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
                Discover local{' '}
                <span className="bg-gradient-to-r from-blue-300 via-blue-100 to-white bg-clip-text text-transparent">
                  professionals.
                </span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
                Browse by filters or ask in plain language — even with a photo.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <StatChip
                  icon={<Users className="h-4 w-4" />}
                  label="Available"
                  value={loading ? '…' : total}
                />
                <StatChip
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="Verified"
                  value={loading ? '…' : verifiedCount}
                />
                <StatChip
                  icon={<Compass className="h-4 w-4" />}
                  label="Radius"
                  value={isAI ? 'AI' : `${form.radiusKm} km`}
                />
              </div>
            </div>

            <div className="self-start lg:self-end">
              <div className="inline-flex items-center rounded border border-white/10 bg-white/5 p-1 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setView('map')}
                  aria-pressed={view === 'map'}
                  className={`inline-flex items-center gap-2 rounded-sm px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    view === 'map'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MapIcon className="h-3.5 w-3.5" />
                  <span>Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  aria-pressed={view === 'list'}
                  className={`inline-flex items-center gap-2 rounded-sm px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    view === 'list'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  <span>List</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════ Main ═══════════ */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ── Mode toggle ── */}
        <div className="mb-4 inline-flex items-center rounded border border-slate-200/70 bg-white/85 p-1 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={() => switchMode('manual')}
            aria-pressed={mode === 'manual'}
            className={`inline-flex items-center gap-2 rounded-sm px-3.5 py-2 text-xs font-semibold transition-colors ${
              mode === 'manual'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            Browse
          </button>
          <button
            type="button"
            onClick={() => switchMode('ai')}
            aria-pressed={mode === 'ai'}
            className={`inline-flex items-center gap-2 rounded-sm px-3.5 py-2 text-xs font-semibold transition-colors ${
              mode === 'ai'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Search
          </button>
        </div>

        {/* ── Controls ── */}
        <div id="nearby-search-controls">
          {mode === 'manual' ? (
            <div className="rounded-md border border-slate-200/70 bg-white/85 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 sm:p-6">
              <NearbySearchControls
                value={form}
                onChange={setForm}
                onSearch={handleManualSearch}
                loading={loading}
              />
            </div>
          ) : (
            <AISearchBar
              onSubmit={handleAISubmit}
              loading={loading}
              error={aiSearch.error}
              initialQuery={aiInitialQuery}
            />
          )}
        </div>

        {/* ── AI explanation banner ── */}
        {isAI && aiSearch.explanation && (
          <div className="mt-4 flex items-start gap-3 rounded-md border border-blue-500/20 bg-blue-500/[0.04] p-4 backdrop-blur-sm dark:border-blue-400/20 dark:bg-blue-500/[0.06]">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {aiSearch.explanation}
            </p>
          </div>
        )}

        {/* ── AI image analysis ── */}
        {isAI && aiSearch.imageAnalysis && (
          <div className="mt-4 rounded-md border border-slate-200/70 bg-white/85 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              <Sparkles className="h-3 w-3" />
              Image reading
              <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold normal-case tracking-normal text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {Math.round(aiSearch.imageAnalysis.confidence * 100)}% sure
              </span>
            </div>
            <p className="mt-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              {aiSearch.imageAnalysis.description}
            </p>
            {aiSearch.imageAnalysis.possibleProfession && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Suggested profession:{' '}
                <span className="font-semibold text-blue-700 dark:text-blue-400">
                  {aiSearch.imageAnalysis.possibleProfession}
                </span>
              </p>
            )}
          </div>
        )}

        {/* ── Results header ── */}
        <div className="mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200/70 bg-white/85 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 sm:px-5">
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
                {loading
                  ? 'Loading professionals…'
                  : isAI
                  ? total === 0
                    ? 'No matches found'
                    : `${total} ${total === 1 ? 'match' : 'matches'}`
                  : hasSearched
                  ? `${total} ${total === 1 ? 'match' : 'matches'} for your search`
                  : `${total} available ${total === 1 ? 'professional' : 'professionals'}`}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {isAI
                  ? 'Matched by the AI assistant from your description or image'
                  : hasSearched
                  ? `Within ${form.radiusKm} km${
                      form.location ? ` of ${form.location.display_name}` : ''
                    }`
                  : 'Showing everyone currently available — no filter applied'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(hasSearched || isAI) && (
                <button
                  type="button"
                  onClick={isAI ? handleAIReset : handleReset}
                  className="inline-flex items-center gap-2 rounded border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 backdrop-blur-md transition-colors hover:border-blue-500/40 hover:text-blue-700 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:text-blue-400"
                >
                  <X className="h-3 w-3" />
                  Reset
                </button>
              )}

              {!isAI && (
                <button
                  type="button"
                  onClick={refresh}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 backdrop-blur-md transition-colors hover:border-blue-500/40 hover:text-blue-700 disabled:opacity-50 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:text-blue-400"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              )}
            </div>
          </div>

          <NearbyProfessionalsList
            professionals={professionals ?? []}
            loading={loading}
            error={error}
            view={effectiveView}
            searchCenter={searchCenter}
            activeId={activeId}
            onHover={setActiveId}
          />
        </div>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

function StatChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3 rounded border border-white/10 bg-white/5 px-3.5 py-2 backdrop-blur-md">
      <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-blue-500/15 text-blue-300">
        {icon}
      </div>
      <div>
        <div className="text-base font-bold leading-none text-white tabular-nums">
          {value}
        </div>
        <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </div>
      </div>
    </div>
  );
}