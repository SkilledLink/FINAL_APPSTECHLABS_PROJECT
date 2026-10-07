import { Loader2, MapPin, Search, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import type { LocationSearchResult } from '../types/location.types';
import CurrentLocationButton from './CurrentLocationButton';
import LocationSearch from './LocationSearch';
import ServiceRadiusSelector from './ServiceRadiusSelector';

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
  'Electrician', 'Plumber', 'Carpenter', 'Auto Mechanic', 'Painter',
  'Mason', 'Welder', 'AC Technician', 'Cleaner', 'Tailor',
  'Hairdresser', 'Tiler',
];

const INPUT =
  'w-full rounded border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/25 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100';

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
    <div className="rounded-md border border-slate-200/70 bg-white/85 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-16px_rgba(0,0,0,0.5)]">
      <div className="grid gap-4 md:grid-cols-[1fr_1.4fr_auto]">
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
            Service
          </label>
          <select
            value={value.profession}
            onChange={(e) => onChange({ ...value, profession: e.target.value })}
            className={INPUT}
          >
            <option value="" className="dark:bg-slate-900">
              Any profession
            </option>
            {PROFESSION_PRESETS.map((p) => (
              <option key={p} value={p} className="dark:bg-slate-900">
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
            Location{' '}
            <span className="font-medium normal-case tracking-normal text-slate-400/80">
              (optional)
            </span>
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
            className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm shadow-blue-500/25 transition-colors hover:bg-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span>Search</span>
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200/60 pt-4 dark:border-white/10">
        <button
          type="button"
          onClick={() =>
            onChange({ ...value, verifiedOnly: !value.verifiedOnly })
          }
          className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
            value.verifiedOnly
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
              : 'border border-slate-200/80 bg-white text-slate-600 hover:border-blue-500/40 hover:text-blue-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:text-blue-400'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Verified only
        </button>

        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
            advancedOpen
              ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
              : 'border border-slate-200/80 bg-white text-slate-600 hover:border-blue-500/40 hover:text-blue-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:text-blue-400'
          }`}
        >
          <MapPin className="h-3.5 w-3.5" />
          {advancedOpen ? 'Hide radius' : 'Adjust radius'}
        </button>

        <CurrentLocationButton
          onLocation={handleCurrentLocation}
          className="!w-auto [&_button]:!w-auto [&_button]:!px-3 [&_button]:!py-1.5 [&_button]:!text-xs [&_button]:!rounded"
        />

        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto inline-flex items-center gap-1 rounded bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {advancedOpen && (
        <div className="mt-4 border-t border-slate-200/60 pt-4 dark:border-white/10">
          <ServiceRadiusSelector
            value={value.radiusKm}
            onChange={(r) => onChange({ ...value, radiusKm: r })}
          />
          <p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">
            Radius applies only when a location is set.
          </p>
        </div>
      )}
    </div>
  );
}