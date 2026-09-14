// src/features/location/components/LocationMap.tsx
import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { Map as MLMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const PREMIUM_MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxzoom: 19,
    },
  },
  layers: [{ id: 'osm-tiles', type: 'raster', source: 'osm' }],
};

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  highlighted?: boolean;
  /** Marker represents an approximate location (geocoded from text) */
  isApproximate?: boolean;
  avatarUrl?: string | null;
  name?: string;
  onClick?: () => void;
}

export interface LocationMapProps {
  latitude?: number;
  longitude?: number;
  markers?: MapMarker[];
  radiusKm?: number;
  zoom?: number;
  height?: string | number;
  draggable?: boolean;
  onMarkerDragEnd?: (lat: number, lng: number) => void;
  className?: string;
}

/* ───────────────────────── Geo helpers ───────────────────────── */

function circleGeoJSON(
  lat: number,
  lng: number,
  radiusKm: number,
  points = 64
): GeoJSON.Feature<GeoJSON.Polygon> {
  const coords: [number, number][] = [];
  const earthRadiusKm = 6371;
  const angularDistance = radiusKm / earthRadiusKm;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;

  for (let i = 0; i <= points; i++) {
    const bearing = (i / points) * 2 * Math.PI;
    const pointLat = Math.asin(
      Math.sin(latRad) * Math.cos(angularDistance) +
        Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearing)
    );
    const pointLng =
      lngRad +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latRad),
        Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(pointLat)
      );
    coords.push([(pointLng * 180) / Math.PI, (pointLat * 180) / Math.PI]);
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coords] },
  };
}

/* ───────────────────────── Marker DOM ───────────────────────── */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function initialsFromName(name?: string): string {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function createAvatarMarkerElement({
  avatarUrl,
  name,
  highlighted,
  isApproximate,
}: {
  avatarUrl?: string | null;
  name?: string;
  highlighted?: boolean;
  isApproximate?: boolean;
}): HTMLDivElement {
  const el = document.createElement('div');
  el.className =
    'group flex flex-col items-center cursor-pointer select-none transition-transform duration-200 hover:scale-[1.08]';

  const initials = initialsFromName(name) || '?';
  const ariaLabel = name ? escapeHtml(name) : 'Professional';

  /* Ring style varies by state */
  let ringCls: string;
  if (highlighted) {
    ringCls = 'ring-[3px] ring-blue-500 shadow-lg shadow-blue-500/40';
  } else if (isApproximate) {
    ringCls =
      'ring-2 ring-dashed ring-blue-400/70 shadow-md shadow-blue-500/20 opacity-90';
  } else {
    ringCls =
      'ring-2 ring-white dark:ring-slate-900 shadow-md shadow-slate-900/25';
  }

  const sizeCls = highlighted ? 'h-11 w-11' : 'h-10 w-10';
  const scaleCls = highlighted ? 'scale-105' : '';

  const pulse = highlighted
    ? `<span class="pointer-events-none absolute -inset-2 rounded-full bg-blue-500/30 animate-ping"></span>`
    : '';

  /* For approximate markers, add a subtle halo */
  const approxHalo = isApproximate
    ? `<span class="pointer-events-none absolute -inset-1 rounded-full bg-blue-400/15 blur-[6px]"></span>`
    : '';

  const avatarInner = avatarUrl
    ? `<img
         src="${escapeHtml(avatarUrl)}"
         alt=""
         class="h-full w-full rounded-full object-cover"
         onerror="this.onerror=null;this.style.display='none';this.nextElementSibling&&(this.nextElementSibling.style.display='flex');"
       />
       <span style="display:none" class="h-full w-full items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
         ${escapeHtml(initials)}
       </span>`
    : `<span class="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
         ${escapeHtml(initials)}
       </span>`;

  const tailColor = highlighted
    ? 'bg-blue-600'
    : isApproximate
    ? 'bg-blue-500/80'
    : 'bg-white dark:bg-slate-900';

  el.innerHTML = `
    <div class="relative flex flex-col items-center">
      ${pulse}
      ${approxHalo}
      <div class="relative ${sizeCls} ${scaleCls} overflow-hidden rounded-full bg-white transition-transform duration-200 ${ringCls}">
        ${avatarInner}
      </div>
      <div class="-mt-[3px] h-2 w-2 rotate-45 ${tailColor} ${
        isApproximate || highlighted ? '' : 'shadow-[1px_1px_2px_rgba(15,23,42,0.08)]'
      }"></div>
    </div>
    <span class="sr-only">${ariaLabel}</span>
  `;

  return el;
}

function createCenterMarkerElement(): HTMLDivElement {
  const el = document.createElement('div');
  el.className =
    'flex flex-col items-center cursor-move select-none drop-shadow-[0_4px_6px_rgba(37,99,235,0.35)]';

  el.innerHTML = `
    <div class="relative flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 ring-[3px] ring-white dark:ring-slate-900">
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 2v3M12 19v3M22 12h-3M5 12H2"></path>
      </svg>
      <span class="pointer-events-none absolute -inset-2 rounded-full bg-blue-500/20 animate-ping"></span>
    </div>
    <div class="-mt-[3px] h-2 w-2 rotate-45 bg-blue-600"></div>
  `;

  return el;
}

/* ─────────────────────────────────────────────────────────── */

export default function LocationMap({
  latitude,
  longitude,
  markers,
  radiusKm,
  zoom = 13,
  height = 360,
  draggable = false,
  onMarkerDragEnd,
  className = '',
}: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MLMap | null>(null);
  const centerMarkerRef = useRef<Marker | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());

  const hasExplicitCenter = latitude != null && longitude != null;
  const initialLat = latitude ?? markers?.[0]?.latitude ?? 3.848;
  const initialLng = longitude ?? markers?.[0]?.longitude ?? 11.502;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: PREMIUM_MAP_STYLE,
      center: [initialLng, initialLat],
      zoom,
      attributionControl: { compact: true },
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'top-right'
    );

    map.on('load', () => {
      if (radiusKm && radiusKm > 0 && latitude != null && longitude != null) {
        map.addSource('radius', {
          type: 'geojson',
          data: circleGeoJSON(latitude, longitude, radiusKm),
        });
        map.addLayer({
          id: 'radius-fill',
          type: 'fill',
          source: 'radius',
          paint: { 'fill-color': '#2563eb', 'fill-opacity': 0.12 },
        });
        map.addLayer({
          id: 'radius-line',
          type: 'line',
          source: 'radius',
          paint: {
            'line-color': '#2563eb',
            'line-width': 2,
            'line-dasharray': [2, 2],
          },
        });
      }
    });

    mapRef.current = map;

    const ro = new ResizeObserver(() => {
      mapRef.current?.resize();
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      centerMarkerRef.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Center marker: only when caller explicitly provides lat/lng */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      if (!hasExplicitCenter) {
        if (centerMarkerRef.current) {
          centerMarkerRef.current.remove();
          centerMarkerRef.current = null;
        }
        return;
      }

      if (centerMarkerRef.current) {
        centerMarkerRef.current.setLngLat([longitude!, latitude!]);
        map.easeTo({ center: [longitude!, latitude!], duration: 400 });
        return;
      }

      const el = createCenterMarkerElement();
      const marker = new maplibregl.Marker({
        element: el,
        draggable,
        anchor: 'bottom',
      })
        .setLngLat([longitude!, latitude!])
        .addTo(map);

      if (draggable && onMarkerDragEnd) {
        marker.on('dragend', () => {
          const pos = marker.getLngLat();
          onMarkerDragEnd(pos.lat, pos.lng);
        });
      }

      centerMarkerRef.current = marker;
      map.easeTo({ center: [longitude!, latitude!], duration: 400 });
    };

    if (!map.isStyleLoaded() || !map.loaded()) {
      map.once('load', apply);
    } else {
      apply();
    }
  }, [hasExplicitCenter, latitude, longitude, draggable, onMarkerDragEnd]);

  /* Radius sync */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (latitude == null || longitude == null) return;

    const data =
      radiusKm && radiusKm > 0
        ? circleGeoJSON(latitude, longitude, radiusKm)
        : null;

    const source = map.getSource('radius') as
      | maplibregl.GeoJSONSource
      | undefined;

    if (data && source) {
      source.setData(data);
    } else if (data && !source) {
      map.addSource('radius', { type: 'geojson', data });
      map.addLayer({
        id: 'radius-fill',
        type: 'fill',
        source: 'radius',
        paint: { 'fill-color': '#2563eb', 'fill-opacity': 0.12 },
      });
      map.addLayer({
        id: 'radius-line',
        type: 'line',
        source: 'radius',
        paint: {
          'line-color': '#2563eb',
          'line-width': 2,
          'line-dasharray': [2, 2],
        },
      });
    } else if (!data && source) {
      if (map.getLayer('radius-fill')) map.removeLayer('radius-fill');
      if (map.getLayer('radius-line')) map.removeLayer('radius-line');
      map.removeSource('radius');
    }
  }, [latitude, longitude, radiusKm]);

  /* Avatar markers sync */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyMarkers = () => {
      const nextMarkers = markers ?? [];
      const nextIds = new Set(nextMarkers.map((m) => m.id));

      for (const [id, marker] of markersRef.current.entries()) {
        if (!nextIds.has(id)) {
          marker.remove();
          markersRef.current.delete(id);
        }
      }

      for (const m of nextMarkers) {
        const existing = markersRef.current.get(m.id);
        const existingEl = existing?.getElement() as HTMLElement | undefined;
        const existingHighlight = existingEl?.dataset.highlighted === 'true';
        const existingAvatar = existingEl?.dataset.avatar ?? '';
        const existingApprox = existingEl?.dataset.approx === 'true';

        const avatarChanged = existingAvatar !== (m.avatarUrl ?? '');
        const highlightChanged = existingHighlight !== !!m.highlighted;
        const approxChanged = existingApprox !== !!m.isApproximate;

        if (
          existing &&
          !avatarChanged &&
          !highlightChanged &&
          !approxChanged
        ) {
          existing.setLngLat([m.longitude, m.latitude]);
          continue;
        }

        if (existing) existing.remove();

        const el = createAvatarMarkerElement({
          avatarUrl: m.avatarUrl,
          name: m.name,
          highlighted: m.highlighted,
          isApproximate: m.isApproximate,
        });
        el.dataset.highlighted = String(!!m.highlighted);
        el.dataset.avatar = m.avatarUrl ?? '';
        el.dataset.approx = String(!!m.isApproximate);

        const marker = new maplibregl.Marker({
          element: el,
          anchor: 'bottom',
        })
          .setLngLat([m.longitude, m.latitude])
          .addTo(map);

        if (m.onClick) {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            m.onClick?.();
          });
        }
        markersRef.current.set(m.id, marker);
      }

      /* Auto-fit when there are markers and no explicit center */
      if (nextMarkers.length > 0 && !hasExplicitCenter) {
        if (nextMarkers.length === 1) {
          map.easeTo({
            center: [nextMarkers[0].longitude, nextMarkers[0].latitude],
            zoom: 13,
            duration: 500,
          });
        } else {
          const bounds = new maplibregl.LngLatBounds();
          nextMarkers.forEach((m) =>
            bounds.extend([m.longitude, m.latitude])
          );
          map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 600 });
        }
      }
    };

    if (!map.isStyleLoaded() || !map.loaded()) {
      map.once('load', applyMarkers);
    } else {
      applyMarkers();
    }
  }, [markers, hasExplicitCenter]);

  return (
    <div
      className={`relative overflow-hidden rounded-md border border-slate-200/70 bg-slate-100 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)] transition-all dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-16px_rgba(0,0,0,0.5)] ${className}`}
      style={{ height }}
    >
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}