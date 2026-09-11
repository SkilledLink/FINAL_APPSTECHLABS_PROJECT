import { MapPin } from 'lucide-react';
import type { PublicLocation } from '../types/location.types';

interface ProfessionalLocationCardProps {
  location: PublicLocation | null | undefined;
  distanceKm?: number;
  className?: string;
}

export default function ProfessionalLocationCard({
  location,
  distanceKm,
  className = '',
}: ProfessionalLocationCardProps) {
  if (!location) {
    return (
      <p className={`text-xs text-ink-400 ${className}`}>Location not set</p>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs ${className}`}>
      <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-500" />
      <span className="truncate text-ink-600">{location.display_name}</span>
      {typeof distanceKm === 'number' && (
        <>
          <span className="text-ink-300">·</span>
          <span className="font-medium text-ink-700 tabular-nums">
            {distanceKm < 1
              ? `${Math.round(distanceKm * 1000)} m`
              : `${distanceKm.toFixed(1)} km`}
          </span>
        </>
      )}
    </div>
  );
}