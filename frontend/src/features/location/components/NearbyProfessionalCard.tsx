import {
  ArrowUpRight,
  BadgeCheck,
  Clock,
  Globe,
  MapPin,
  Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '../../../components/ui/Avatar';
import type { DiscoverProfessional } from '../types/location.types';

interface NearbyProfessionalCardProps {
  professional: DiscoverProfessional;
  onSelect?: (id: string) => void;
}

function formatDistance(km: number): string {
  if (km < 0.1) return 'At your location';
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}

export default function NearbyProfessionalCard({
  professional,
  onSelect,
}: NearbyProfessionalCardProps) {
  const { user, public_location, distance_km } = professional;
  const fullName = `${user.first_name} ${user.last_name}`.trim();
  const profileHref = user.username
    ? `/profile/${user.username}`
    : `/professionals/${professional.id}`;

  const services = professional.services ?? [];
  const skills = professional.skills ?? [];
  const visibleServices = services.slice(0, 4);
  const remaining = services.length - visibleServices.length;

  const locationLabel =
    public_location?.display_name ||
    [professional.city, professional.region, professional.country]
      .filter(Boolean)
      .join(', ') ||
    'Location not shared';

  const hasDistance = typeof distance_km === 'number' && distance_km >= 0;

  return (
    <Link
      to={profileHref}
      onClick={() => onSelect?.(professional.id)}
      className="group relative block overflow-hidden rounded-md border border-slate-200/70 bg-white/85 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-[0_8px_24px_-12px_rgba(59,130,246,0.25)] dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-blue-500/30"
    >
      <span className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-blue-500 to-blue-700 transition-transform duration-300 group-hover:scale-x-100" />

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <Avatar
              name={fullName}
              avatar={user.profile_image_url ?? undefined}
              size="lg"
            />
            {professional.available && (
              <span
                className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-600 dark:border-slate-900"
                aria-label="Available"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate text-[15px] font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400">
                    {fullName}
                  </h3>
                  {professional.is_verified && (
                    <BadgeCheck
                      className="h-4 w-4 shrink-0 fill-blue-600 text-white dark:fill-blue-500 dark:text-slate-900"
                      aria-label="Verified professional"
                    />
                  )}
                </div>

                <p className="mt-0.5 truncate text-sm font-medium text-slate-600 dark:text-slate-400">
                  {professional.profession}
                  {professional.company_name && (
                    <>
                      <span className="mx-1.5 text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {professional.company_name}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {professional.rating > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-blue-500 text-blue-500" />
                  <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">
                    {professional.rating.toFixed(1)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    ({professional.total_reviews}{' '}
                    {professional.total_reviews === 1 ? 'review' : 'reviews'})
                  </span>
                </span>
              ) : (
                <span className="font-medium text-slate-400 dark:text-slate-500">
                  New on SkilledLink
                </span>
              )}

              {professional.years_of_experience != null &&
                professional.years_of_experience > 0 && (
                  <>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="inline-flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
                      <Clock className="h-3 w-3" />
                      {professional.years_of_experience}{' '}
                      {professional.years_of_experience === 1 ? 'yr' : 'yrs'}{' '}
                      experience
                    </span>
                  </>
                )}
            </div>
          </div>
        </div>

        {professional.headline && (
          <p className="mt-3.5 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {professional.headline}
          </p>
        )}

        {visibleServices.length > 0 && (
          <div className="mt-4">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              Services offered
            </div>
            <div className="flex flex-wrap gap-1.5">
              {visibleServices.map((service) => (
                <span
                  key={service}
                  className="rounded-sm border border-blue-500/20 bg-blue-500/8 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:border-blue-400/20 dark:text-blue-300"
                >
                  {service}
                </span>
              ))}
              {remaining > 0 && (
                <span className="rounded-sm bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  +{remaining} more
                </span>
              )}
            </div>
          </div>
        )}

        {visibleServices.length === 0 && skills.length > 0 && (
          <div className="mt-4">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              Specialties
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="rounded-sm bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="rounded-sm bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  +{skills.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60 pt-4 dark:border-white/10">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              {public_location ? (
                <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
              ) : (
                <Globe className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
              )}
              <span className="truncate font-medium">{locationLabel}</span>
            </div>
            {hasDistance && (
              <div className="mt-0.5 pl-5 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                {formatDistance(distance_km as number)}
              </div>
            )}
          </div>

          {professional.hourly_rate != null && (
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                Rate
              </div>
              <div className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {professional.hourly_rate.toLocaleString()}{' '}
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {professional.currency}/hr
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}