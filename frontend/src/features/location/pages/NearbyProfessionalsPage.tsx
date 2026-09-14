// src/features/location/pages/NearbyProfessionalsPage.tsx
import {
  Compass,
  List,
  Map as MapIcon,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useDiscoverProfessionals } from '../hooks/useDiscoverProfessionals';
import NearbySearchControls, {
  type NearbySearchState,
} from '../components/NearbySearchControls';
import NearbyProfessionalsList from '../components/NearbyProfessionalsList';
import type { DiscoverParams } from '../types/location.types';

export default function NearbyProfessionalsPage() {
  const [form, setForm] = useState<NearbySearchState>({
    profession: '',
    location: null,
    radiusKm: 10,
    verifiedOnly: false,
  });

  /**
   * Initial params fetch everyone available — no location filter required.
   * The map renders these pins unsorted (the backend sorts by distance when
   * a location is present; otherwise it returns its default ordering).
   */
  const [params, setParams] = useState<DiscoverParams>({
    location: null,
    radiusKm: 10,
    profession: undefined,
    verifiedOnly: false,
    availableOnly: true,
    limit: 50,
  });

  /* ── Map is the primary view ── */
  const [view, setView] = useState<'list' | 'map'>('map');
  const [activeId, setActiveId] = useState<string | null>(null);

  const { professionals, total, searchCenter, loading, error, refresh } =
    useDiscoverProfessionals(params);

  const verifiedCount = useMemo(
    () => (professionals ?? []).filter((p) => p.is_verified).length,
    [professionals]
  );

  const hasSearched = useMemo(
    () =>
      Boolean(
        form.profession ||
          form.location ||
          form.verifiedOnly
      ),
    [form]
  );

  const handleSearch = useCallback(() => {
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
  }, []);

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
                Browse skilled experts nearby. Filter by trade, location radius,
                or explore them on an interactive map.
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
                  value={`${form.radiusKm} km`}
                />
              </div>
            </div>

            {/* View toggle — always visible */}
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
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ Main ═══════════ */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div
          id="nearby-search-controls"
          className="rounded-md border border-slate-200/70 bg-white/85 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 sm:p-6"
        >
          <NearbySearchControls
            value={form}
            onChange={setForm}
            onSearch={handleSearch}
            loading={loading}
          />
        </div>

        <div className="mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200/70 bg-white/85 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 sm:px-5">
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
                {loading
                  ? 'Loading professionals…'
                  : hasSearched
                  ? `${total} ${
                      total === 1 ? 'match' : 'matches'
                    } for your search`
                  : `${total} available ${
                      total === 1 ? 'professional' : 'professionals'
                    }`}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {hasSearched
                  ? `Within ${form.radiusKm} km${
                      form.location ? ` of ${form.location.display_name}` : ''
                    }`
                  : 'Showing everyone currently available — no filter applied'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {hasSearched && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 backdrop-blur-md transition-colors hover:border-blue-500/40 hover:text-blue-700 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:text-blue-400"
                >
                  Reset
                </button>
              )}

              <button
                type="button"
                onClick={refresh}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 backdrop-blur-md transition-colors hover:border-blue-500/40 hover:text-blue-700 disabled:opacity-50 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:text-blue-400"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <NearbyProfessionalsList
            professionals={professionals ?? []}
            loading={loading}
            error={error}
            view={view}
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