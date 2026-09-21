// src/features/profile/components/MapLocationPicker.tsx

import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Search, MapPin, Loader2, Crosshair, X, Check } from 'lucide-react';

/* ─────────────────────────────────────────────────────────── */
/*  ⚡ PERFORMANCE: more workers                               */
/* ─────────────────────────────────────────────────────────── */

maplibregl.setWorkerCount(6);

/* ─────────────────────────────────────────────────────────── */
/*  Types                                                     */
/* ─────────────────────────────────────────────────────────── */

export interface PickedLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
}

interface MapLocationPickerProps {
  initialLocation?: { latitude: number; longitude: number } | null;
  onSelect: (loc: PickedLocation) => void;
  onCancel: () => void;
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    osm_id?: number;
    osm_type?: string;
    osm_key?: string;
    osm_value?: string;
  };
}

/* ─────────────────────────────────────────────────────────── */
/*  MapTiler key + RICH raster style                          */
/* ─────────────────────────────────────────────────────────── */

const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_KEY as string | undefined;

if (!MAPTILER_API_KEY) {
  console.error(
    '[MapLocationPicker] Missing VITE_MAPTILER_KEY. Add it to .env and restart the dev server.'
  );
}

/**
 * Detect dark mode so we can pick the matching tile style.
 * Follows the user's OS preference via `prefers-color-scheme`.
 */
const prefersDark = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches;

/**
 * Build a minimal inline style that uses MapTiler's **streets-v2** raster
 * tiles. This gives us a proper, colorful, real-looking map (roads, parks,
 * water, POIs, labels) while still loading as fast PNG tiles — no vector
 * parsing, no style.json fetch, no glyph/sprite downloads.
 */
const buildRasterStyle = (
  dark: boolean
): maplibregl.StyleSpecification => {
  // 'streets-v2' = light, 'streets-v2-dark' = dark
  const mapId = dark ? 'streets-v2-dark' : 'streets-v2';

  return {
    version: 8,
    sources: {
      'maptiler-streets': {
        type: 'raster',
        tiles: [
          `https://api.maptiler.com/maps/${mapId}/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`,
        ],
        tileSize: 256,
        attribution: '© MapTiler © OpenStreetMap contributors',
        maxzoom: 19,
      },
    },
    layers: [
      {
        id: 'maptiler-streets-layer',
        type: 'raster',
        source: 'maptiler-streets',
        minzoom: 0,
        maxzoom: 22,
      },
    ],
  };
};

/* ─────────────────────────────────────────────────────────── */
/*  Constants                                                 */
/* ─────────────────────────────────────────────────────────── */

const PHOTON_API = 'https://photon.komoot.io';

const CAMEROON_CENTER: [number, number] = [11.5, 5.5];
const CAMEROON_ZOOM = 6;

const CAMEROON_BOUNDS: [[number, number], [number, number]] = [
  [7.8, 0.8],
  [17.5, 14.5],
];

const PHOTON_BIAS_LAT = 5.5;
const PHOTON_BIAS_LON = 11.5;

/* ─────────────────────────────────────────────────────────── */
/*  Helpers                                                   */
/* ─────────────────────────────────────────────────────────── */

const buildLabel = (f: PhotonFeature): string => {
  const p = f.properties;
  const parts: string[] = [];
  if (p.name) parts.push(p.name);
  else if (p.street) {
    parts.push(`${p.housenumber ? p.housenumber + ' ' : ''}${p.street}`);
  }
  if (p.city) parts.push(p.city);
  if (p.state && p.state !== p.city) parts.push(p.state);
  if (p.country) parts.push(p.country);
  return parts.filter(Boolean).join(', ') || 'Unknown';
};

const buildShortLabel = (f: PhotonFeature): string => {
  const p = f.properties;
  return p.name || p.city || p.street || 'Selected location';
};

/* ─────────────────────────────────────────────────────────── */
/*  Component                                                 */
/* ─────────────────────────────────────────────────────────── */

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  initialLocation,
  onSelect,
  onCancel,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PhotonFeature[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [selected, setSelected] = useState<PickedLocation | null>(null);
  const [locating, setLocating] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* ── Marker ────────────────────────────────────────── */
  const placeMarker = useCallback((lat: number, lng: number, fly = false) => {
    const map = mapRef.current;
    if (!map) return;

    if (markerRef.current) markerRef.current.remove();

    markerRef.current = new maplibregl.Marker({ color: '#6366f1' })
      .setLngLat([lng, lat])
      .addTo(map);

    if (fly) {
      map.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 500,
        essential: true,
      });
    }
  }, []);

  /* ── Reverse geocode ───────────────────────────────── */
  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<PickedLocation> => {
      try {
        const res = await fetch(
          `${PHOTON_API}/reverse?lat=${lat}&lon=${lng}&lang=en&limit=1`
        );
        if (!res.ok) throw new Error('reverse failed');
        const data = await res.json();
        const f: PhotonFeature | undefined = data?.features?.[0];

        return {
          latitude: lat,
          longitude: lng,
          address: f ? buildLabel(f) : `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          city: f?.properties?.city,
          region: f?.properties?.state,
          country: f?.properties?.country,
        };
      } catch {
        return {
          latitude: lat,
          longitude: lng,
          address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        };
      }
    },
    []
  );

  /* ── Init map ──────────────────────────────────────── */
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapRef.current) return;

    let destroyed = false;

    const initTimer = window.setTimeout(() => {
      if (destroyed || !mapContainerRef.current) return;

      const start: [number, number] = initialLocation
        ? [initialLocation.longitude, initialLocation.latitude]
        : CAMEROON_CENTER;

      const dark = prefersDark();
      const t0 = performance.now();

      try {
        const map = new maplibregl.Map({
          container: mapContainerRef.current,
          // ⚡ Rich streets-v2 raster — real-looking map, still fast
          style: buildRasterStyle(dark),
          center: start,
          zoom: initialLocation ? 14 : CAMEROON_ZOOM,

          // Performance
          renderWorldCopies: false,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          fadeDuration: 0,
          attributionControl: false,
          maxTileCacheSize: 80,
          refreshExpiredTiles: false,

          // Bounds
          maxBounds: CAMEROON_BOUNDS,
          minZoom: 5,
          maxZoom: 18,
        });

        map.addControl(
          new maplibregl.AttributionControl({
            compact: true,
            customAttribution: '',
          }),
          'bottom-right'
        );

        map.addControl(
          new maplibregl.NavigationControl({
            showCompass: false,
            showZoom: true,
            visualizePitch: false,
          }),
          'top-right'
        );

        // Hide the spinner as soon as the style is ready
        map.on('styledata', () => {
          if (destroyed) return;
          setMapReady(true);
          console.log(
            '[MapLocationPicker] styledata in',
            (performance.now() - t0).toFixed(0),
            'ms'
          );
        });

        map.on('idle', () => {
          if (destroyed) return;
          setMapReady(true);
          console.log(
            '[MapLocationPicker] idle in',
            (performance.now() - t0).toFixed(0),
            'ms'
          );
        });

        map.on('load', () => {
          if (destroyed) return;
          setMapReady(true);
          map.resize();
          console.log(
            '[MapLocationPicker] load in',
            (performance.now() - t0).toFixed(0),
            'ms'
          );
        });

        map.on('error', (e) => {
          const err = e.error as (Error & { status?: number }) | undefined;
          if (err?.status && err.status >= 400) {
            console.warn('[MapLocationPicker] map error:', err.status, err.message);
            if (err.status === 403) {
              setMapError(
                'MapTiler rejected the API key. Check the origins setting on cloud.maptiler.com.'
              );
            } else if (err.status === 401) {
              setMapError('Invalid MapTiler API key.');
            }
          }
        });

        map.on('click', async (e) => {
          const { lat, lng } = e.lngLat;
          placeMarker(lat, lng);
          setSelected({ latitude: lat, longitude: lng, address: 'Resolving…' });
          const resolved = await reverseGeocode(lat, lng);
          if (!destroyed) setSelected(resolved);
        });

        mapRef.current = map;

        if (initialLocation) {
          placeMarker(initialLocation.latitude, initialLocation.longitude);
          reverseGeocode(
            initialLocation.latitude,
            initialLocation.longitude
          ).then((loc) => {
            if (!destroyed) setSelected(loc);
          });
        }

        resizeObserverRef.current = new ResizeObserver(() => map.resize());
        resizeObserverRef.current.observe(mapContainerRef.current);

        window.setTimeout(() => !destroyed && map.resize(), 100);
        window.setTimeout(() => !destroyed && map.resize(), 400);

        // Failsafe
        window.setTimeout(() => {
          if (destroyed) return;
          if (!map.isStyleLoaded()) {
            console.warn('[MapLocationPicker] style still not loaded after 8s');
            setMapError(
              'Map is taking too long to load. Try disabling your VPN.'
            );
          }
        }, 8000);
      } catch (err) {
        console.error('[MapLocationPicker] failed to init map:', err);
        setMapError('Could not load the map. Please try again.');
      }
    }, 50);

    return () => {
      destroyed = true;
      window.clearTimeout(initTimer);
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [initialLocation, placeMarker, reverseGeocode]);

  /* ── Photon search ─────────────────────────────────── */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = query.trim();
    if (q.length < 2) {
      abortRef.current?.abort();
      debounceRef.current = setTimeout(() => {
        setResults([]);
        setSearching(false);
      }, 0);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setShowResults(true);
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const url =
          `${PHOTON_API}/api/?q=${encodeURIComponent(q)}` +
          `&limit=8&lang=en` +
          `&lat=${PHOTON_BIAS_LAT}&lon=${PHOTON_BIAS_LON}` +
          `&bbox=7.8,0.8,17.5,14.5`;

        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error('search failed');
        const data = await res.json();

        const features: PhotonFeature[] = Array.isArray(data?.features)
          ? data.features.filter((f: PhotonFeature) => {
              const [lon, lat] = f.geometry.coordinates;
              return lat >= 0.8 && lat <= 14.5 && lon >= 7.8 && lon <= 17.5;
            })
          : [];

        setResults(features);
      } catch (err) {
        if (!(err instanceof Error && err.name === 'AbortError')) setResults([]);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handlePickResult = (f: PhotonFeature) => {
    const [lng, lat] = f.geometry.coordinates;
    setSelected({
      latitude: lat,
      longitude: lng,
      address: buildLabel(f),
      city: f.properties.city,
      region: f.properties.state,
      country: f.properties.country,
    });
    placeMarker(lat, lng, true);
    setShowResults(false);
    setQuery(buildShortLabel(f));
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        placeMarker(latitude, longitude, true);
        const resolved = await reverseGeocode(latitude, longitude);
        setSelected(resolved);
        setQuery(
          buildShortLabel({
            geometry: { coordinates: [longitude, latitude] },
            properties: { city: resolved.city, name: resolved.city },
          } as PhotonFeature)
        );
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
    );
  };

  const handleConfirm = () => {
    if (selected) onSelect(selected);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Search bar */}
      <div className="p-3 sm:p-4 border-b border-white/30 dark:border-white/10">
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => results.length > 0 && setShowResults(true)}
                placeholder="Search in Cameroon — e.g. Douala Aqua, Bonapriso…"
                className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/50 backdrop-blur-md border border-white/60 dark:border-white/10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    setShowResults(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {searching && (
                <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 animate-spin" />
              )}
            </div>

            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={locating}
              title="Use my current location"
              className="px-3 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/50 backdrop-blur-md border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/80 transition disabled:opacity-50"
            >
              {locating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Crosshair className="w-4 h-4" />
              )}
            </button>
          </div>

          {showResults && results.length > 0 && (
            <ul className="absolute left-0 right-0 mt-2 max-h-64 overflow-y-auto rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-2xl z-30">
              {results.map((f, idx) => (
                <li key={`${f.properties.osm_id ?? idx}-${idx}`}>
                  <button
                    type="button"
                    onClick={() => handlePickResult(f)}
                    className="w-full text-left px-3 py-2.5 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 transition flex items-start gap-2"
                  >
                    <MapPin className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {buildShortLabel(f)}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {buildLabel(f)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showResults && !searching && query.trim().length >= 2 && results.length === 0 && (
            <div className="absolute left-0 right-0 mt-2 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-2xl p-3 z-30">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                No results in Cameroon for “{query}”.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1 min-h-[320px] bg-slate-100 dark:bg-slate-800">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {!mapReady && !mapError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100/80 dark:bg-slate-900/70 backdrop-blur-sm pointer-events-none">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Loading map…
            </p>
          </div>
        )}

        {mapError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100 dark:bg-slate-900 p-4 text-center">
            <MapPin className="w-6 h-6 text-rose-500" />
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 max-w-xs">
              {mapError}
            </p>
          </div>
        )}

        {selected && (
          <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-md rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg p-3 flex items-start gap-2 pointer-events-none">
            <MapPin className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {selected.address || 'Selected location'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {selected.latitude.toFixed(5)}, {selected.longitude.toFixed(5)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-white/30 dark:border-white/10 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/70 text-xs font-bold transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selected}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="w-3.5 h-3.5" />
          Use this location
        </button>
      </div>
    </div>
  );
};

export default MapLocationPicker;