import { Loader2, Navigation } from 'lucide-react';
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
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-medium text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Navigation className="h-4 w-4" />
        )}
        Use my current location
      </button>
      {error && (
        <p className="mt-1.5 text-xs text-rose-600">{error}</p>
      )}
    </div>
  );
}