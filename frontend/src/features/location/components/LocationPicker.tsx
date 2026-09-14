import { useCallback, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  Sparkles,
} from 'lucide-react';
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
  onSave: (
    input: ProfessionalLocationInput,
    radiusKm?: number
  ) => Promise<void>;
  onCancel?: () => void;
  saving?: boolean;
}

const DEFAULT_CENTER = { lat: 3.848, lng: 11.502 };

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
  const [meta, setMeta] = useState<
    Omit<
      ProfessionalLocationInput,
      'latitude' | 'longitude' | 'location_name'
    >
  >({});
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Where are you based?</span>
        </label>
        <LocationSearch onSelect={handleSelect} autoFocus />
      </div>

      <CurrentLocationButton onLocation={handleCurrentLocation} />

      <div className="relative overflow-hidden rounded-md border border-slate-200/70 shadow-sm dark:border-white/10">
        <LocationMap
          latitude={lat}
          longitude={lng}
          radiusKm={showRadius ? radiusKm : undefined}
          draggable
          height={320}
          onMarkerDragEnd={handleDragEnd}
        />
      </div>

      {(resolving || name) && (
        <div className="relative overflow-hidden rounded-md border border-blue-500/20 bg-blue-500/[0.04] p-4 backdrop-blur-md dark:border-blue-400/20 dark:bg-blue-500/[0.06]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-blue-600 text-white shadow-sm shadow-blue-500/25">
              {resolving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">
                Selected address
              </span>
              <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {resolving ? 'Resolving address details…' : name}
              </p>
            </div>
          </div>
        </div>
      )}

      {showRadius && (
        <div className="space-y-2 rounded-md border border-slate-200/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>How far do you provide services?</span>
          </label>
          <ServiceRadiusSelector value={radiusKm} onChange={setRadiusKm} />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 rounded-md border border-rose-500/20 bg-rose-500/8 p-4 text-sm font-medium text-rose-700 backdrop-blur-md dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded border border-slate-200/80 bg-white/70 py-3 text-sm font-semibold text-slate-700 backdrop-blur-md transition-colors hover:bg-white active:scale-[0.99] disabled:opacity-50 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:bg-slate-800/70"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving || resolving}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-colors hover:bg-blue-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving…</span>
            </>
          ) : (
            <span>Save location</span>
          )}
        </button>
      </div>
    </form>
  );
}