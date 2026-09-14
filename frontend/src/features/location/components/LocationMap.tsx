import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { Map as MLMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Premium Carto Voyager tiles (Clean, modern vector-like aesthetic)
const PREMIUM_MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    },
  },
  layers: [{ id: 'carto-tiles', type: 'raster', source: 'carto' }],
};

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  highlighted?: boolean;
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

function circleGeoJSON(
  lat: number,
  lng: number,
  radiusKm: number,
  points = 64,
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
        Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearing),
    );
    const pointLng =
      lngRad +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latRad),
        Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(pointLat),
      );
    coords.push([(pointLng * 180) / Math.PI, (pointLat * 180) / Math.PI]);
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coords] },
  };
}

/**
  Creates a custom HTML element for markers with smooth animations and glows.
 */
function createMarkerDOMElement(highlighted = false): HTMLDivElement {
  const el = document.createElement('div');
  el.className =
    'relative flex items-center justify-center cursor-pointer group transition-transform duration-300 hover:scale-125';

  const pulseRing = highlighted
    ? `<span class="absolute -inset-1.5 rounded-full bg-amber-500/40 animate-ping"></span>`
    : `<span class="absolute -inset-1 rounded-full bg-indigo-500/20 group-hover:bg-indigo-500/40 transition-all"></span>`;

  const pinGradient = highlighted
    ? 'bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-lg shadow-amber-500/30 ring-2 ring-white dark:ring-slate-900'
    : 'bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/30 ring-2 ring-white dark:ring-slate-900';

  el.innerHTML = `
    ${pulseRing}
    <div class="relative flex h-8 w-8 items-center justify-center rounded-full ${pinGradient} transition-all duration-200">
      <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
  `;

  return el;
}

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

  // Determine initial center: explicit props > first marker > default center
  const initialLat = latitude ?? (markers && markers[0]?.latitude) ?? 3.848;
  const initialLng = longitude ?? (markers && markers[0]?.longitude) ?? 11.502;

  // Initialize Map
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
      'top-right',
    );

    map.on('load', () => {
      // Radius Circle Layer
      if (radiusKm && radiusKm > 0 && latitude != null && longitude != null) {
        map.addSource('radius', {
          type: 'geojson',
          data: circleGeoJSON(latitude, longitude, radiusKm),
        });

        map.addLayer({
          id: 'radius-fill',
          type: 'fill',
          source: 'radius',
          paint: {
            'fill-color': '#6366f1',
            'fill-opacity': 0.12,
          },
        });

        map.addLayer({
          id: 'radius-line',
          type: 'line',
          source: 'radius',
          paint: {
            'line-color': '#4f46e5',
            'line-width': 2,
            'line-dasharray': [2, 2],
          },
        });
      }

      // Single Center Picker Marker
      if (
        latitude != null &&
        longitude != null &&
        (!markers || markers.length === 0)
      ) {
        const customEl = createMarkerDOMElement(true);
        const marker = new maplibregl.Marker({
          element: customEl,
          draggable,
        })
          .setLngLat([longitude, latitude])
          .addTo(map);

        if (draggable && onMarkerDragEnd) {
          marker.on('dragend', () => {
            const pos = marker.getLngLat();
            onMarkerDragEnd(pos.lat, pos.lng);
          });
        }
        centerMarkerRef.current = marker;
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      centerMarkerRef.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync Center Marker
  useEffect(() => {
    if (!mapRef.current || !centerMarkerRef.current) return;
    if (latitude == null || longitude == null) return;
    centerMarkerRef.current.setLngLat([longitude, latitude]);
    mapRef.current.easeTo({ center: [longitude, latitude], duration: 400 });
  }, [latitude, longitude]);

  // Sync Radius Circle
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
        paint: {
          'fill-color': '#6366f1',
          'fill-opacity': 0.12,
        },
      });
      map.addLayer({
        id: 'radius-line',
        type: 'line',
        source: 'radius',
        paint: {
          'line-color': '#4f46e5',
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

  // Sync Multiple Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (!map.loaded()) {
      map.once('load', () => map.fire('markers:reload'));
      return;
    }

    const nextMarkers = markers ?? [];
    const nextIds = new Set(nextMarkers.map((m) => m.id));

    // Remove obsolete markers
    for (const [id, marker] of markersRef.current.entries()) {
      if (!nextIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }

    // Add or update markers
    for (const m of nextMarkers) {
      const existing = markersRef.current.get(m.id);
      if (existing) {
        existing.setLngLat([m.longitude, m.latitude]);
      } else {
        const customEl = createMarkerDOMElement(m.highlighted);
        const marker = new maplibregl.Marker({ element: customEl })
          .setLngLat([m.longitude, m.latitude])
          .addTo(map);

        if (m.onClick) {
          marker.getElement().addEventListener('click', m.onClick);
        }
        markersRef.current.set(m.id, marker);
      }
    }

    // Auto fit bounds logic
    if (nextMarkers.length > 0 && latitude == null && longitude == null) {
      const bounds = new maplibregl.LngLatBounds();
      nextMarkers.forEach((m) => bounds.extend([m.longitude, m.latitude]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 600 });
    } else if (nextMarkers.length === 1 && latitude == null) {
      map.easeTo({
        center: [nextMarkers[0].longitude, nextMarkers[0].latitude],
        zoom: 13,
        duration: 500,
      });
    }
  }, [markers, latitude, longitude]);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 ${className}`}
      style={{ height }}
    >
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}