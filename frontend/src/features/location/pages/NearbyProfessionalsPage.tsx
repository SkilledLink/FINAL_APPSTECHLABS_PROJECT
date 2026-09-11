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

  const [params, setParams] = useState<DiscoverParams>({
    location: null,
    radiusKm: 10,
    profession: undefined,
    verifiedOnly: false,
    availableOnly: true,
    limit: 20,
  });

  const [view, setView] = useState<'list' | 'map'>('list');
  const [activeId, setActiveId] = useState<string | null>(null);

  const { professionals, total, searchCenter, loading, error, refresh } =
    useDiscoverProfessionals(params);

  // All hooks at top level, called unconditionally
  const showViewToggle = useMemo(() => {
    if (professionals.length === 0) return false;
    if (params.location != null) return true;
    return professionals.some((p) => p.public_location?.latitude != null);
  }, [professionals, params.location]);

  const verifiedCount = useMemo(() => {
    return professionals.filter((p) => p.is_verified).length;
  }, [professionals]);

  const handleSearch = useCallback(() => {
    setParams({
      location: form.location
        ? { lat: form.location.latitude, lng: form.location.longitude }
        : null,
      radiusKm: form.radiusKm,
      profession: form.profession || undefined,
      verifiedOnly: form.verifiedOnly,
      availableOnly: true,
      limit: 20,
    });
  }, [form]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* Ambient Gradient Blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-28 -top-28 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="absolute -right-20 top-12 h-80 w-80 rounded-full bg-emerald-500/15 blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-indigo-900/25 blur-[120px]" />
        </div>

        {/* Decorative Grid Pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-12 sm:px-6 lg:px-8 lg:pt-16 lg:pb-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs font-medium text-indigo-300 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>Talent Discovery & Mapping</span>
              </div>

              <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Discover local{' '}
                <span className="bg-gradient-to-r from-indigo-300 via-indigo-100 to-white bg-clip-text text-transparent">
                  professionals.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
                Browse skilled experts and service providers nearby. Filter by trade,
                location radius, or view on an interactive map.
              </p>

              {/* Quick Metric Chips */}
              <div className="mt-8 flex flex-wrap gap-3">
                <StatChip
                  icon={<Users className="h-4 w-4" />}
                  label="Experts Found"
                  value={total}
                />
                <StatChip
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="Verified"
                  value={verifiedCount}
                />
                <StatChip
                  icon={<Compass className="h-4 w-4" />}
                  label="Radius"
                  value={`${form.radiusKm} km`}
                />
              </div>
            </div>

            {/* View Toggle (Hero Positioned if Available) */}
            {showViewToggle && (
              <div className="self-start lg:self-end">
                <div className="inline-flex items-center rounded-full border border-slate-800/80 bg-slate-900/80 p-1 backdrop-blur-md shadow-lg">
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                      view === 'list'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                    <span>List View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('map')}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                      view === 'map'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <MapIcon className="h-3.5 w-3.5" />
                    <span>Map View</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter Controls Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <NearbySearchControls
            value={form}
            onChange={setForm}
            onSearch={handleSearch}
            loading={loading}
          />
        </div>

        {/* Search Results Header & Listings */}
        <div className="mt-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-6">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                {loading
                  ? 'Searching professionals…'
                  : `${total} ${total === 1 ? 'professional' : 'professionals'} found`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing results within {form.radiusKm} km radius
              </p>
            </div>

            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
              />
              <span>Refresh</span>
            </button>
          </div>

          {/* Results Grid / Map List Component */}
          <NearbyProfessionalsList
            professionals={professionals}
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
    <div className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 py-2.5 backdrop-blur-md">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-indigo-400">
        {icon}
      </div>
      <div>
        <div className="text-base font-bold leading-none text-white tabular-nums">
          {value}
        </div>
        <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </div>
      </div>
    </div>
  );
}