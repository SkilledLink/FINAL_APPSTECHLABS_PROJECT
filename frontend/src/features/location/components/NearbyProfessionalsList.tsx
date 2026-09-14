import { AlertCircle, Loader2, SearchX } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import type { DiscoverProfessional, PublicLocation } from '../types/location.types';
import LocationMap, { type MapMarker } from './LocationMap';
import NearbyProfessionalCard from './NearbyProfessionalCard';

interface NearbyProfessionalsListProps {
  professionals: DiscoverProfessional[];
  loading: boolean;
  error: string | null;
  view: 'list' | 'map';
  searchCenter: PublicLocation | null;
  activeId: string | null;
  onHover: (id: string | null) => void;
}

function CardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 w-36 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-3.5 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-28 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-3.5 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-3.5 w-4/5 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="mt-5 flex gap-2">
        <div className="h-6 w-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-6 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export default function NearbyProfessionalsList({
  professionals,
  loading,
  error,
  view,
  searchCenter,
  activeId,
  onHover,
}: NearbyProfessionalsListProps) {
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!activeId) return;
    const el = cardRefs.current[activeId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeId]);

  // Build markers from professionals that have public_location
  const markers: MapMarker[] = useMemo(
    () =>
      professionals
        .filter(
          (p) =>
            p.public_location?.latitude != null &&
            p.public_location?.longitude != null
        )
        .map((p) => ({
          id: p.id,
          latitude: p.public_location!.latitude,
          longitude: p.public_location!.longitude,
          highlighted: activeId === p.id,
          onClick: () => onHover(p.id),
        })),
    [professionals, activeId, onHover]
  );

  const hasAnyCoordinates = markers.length > 0;

  if (loading && professionals.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_minmax(360px,42%)]">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="hidden lg:block">
          <div className="h-[calc(100vh-260px)] animate-pulse rounded-3xl border border-slate-200/80 bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-200/80 bg-rose-50/80 p-4 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
        <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
        <span>{error}</span>
      </div>
    );
  }

  if (professionals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 px-6 py-20 text-center dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
          <SearchX className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          No professionals found
        </h3>
        <p className="mt-1.5 max-w-sm text-sm font-medium text-slate-500 dark:text-slate-400">
          Try a different service or search term. If you selected a location, try
          widening your search radius.
        </p>
      </div>
    );
  }

  const showMap = view === 'map' && (hasAnyCoordinates || searchCenter);

  return (
    <div className="space-y-4">
      {/* Search Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span>
            <strong className="text-slate-900 dark:text-slate-100">
              {professionals.length}
            </strong>{' '}
            {professionals.length === 1 ? 'professional' : 'professionals'}
            {searchCenter ? ' found nearby' : ' available'}
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_minmax(360px,42%)]">
        {/* Left Column: Professionals List */}
        <div className="space-y-4 lg:max-h-[calc(100vh-260px)] lg:overflow-y-auto lg:pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {professionals.map((p) => (
            <div
              key={p.id}
              ref={(el) => {
                cardRefs.current[p.id] = el;
              }}
              onMouseEnter={() => onHover(p.id)}
              onMouseLeave={() => onHover(null)}
              className={`rounded-3xl transition-all duration-200 ${
                activeId === p.id
                  ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/10 dark:ring-indigo-400'
                  : ''
              }`}
            >
              <NearbyProfessionalCard professional={p} />
            </div>
          ))}

          {loading && professionals.length > 0 && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
          )}
        </div>

        {/* Right Column: Sticky Map */}
        {showMap && (
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <LocationMap
                  latitude={searchCenter?.latitude}
                  longitude={searchCenter?.longitude}
                  markers={markers}
                  radiusKm={undefined}
                  zoom={searchCenter ? 12 : 11}
                  height="calc(100vh - 276px)"
                  className="!border-0 !rounded-2xl"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}