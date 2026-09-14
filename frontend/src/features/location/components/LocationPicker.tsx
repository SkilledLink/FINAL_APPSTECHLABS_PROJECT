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
    radiusKm?: number,
  ) => Promise<void>;
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
    [],
  );

  const handleDragEnd = useCallback(
    (newLat: number, newLng: number) => {
      handleCurrentLocation(newLat, newLng);
    },
    [handleCurrentLocation],
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
      showRadius ? radiusKm : undefined,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Location Search Input */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>Where are you based?</span>
        </label>
        <LocationSearch onSelect={handleSelect} autoFocus />
      </div>

      {/* Geolocation Button */}
      <CurrentLocationButton onLocation={handleCurrentLocation} />

      {/* Interactive Map Wrapper */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 shadow-sm transition-colors dark:border-slate-800">
        <LocationMap
          latitude={lat}
          longitude={lng}
          radiusKm={showRadius ? radiusKm : undefined}
          draggable
          height={320}
          onMarkerDragEnd={handleDragEnd}
        />
      </div>

      {/* Selected Address Preview Box */}
      {(resolving || name) && (
        <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-purple-50/30 to-slate-50/50 p-4 backdrop-blur-sm dark:border-indigo-900/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm dark:bg-indigo-500">
              {resolving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Selected Address
              </span>
              <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {resolving ? 'Resolving address details…' : name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Service Radius Slider */}
      {showRadius && (
        <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>How far do you provide services?</span>
          </label>
          <ServiceRadiusSelector value={radiusKm} onChange={setRadiusKm} />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-200/80 bg-rose-50/80 p-4 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.99] disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving || resolving}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Location</span>
          )}
        </button>
      </div>
    </form>
  );
}