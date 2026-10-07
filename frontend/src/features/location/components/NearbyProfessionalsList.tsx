// src/features/location/components/NearbyProfessionalsList.tsx
import { AlertCircle, Loader2, MapPin, MapPinOff, SearchX } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useProfileNavigation } from '../../profile/hooks/useProfileNavigation';
import type { DiscoverProfessional, PublicLocation } from '../types/location.types';
import LocationMap, { type MapMarker } from './LocationMap';
import NearbyProfessionalCard from './NearbyProfessionalCard';
import { useFallbackGeocoding } from '../hooks/useFallbackGeocoding';

interface NearbyProfessionalsListProps {
  professionals?: DiscoverProfessional[] | null;
  loading?: boolean;
  error?: string | null;
  view?: 'list' | 'map';
  searchCenter?: PublicLocation | null;
  activeId?: string | null;
  onHover?: (id: string | null) => void;
}

const SKEL_SOFT = 'animate-pulse bg-blue-500/5 dark:bg-white/[0.03]';
const SKEL_BLOCK = 'animate-pulse bg-blue-500/8 dark:bg-white/5';
const SKEL_STRONG = 'animate-pulse bg-blue-500/12 dark:bg-white/[0.07]';

function CardSkeleton() {
  return (
    <div className="rounded-md border border-slate-200/70 bg-white/85 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
      <div className="flex items-start gap-4">
        <div className={`h-12 w-12 shrink-0 rounded-full ${SKEL_STRONG}`} />
        <div className="flex-1 space-y-2.5">
          <div className={`h-4 w-36 rounded-sm ${SKEL_BLOCK}`} />
          <div className={`h-3.5 w-48 rounded-sm ${SKEL_BLOCK}`} />
          <div className={`h-3 w-28 rounded-sm ${SKEL_SOFT}`} />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className={`h-3.5 w-full rounded-sm ${SKEL_BLOCK}`} />
        <div className={`h-3.5 w-4/5 rounded-sm ${SKEL_SOFT}`} />
      </div>
    </div>
  );
}

function MapHint({
  variant,
  count,
}: {
  variant: 'no-search' | 'no-locations' | 'partial' | 'loading';
  count?: number;
}) {
  const config = {
    'no-search': {
      title: 'Nobody is on the map yet',
      body:
        'Available professionals will appear here as pins — either at their saved location or their city center.',
      Icon: MapPin,
    },
    'no-locations': {
      title: 'No locations shared',
      body:
        'These professionals have no location on file yet, so nothing can be plotted.',
      Icon: MapPinOff,
    },
    partial: {
      title: 'Approximate locations shown',
      body: `${count ?? 0} ${
        count === 1 ? 'professional is' : 'professionals are'
      } pinned to their city center because their exact location isn't saved yet.`,
      Icon: MapPin,
    },
    loading: {
      title: 'Loading professionals…',
      body: 'Fetching nearby results.',
      Icon: Loader2,
    },
  }[variant];

  const { Icon } = config;

  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex justify-center sm:inset-x-6">
      <div className="pointer-events-auto max-w-md rounded-md border border-white/60 bg-white/90 px-4 py-3 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:border-blue-400/20 dark:text-blue-400">
            <Icon
              className={`h-4 w-4 ${variant === 'loading' ? 'animate-spin' : ''}`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold tracking-tight text-slate-900 dark:text-white">
              {config.title}
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              {config.body}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapPanel({
  searchCenter,
  markers,
  zoom,
  hint,
  hintCount,
}: {
  searchCenter?: PublicLocation | null;
  markers: MapMarker[];
  zoom: number;
  hint: 'no-search' | 'no-locations' | 'partial' | 'loading' | null;
  hintCount?: number;
}) {
  const lat = searchCenter?.latitude != null ? searchCenter.latitude : undefined;
  const lng = searchCenter?.longitude != null ? searchCenter.longitude : undefined;

  return (
    <div className="overflow-hidden rounded-md border border-slate-200/70 bg-white/85 p-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
      <div className="relative h-[400px] lg:h-[calc(100vh-260px)]">
        <LocationMap
          latitude={lat}
          longitude={lng}
          markers={markers}
          zoom={zoom}
          height="100%"
          className="!rounded-sm"
        />
        {hint && <MapHint variant={hint} count={hintCount} />}
      </div>
    </div>
  );
}

export default function NearbyProfessionalsList({
  professionals = [],
  loading = false,
  error = null,
  view = 'map',
  searchCenter = null,
  activeId = null,
  onHover,
}: NearbyProfessionalsListProps) {
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const list = Array.isArray(professionals) ? professionals : [];

  const fallbacks = useFallbackGeocoding(list);
  const { href: buildProfileHref } = useProfileNavigation(undefined);

  useEffect(() => {
    if (!activeId) return;
    const el = cardRefs.current[activeId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeId]);

  const markers: MapMarker[] = useMemo(
    () =>
      list
        .map((p) => {
          const real = p.public_location;
          const fallback = fallbacks[p.id];

          const lat = real?.latitude ?? fallback?.latitude;
          const lng = real?.longitude ?? fallback?.longitude;

          if (lat == null || lng == null) return null;

          const isApproximate = !real && !!fallback;
          return {
            id: p.id,
            latitude: lat,
            longitude: lng,
            highlighted: activeId === p.id,
            isApproximate,
            avatarUrl: p.user?.profile_image_url ?? null,
            name: `${p.user?.first_name ?? ''} ${p.user?.last_name ?? ''}`.trim(),
            onClick: () => {
              onHover?.(p.id);
              if (buildProfileHref) window.location.assign(buildProfileHref);
            },
          } as MapMarker;
        })
        .filter((m): m is MapMarker => m !== null),
    [list, fallbacks, activeId, onHover, buildProfileHref],
  );

  const missingCount = list.filter(
    (p) => !p.public_location?.latitude && !fallbacks[p.id]?.latitude,
  ).length;

  const approximateCount = markers.filter((m) => m.isApproximate).length;
  const hasAnyCoordinates = markers.length > 0;
  const hasSearchCenter =
    searchCenter?.latitude != null && searchCenter?.longitude != null;

  /* Verified / unverified split for the results header */
  const verifiedInList = list.filter((p) => p.is_verified).length;
  const unverifiedInList = list.length - verifiedInList;

  if (loading && list.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_minmax(360px,42%)]">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div>
          <div className="h-[400px] animate-pulse rounded-md border border-slate-200/70 bg-blue-500/5 lg:h-[calc(100vh-260px)] dark:border-white/10 dark:bg-white/[0.03]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-rose-500/20 bg-rose-500/8 p-4 text-sm font-medium text-rose-700 backdrop-blur-md dark:text-rose-300">
        <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
        <span>{error}</span>
      </div>
    );
  }

  if (list.length === 0) {
    const emptyCard = (
      <div className="relative overflow-hidden rounded-md border border-dashed border-blue-500/25 bg-blue-500/[0.03] px-6 py-12 text-center backdrop-blur-sm dark:border-blue-400/20 dark:bg-blue-500/[0.04]">
        <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="relative flex flex-col items-center">
          <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-600 shadow-sm shadow-blue-500/10 dark:border-blue-400/20 dark:text-blue-400">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
            No professionals found
          </h3>
          <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Try a different service or search term. If you selected a location,
            try widening your search radius.
          </p>
        </div>
      </div>
    );

    if (view !== 'map') return emptyCard;

    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_minmax(360px,42%)]">
        {emptyCard}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <MapPanel
            searchCenter={searchCenter}
            markers={markers}
            zoom={hasSearchCenter ? 12 : 11}
            hint={hasSearchCenter ? 'no-locations' : 'no-search'}
          />
        </div>
      </div>
    );
  }

  const showMap = view === 'map';

  let hint: 'no-search' | 'no-locations' | 'partial' | 'loading' | null = null;
  if (showMap) {
    if (loading) hint = 'loading';
    else if (!hasAnyCoordinates && !hasSearchCenter) hint = 'no-search';
    else if (!hasAnyCoordinates && hasSearchCenter) hint = 'no-locations';
    else if (approximateCount > 0) hint = 'partial';
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2.5 rounded border border-slate-200/80 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-slate-700 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
          </span>
          <span>
            <strong className="tabular-nums text-slate-900 dark:text-slate-100">
              {list.length}
            </strong>{' '}
            {list.length === 1 ? 'professional' : 'professionals'}
            {searchCenter ? ' found nearby' : ' available'}
            {verifiedInList > 0 && (
              <>
                {' · '}
                <span className="text-emerald-700 dark:text-emerald-400">
                  {verifiedInList} verified
                </span>
              </>
            )}
            {unverifiedInList > 0 && (
              <>
                {' · '}
                <span className="text-amber-700 dark:text-amber-400">
                  {unverifiedInList} unverified
                </span>
              </>
            )}
            {approximateCount > 0 && (
              <>
                {' · '}
                <span className="text-blue-700 dark:text-blue-300">
                  {approximateCount} approximate
                </span>
              </>
            )}
            {missingCount > 0 && (
              <>
                {' · '}
                <span className="text-slate-500 dark:text-slate-400">
                  {missingCount} off-map
                </span>
              </>
            )}
          </span>
        </div>
      </div>

      <div
        className={
          showMap
            ? 'grid grid-cols-1 gap-5 lg:grid-cols-[1fr_minmax(360px,42%)]'
            : 'space-y-4'
        }
      >
        <div className="space-y-4 scrollbar-thin scrollbar-track-transparent lg:max-h-[calc(100vh-260px)] lg:overflow-y-auto lg:pr-2">
          {list.map((p) => {
            const hasReal =
              p.public_location?.latitude != null &&
              p.public_location?.longitude != null;
            const hasFallback = !!fallbacks[p.id]?.latitude;

            return (
              <div
                key={p.id}
                ref={(el) => {
                  cardRefs.current[p.id] = el;
                }}
                onMouseEnter={() => onHover?.(p.id)}
                onMouseLeave={() => onHover?.(null)}
                className={`rounded-md transition-all duration-200 ${
                  activeId === p.id
                    ? 'ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/10'
                    : ''
                }`}
              >
                <NearbyProfessionalCard professional={p} />

                {hasReal && (
                  <div className="mt-2 ml-1 inline-flex items-center gap-1.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                    <MapPin className="h-3 w-3" />
                    Exact location
                  </div>
                )}

                {!hasReal && hasFallback && (
                  <div className="mt-2 ml-1 inline-flex items-center gap-1.5 text-[10px] font-medium text-blue-600/80 dark:text-blue-400/80">
                    <MapPin className="h-3 w-3" />
                    Approximate — city center
                  </div>
                )}

                {!hasReal && !hasFallback && (
                  <div className="mt-2 ml-1 inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    <MapPinOff className="h-3 w-3" />
                    No map location set
                  </div>
                )}
              </div>
            );
          })}

          {loading && list.length > 0 && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          )}
        </div>

        {showMap && (
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <MapPanel
              searchCenter={searchCenter}
              markers={markers}
              zoom={hasSearchCenter ? 12 : hasAnyCoordinates ? 11 : 10}
              hint={hint}
              hintCount={approximateCount}
            />
          </div>
        )}
      </div>
    </div>
  );
}