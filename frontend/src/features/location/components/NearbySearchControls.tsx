import { Search, X, Loader2, ShieldCheck, MapPin } from 'lucide-react';
import { useState } from 'react';
import type { LocationSearchResult } from '../types/location.types';
import LocationSearch from './LocationSearch';
import ServiceRadiusSelector from './ServiceRadiusSelector';
import CurrentLocationButton from './CurrentLocationButton';

export interface NearbySearchState {
  profession: string;
  location: LocationSearchResult | null;
  radiusKm: number;
  verifiedOnly: boolean;
}

interface NearbySearchControlsProps {
  value: NearbySearchState;
  onChange: (next: NearbySearchState) => void;
  onSearch: () => void;
  loading: boolean;
}

const PROFESSION_PRESETS = [
  'Electrician',
  'Plumber',
  'Carpenter',
  'Auto Mechanic',
  'Painter',
  'Mason',
  'Welder',
  'AC Technician',
  'Cleaner',
  'Tailor',
  'Hairdresser',
  'Tiler',
];

export default function NearbySearchControls({
  value,
  onChange,
  onSearch,
  loading,
}: NearbySearchControlsProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleLocationSelect = (result: LocationSearchResult) => {
    onChange({ ...value, location: result });
  };

  const handleCurrentLocation = async (lat: number, lng: number) => {
    onChange({
      ...value,
      location: {
        display_name: `Near ${lat.toFixed(3)}, ${lng.toFixed(3)}`,
        latitude: lat,
        longitude: lng,
        country: null,
        country_code: null,
        region: null,
        city: null,
        area: null,
        postcode: null,
        osm_type: null,
        osm_id: null,
        place_type: null,
      },
    });
  };

  const clearAll = () => {
    onChange({
      profession: '',
      location: null,
      radiusKm: 10,
      verifiedOnly: false,
    });
    setAdvancedOpen(false);
  };

  const hasFilters =
    !!value.profession || !!value.location || value.verifiedOnly;

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1fr_1.4fr_auto]">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-400">
            Service
          </label>
          <select
            value={value.profession}
            onChange={(e) => onChange({ ...value, profession: e.target.value })}
            className="w-full rounded-xl border border-ink-200 bg-white px-3 py-3 text-sm outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            <option value="">Any profession</option>
            {PROFESSION_PRESETS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-400">
            Location <span className="text-ink-300">(optional)</span>
          </label>
          <LocationSearch
            onSelect={handleLocationSelect}
            placeholder="Leave empty to see everyone"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onSearch}
            disabled={loading}
            className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-ink-900 px-5 text-sm font-semibold text-white shadow-lg shadow-ink-900/20 transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3.5">
        <button
          type="button"
          onClick={() =>
            onChange({ ...value, verifiedOnly: !value.verifiedOnly })
          }
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            value.verifiedOnly
              ? 'bg-brand-500 text-white shadow-sm'
              : 'border border-ink-200 bg-white text-ink-600 hover:border-ink-300'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Verified only
        </button>

        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            advancedOpen
              ? 'bg-ink-100 text-ink-800'
              : 'border border-ink-200 bg-white text-ink-600 hover:border-ink-300'
          }`}
        >
          <MapPin className="h-3.5 w-3.5" />
          {advancedOpen ? 'Hide radius' : 'Adjust radius'}
        </button>

        <CurrentLocationButton onLocation={handleCurrentLocation} className="!w-auto" />

        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto inline-flex items-center gap-1 rounded-full bg-ink-50 px-3 py-1 text-xs font-medium text-ink-600 hover:bg-ink-100"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {advancedOpen && (
        <div className="mt-4 border-t border-ink-100 pt-4">
          <ServiceRadiusSelector
            value={value.radiusKm}
            onChange={(r) => onChange({ ...value, radiusKm: r })}
          />
          <p className="mt-2 text-xs text-ink-400">
            Radius applies only when a location is set.
          </p>
        </div>
      )}
    </div>
  );
}