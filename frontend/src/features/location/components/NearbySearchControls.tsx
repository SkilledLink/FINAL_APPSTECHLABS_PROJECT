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
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-4 md:grid-cols-[1fr_1.4fr_auto]">
        {/* Service Select */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Service
          </label>
          <select
            value={value.profession}
            onChange={(e) => onChange({ ...value, profession: e.target.value })}
            className="w-full rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
          >
            <option
              value=""
              className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
            >
              Any profession
            </option>
            {PROFESSION_PRESETS.map((p) => (
              <option
                key={p}
                value={p}
                className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
              >
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Location Search Input */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Location{' '}
            <span className="font-normal text-slate-400/80 dark:text-slate-600">
              (optional)
            </span>
          </label>
          <LocationSearch
            onSelect={handleLocationSelect}
            placeholder="Leave empty to see everyone"
          />
        </div>

        {/* Search Submit Button */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={onSearch}
            disabled={loading}
            className="inline-flex h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:shadow-indigo-500/10 md:w-auto"
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

      {/* Quick Filter Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <button
          type="button"
          onClick={() =>
            onChange({ ...value, verifiedOnly: !value.verifiedOnly })
          }
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
            value.verifiedOnly
              ? 'bg-indigo-600 text-white shadow-sm dark:bg-indigo-500'
              : 'border border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Verified only
        </button>

        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
            advancedOpen
              ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
              : 'border border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <MapPin className="h-3.5 w-3.5" />
          {advancedOpen ? 'Hide radius' : 'Adjust radius'}
        </button>

        <CurrentLocationButton
          onLocation={handleCurrentLocation}
          className="!w-auto"
        />

        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Collapsible Radius Selector */}
      {advancedOpen && (
        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
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