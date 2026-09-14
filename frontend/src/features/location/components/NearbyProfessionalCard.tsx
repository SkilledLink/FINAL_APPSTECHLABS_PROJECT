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
      className="group relative block overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50 dark:hover:shadow-indigo-500/5"
    >
      {/* Top Accent Gradient Line */}
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-transform duration-300 group-hover:scale-x-100" />

      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar with Availability Ring */}
          <div className="relative shrink-0">
            <Avatar
              name={fullName}
              avatar={user.profile_image_url ?? undefined}
              size="lg"
            />
            {professional.available && (
              <span
                className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 ring-2 ring-emerald-500/20 dark:border-slate-900"
                title="Available"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate text-base font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                    {fullName}
                  </h3>
                  {professional.is_verified && (
                    <BadgeCheck
                      className="h-4 w-4 shrink-0 fill-indigo-600 text-white dark:fill-indigo-400 dark:text-slate-900"
                      title="Verified professional"
                    />
                  )}
                </div>

                <p className="mt-0.5 truncate text-sm font-medium text-slate-600 dark:text-slate-400">
                  {professional.profession}
                  {professional.company_name && (
                    <>
                      <span className="mx-1.5 text-slate-300 dark:text-slate-700">
                        ·
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {professional.company_name}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 dark:text-slate-500" />
            </div>

            {/* Rating and Experience Badges */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {professional.rating > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-900 tabular-nums dark:text-slate-100">
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
                    <span className="text-slate-300 dark:text-slate-700">
                      ·
                    </span>
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

        {/* Headline */}
        {professional.headline && (
          <p className="mt-3.5 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {professional.headline}
          </p>
        )}

        {/* Services Offered */}
        {visibleServices.length > 0 && (
          <div className="mt-4">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Services offered
            </div>
            <div className="flex flex-wrap gap-1.5">
              {visibleServices.map((service) => (
                <span
                  key={service}
                  className="rounded-lg bg-indigo-50/80 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:ring-indigo-900/50"
                >
                  {service}
                </span>
              ))}
              {remaining > 0 && (
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  +{remaining} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Specialties Fallback */}
        {visibleServices.length === 0 && skills.length > 0 && (
          <div className="mt-4">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Specialties
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  +{skills.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer Info: Location & Rate */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              {public_location ? (
                <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Globe className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
              )}
              <span className="truncate font-medium">{locationLabel}</span>
            </div>
            {hasDistance && (
              <div className="mt-0.5 pl-5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {formatDistance(distance_km as number)}
              </div>
            )}
          </div>

          {professional.hourly_rate != null && (
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Rate
              </div>
              <div className="text-sm font-bold text-slate-900 tabular-nums dark:text-slate-100">
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