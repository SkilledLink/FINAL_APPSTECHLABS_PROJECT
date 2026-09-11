import { Loader2, SearchX } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import type { DiscoverProfessional, PublicLocation } from '../types/location.types';
import NearbyProfessionalCard from './NearbyProfessionalCard';
import LocationMap, { type MapMarker } from './LocationMap';

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
    <div className="rounded-2xl border border-ink-100 bg-white p-5">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 animate-pulse rounded-full bg-ink-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-ink-100" />
          <div className="h-3 w-40 animate-pulse rounded bg-ink-100" />
          <div className="h-3 w-24 animate-pulse rounded bg-ink-100" />
        </div>
      </div>
      <div className="mt-4 h-3 w-full animate-pulse rounded bg-ink-100" />
      <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-ink-100" />
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-20 animate-pulse rounded-lg bg-ink-100" />
        <div className="h-6 w-24 animate-pulse rounded-lg bg-ink-100" />
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
        .filter((p) => p.public_location?.latitude != null && p.public_location?.longitude != null)
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(360px,42%)]">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="hidden lg:block">
          <div className="h-[calc(100vh-260px)] animate-pulse rounded-2xl border border-ink-100 bg-ink-50" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (professionals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ink-100">
          <SearchX className="h-7 w-7 text-ink-400" />
        </div>
        <h3 className="font-display text-lg font-bold text-ink-800">
          No professionals found
        </h3>
        <p className="mt-1 max-w-sm text-sm text-ink-500">
          Try a different service or search term. If you picked a location, try
          widening the radius.
        </p>
      </div>
    );
  }

  const showMap = view === 'map' && (hasAnyCoordinates || searchCenter);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-sm text-ink-600">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          <span>
            <span className="font-semibold text-ink-900">
              {professionals.length}
            </span>{' '}
            {professionals.length === 1 ? 'professional' : 'professionals'}
            {searchCenter ? ' found nearby' : ' available'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(360px,42%)]">
        <div className="space-y-3 lg:max-h-[calc(100vh-260px)] lg:overflow-y-auto lg:pr-2 scrollbar-thin">
          {professionals.map((p) => (
            <div
              key={p.id}
              ref={(el) => {
                cardRefs.current[p.id] = el;
              }}
              onMouseEnter={() => onHover(p.id)}
              onMouseLeave={() => onHover(null)}
              className={
                activeId === p.id
                  ? 'rounded-2xl ring-2 ring-brand-300 transition-shadow'
                  : 'transition-shadow'
              }
            >
              <NearbyProfessionalCard professional={p} />
            </div>
          ))}

          {loading && professionals.length > 0 && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-ink-400" />
            </div>
          )}
        </div>

        {showMap && (
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <div className="rounded-2xl border border-ink-100 bg-white p-2 shadow-sm">
                <LocationMap
                  latitude={searchCenter?.latitude}
                  longitude={searchCenter?.longitude}
                  markers={markers}
                  radiusKm={searchCenter ? undefined : undefined}
                  zoom={searchCenter ? 12 : 11}
                  height="calc(100vh - 260px)"
                  className="!border-0"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}