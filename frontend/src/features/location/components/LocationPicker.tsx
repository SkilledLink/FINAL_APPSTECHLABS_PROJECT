import { useCallback, useState } from 'react';
import { locationService } from '../services/locationService';
import type {
  LocationSearchResult,
  ProfessionalLocationInput,
} from '../types/location.types';
import CurrentLocationButton from './CurrentLocationButton';
import LocationMap from './LocationMap';
import LocationSearch from './LocationSearch';
import ServiceRadiusSelector from './ServiceRadiusSelector';

interface LocationPickerProps {
  initialLatitude?: number;
  initialLongitude?: number;
  initialName?: string;
  initialRadiusKm?: number;
  showRadius?: boolean;
  onSave: (input: ProfessionalLocationInput, radiusKm?: number) => Promise<void>;
  onCancel?: () => void;
  saving?: boolean;
}

const DEFAULT_CENTER = { lat: 3.848, lng: 11.502 }; // Yaoundé

export default function LocationPicker({
  initialLatitude,
  initialLongitude,
  initialName,
  initialRadiusKm = 10,
  showRadius = true,
  onSave,
  onCancel,
  saving = false,
}: LocationPickerProps) {
  const [lat, setLat] = useState(initialLatitude ?? DEFAULT_CENTER.lat);
  const [lng, setLng] = useState(initialLongitude ?? DEFAULT_CENTER.lng);
  const [name, setName] = useState(initialName ?? '');
  const [meta, setMeta] = useState<Omit<ProfessionalLocationInput, 'latitude' | 'longitude' | 'location_name'>>({});
  const [radiusKm, setRadiusKm] = useState(initialRadiusKm);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = useCallback(async (r: LocationSearchResult) => {
    setLat(r.latitude);
    setLng(r.longitude);
    setName(r.display_name);
    setMeta({
      country: r.country,
      country_code: r.country_code,
      region: r.region,
      city: r.city,
      area: r.area,
      postcode: r.postcode,
    });
  }, []);

  const handleCurrentLocation = useCallback(
    async (newLat: number, newLng: number) => {
      setLat(newLat);
      setLng(newLng);
      setResolving(true);
      setError(null);
      try {
        const rev = await locationService.reverse(newLat, newLng);
        setName(rev.display_name);
        setMeta({
          country: rev.country,
          country_code: rev.country_code,
          region: rev.region,
          city: rev.city,
          area: rev.area,
          postcode: rev.postcode,
        });
      } catch (err: any) {
        setError(err?.message ?? 'Could not resolve address for that point');
      } finally {
        setResolving(false);
      }
    },
    []
  );

  const handleDragEnd = useCallback(
    (newLat: number, newLng: number) => {
      handleCurrentLocation(newLat, newLng);
    },
    [handleCurrentLocation]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Pick a location before saving.');
      return;
    }

    await onSave(
      {
        latitude: lat,
        longitude: lng,
        location_name: name.trim(),
        ...meta,
      },
      showRadius ? radiusKm : undefined
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700">
          Where are you based?
        </label>
        <LocationSearch onSelect={handleSelect} autoFocus />
      </div>

      <CurrentLocationButton onLocation={handleCurrentLocation} />

      <LocationMap
        latitude={lat}
        longitude={lng}
        radiusKm={showRadius ? radiusKm : undefined}
        draggable
        height={340}
        onMarkerDragEnd={handleDragEnd}
      />

      {(resolving || name) && (
        <div className="rounded-xl bg-ink-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-400">
            Selected location
          </p>
          <p className="mt-0.5 text-sm font-medium text-ink-900">
            {resolving ? 'Resolving address…' : name}
          </p>
        </div>
      )}

      {showRadius && (
        <div>
          <label className="mb-2 block text-sm font-medium text-ink-700">
            How far do you provide services?
          </label>
          <ServiceRadiusSelector value={radiusKm} onChange={setRadiusKm} />
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving || resolving}
          className="flex-1 rounded-xl bg-ink-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-ink-900/20 transition-all hover:bg-ink-800 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save location'}
        </button>
      </div>
    </form>
  );
}