import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { Map as MLMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const OSM_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
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

export default function LocationMap({
  latitude,
  longitude,
  markers,
  radiusKm,
  zoom = 13,
  height = 320,
  draggable = false,
  onMarkerDragEnd,
  className = '',
}: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MLMap | null>(null);
  const centerMarkerRef = useRef<Marker | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());

  // Determine initial center: explicit props > first marker > default Cameroon center
  const initialLat = latitude ?? (markers && markers[0]?.latitude) ?? 3.848;
  const initialLng = longitude ?? (markers && markers[0]?.longitude) ?? 11.502;

  // Init
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: [initialLng, initialLat],
      zoom,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => {
      // Radius circle
      if (radiusKm && radiusKm > 0 && latitude != null && longitude != null) {
        map.addSource('radius', {
          type: 'geojson',
          data: circleGeoJSON(latitude, longitude, radiusKm),
        });
        map.addLayer({
          id: 'radius-fill',
          type: 'fill',
          source: 'radius',
          paint: { 'fill-color': '#16a85f', 'fill-opacity': 0.12 },
        });
        map.addLayer({
          id: 'radius-line',
          type: 'line',
          source: 'radius',
          paint: { 'line-color': '#16a85f', 'line-width': 1.5 },
        });
      }

      // Single center marker (when used as a picker)
      if (latitude != null && longitude != null && (!markers || markers.length === 0)) {
        const marker = new maplibregl.Marker({
          color: '#16a85f',
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

  // Sync center marker
  useEffect(() => {
    if (!mapRef.current || !centerMarkerRef.current) return;
    if (latitude == null || longitude == null) return;
    centerMarkerRef.current.setLngLat([longitude, latitude]);
    mapRef.current.easeTo({ center: [longitude, latitude], duration: 300 });
  }, [latitude, longitude]);

  // Sync radius circle
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (latitude == null || longitude == null) return;

    const data = radiusKm && radiusKm > 0 ? circleGeoJSON(latitude, longitude, radiusKm) : null;

    const source = map.getSource('radius') as maplibregl.GeoJSONSource | undefined;

    if (data && source) {
      source.setData(data);
    } else if (data && !source) {
      map.addSource('radius', { type: 'geojson', data });
      map.addLayer({
        id: 'radius-fill',
        type: 'fill',
        source: 'radius',
        paint: { 'fill-color': '#16a85f', 'fill-opacity': 0.12 },
      });
      map.addLayer({
        id: 'radius-line',
        type: 'line',
        source: 'radius',
        paint: { 'line-color': '#16a85f', 'line-width': 1.5 },
      });
    } else if (!data && source) {
      if (map.getLayer('radius-fill')) map.removeLayer('radius-fill');
      if (map.getLayer('radius-line')) map.removeLayer('radius-line');
      map.removeSource('radius');
    }
  }, [latitude, longitude, radiusKm]);

  // Sync multiple markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Wait until the map is loaded if it isn't yet
    if (!map.loaded()) {
      map.once('load', () => {
        // re-trigger this effect
        map.fire('markers:reload');
      });
      return;
    }

    const nextMarkers = markers ?? [];
    const nextIds = new Set(nextMarkers.map(m => m.id));

    // Remove markers no longer present
    for (const [id, marker] of markersRef.current.entries()) {
      if (!nextIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }

    // Add/update markers
    for (const m of nextMarkers) {
      const existing = markersRef.current.get(m.id);
      if (existing) {
        existing.setLngLat([m.longitude, m.latitude]);
        existing.getElement().style.zIndex = m.highlighted ? '10' : '';
        existing.getElement().style.filter = m.highlighted
          ? 'drop-shadow(0 4px 8px rgba(22,168,95,0.6))'
          : '';
      } else {
        const marker = new maplibregl.Marker({
          color: m.highlighted ? '#f97316' : '#16a85f',
        })
          .setLngLat([m.longitude, m.latitude])
          .addTo(map);

        if (m.onClick) {
          marker.getElement().style.cursor = 'pointer';
          marker.getElement().addEventListener('click', m.onClick);
        }
        markersRef.current.set(m.id, marker);
      }
    }

    // If there are markers and no explicit center, fit bounds to them
    if (nextMarkers.length > 0 && latitude == null && longitude == null) {
      const bounds = new maplibregl.LngLatBounds();
      nextMarkers.forEach(m => bounds.extend([m.longitude, m.latitude]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 500 });
    } else if (nextMarkers.length === 1 && latitude == null) {
      map.easeTo({
        center: [nextMarkers[0].longitude, nextMarkers[0].latitude],
        zoom: 13,
        duration: 400,
      });
    }
  }, [markers, latitude, longitude]);

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden rounded-2xl border border-ink-100 ${className}`}
      style={{ height }}
    />
  );
}
