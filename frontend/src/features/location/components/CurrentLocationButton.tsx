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
        className="group inline-flex w-full items-center justify-center gap-2 rounded border border-slate-200/80 bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate-700 backdrop-blur-md transition-colors hover:border-blue-500/40 hover:bg-white hover:text-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:bg-slate-800/70 dark:hover:text-blue-400"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
        ) : (
          <Navigation className="h-4 w-4 text-blue-600 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-blue-400" />
        )}
        <span>Use my current location</span>
      </button>

      {error && (
        <div className="mt-2 flex items-center gap-2 rounded border border-rose-500/20 bg-rose-500/8 px-3 py-2 text-xs font-medium text-rose-600 backdrop-blur-md dark:text-rose-300">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}