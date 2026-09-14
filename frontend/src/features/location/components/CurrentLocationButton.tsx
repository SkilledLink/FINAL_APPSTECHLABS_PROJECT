import { AlertCircle, Loader2, Navigation } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';

interface CurrentLocationButtonProps {
  onLocation: (lat: number, lng: number) => void;
  className?: string;
}

export default function CurrentLocationButton({
  onLocation,
  className = '',
}: CurrentLocationButtonProps) {
  const { request, loading, error, status } = useGeolocation();

  const handleClick = async () => {
    const coords = await request();
    if (coords) onLocation(coords.latitude, coords.longitude);
  };

  const disabled = loading || status === 'unsupported';

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="group relative inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-indigo-300 hover:bg-white hover:text-indigo-600 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
        ) : (
          <Navigation className="h-4 w-4 text-indigo-600 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-indigo-400" />
        )}
        <span>Use my current location</span>
      </button>

      {error && (
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-rose-200/80 bg-rose-50/80 px-3 py-2 text-xs font-medium text-rose-600 backdrop-blur-sm dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500 dark:text-rose-400" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}