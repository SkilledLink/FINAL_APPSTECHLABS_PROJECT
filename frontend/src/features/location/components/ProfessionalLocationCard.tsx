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
      <p
        className={`text-xs font-medium text-slate-400 dark:text-slate-500 ${className}`}
      >
        Location not set
      </p>
    );
  }

  const hasDistance = typeof distanceKm === 'number' && distanceKm >= 0;

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 ${className}`}
    >
      <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
      <span className="truncate font-medium">{location.display_name}</span>
      {hasDistance && (
        <>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="font-semibold tabular-nums text-blue-600 dark:text-blue-400">
            {distanceKm < 0.1
              ? 'Here'
              : distanceKm < 1
              ? `${Math.round(distanceKm * 1000)} m`
              : `${distanceKm.toFixed(1)} km`}
          </span>
        </>
      )}
    </div>
  );
}