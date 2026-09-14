// src/features/portfolio/components/PortfolioHeader.tsx
import {
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import type { Portfolio } from '../types/portfolio.types';
import Avatar from '../../../components/ui/Avatar';

interface PortfolioHeaderProps {
  portfolio?: Portfolio | null;
  onEdit?: () => void;
  isOwner?: boolean;
}

/* ───────────────────────── helpers ───────────────────────── */

const formatExternalUrl = (url: string) => {
  if (!url) return '#';
  return url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `https://${url}`;
};

const formatWhatsAppUrl = (phone: string) => {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return `https://wa.me/${cleaned}`;
};

/* ───────────────────────── chips ───────────────────────── */

const chipCls =
  'inline-flex items-center gap-1.5 rounded border border-slate-200/80 ' +
  'bg-white/70 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 ' +
  'backdrop-blur-md transition-colors hover:border-blue-500/40 hover:text-blue-700 ' +
  'dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-200 ' +
  'dark:hover:border-blue-500/40 dark:hover:text-blue-400';

const chipWhatsAppCls =
  'inline-flex items-center gap-1.5 rounded border border-blue-500/25 ' +
  'bg-blue-500/8 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 ' +
  'backdrop-blur-md transition-colors hover:bg-blue-500/15 ' +
  'dark:border-blue-400/25 dark:text-blue-300';

/* ─────────────────────────────────────────────────────────── */

export default function PortfolioHeader({
  portfolio,
  onEdit,
  isOwner = false,
}: PortfolioHeaderProps) {
  /* ── GUARD: never read portfolio.* without this ── */
  if (!portfolio) {
    return (
      <div className="rounded-md border border-dashed border-slate-200/80 bg-slate-50/60 px-6 py-10 text-center dark:border-white/10 dark:bg-slate-900/40">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Profile data not available yet.
        </p>
      </div>
    );
  }

  const author = portfolio.user;
  const fullName = author
    ? `${author.first_name ?? ''} ${author.last_name ?? ''}`.trim() ||
      author.username ||
      'Professional'
    : 'Professional';

  const locationLabel =
    portfolio.city && portfolio.region
      ? `${portfolio.city}, ${portfolio.region}`
      : portfolio.city ||
        portfolio.region ||
        portfolio.country ||
        'Location not set';

  const averageRating =
    portfolio.average_rating != null ? Number(portfolio.average_rating) : 0;

  /* Cover resolution: portfolio cover → author banner → gradient */
  const coverUrl =
    portfolio.cover_image_url || author?.banner_image_url || null;
  const avatarUrl = author?.profile_image_url ?? undefined;

  return (
    <div
      className="group/header relative overflow-hidden rounded-md
                 border border-slate-200/70 bg-white/85
                 dark:border-white/10 dark:bg-slate-900/60
                 backdrop-blur-xl
                 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)]
                 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-16px_rgba(0,0,0,0.5)]
                 transition-all duration-300"
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-blue-500/12 blur-3xl" />

      {/* Cover */}
      <div className="relative h-24 w-full overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 sm:h-32 lg:h-40 dark:from-blue-600 dark:via-blue-800 dark:to-slate-900">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`${portfolio.business_name || fullName} cover`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover/header:scale-[1.02]"
          />
        ) : (
          <>
            <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_70%,white,transparent_40%)]" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-blue-300/20 blur-3xl" />
          </>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />

        {isOwner && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit profile"
            className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded
                       border border-white/40 bg-white/95 px-2.5 py-1 text-[11px] font-bold
                       text-slate-900 shadow-lg shadow-blue-950/20 backdrop-blur-md
                       transition-colors hover:bg-white
                       active:scale-95
                       dark:border-slate-700/60 dark:bg-slate-900/90 dark:text-slate-100
                       dark:hover:bg-slate-900
                       sm:right-4 sm:top-4 sm:px-3.5 sm:py-1.5"
          >
            <Pencil className="h-3 w-3" />
            <span className="hidden sm:inline">Edit profile</span>
          </button>
        )}
      </div>

      {/* Body */}
      <div className="relative px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="-mt-10 mb-3 flex items-end justify-between gap-3 sm:-mt-14 sm:mb-4">
          <Avatar
            name={fullName}
            avatar={avatarUrl}
            size="xl"
            className="!h-16 !w-16 !text-xl ring-4 ring-white dark:!ring-slate-900 sm:!h-24 sm:!w-24 sm:!text-2xl"
          />

          {portfolio.is_featured && (
            <span
              className="inline-flex items-center gap-1 rounded border border-blue-500/25
                         bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase
                         tracking-wider text-blue-700 backdrop-blur-md
                         dark:border-blue-400/25 dark:text-blue-300
                         sm:px-2.5 sm:py-1"
            >
              <Star className="h-3 w-3 fill-blue-500 text-blue-500" />
              Featured
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl lg:text-3xl">
            {portfolio.business_name || fullName}
          </h1>

          {portfolio.is_verified && (
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded border
                         border-blue-500/20 bg-blue-500/8 px-1.5 py-0.5 text-[10px]
                         font-bold uppercase tracking-wider text-blue-700
                         dark:border-blue-400/20 dark:text-blue-400"
              title="Verified professional"
            >
              <ShieldCheck className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>

        {portfolio.business_name && author && (
          <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            by {fullName}
          </p>
        )}

        {portfolio.tagline && (
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
            {portfolio.tagline}
          </p>
        )}

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-500" />
            {locationLabel}
          </span>

          {averageRating > 0 && (
            <>
              <span className="hidden h-3 w-px bg-slate-200 dark:bg-white/10 sm:inline-block" />
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 shrink-0 fill-blue-500 text-blue-500" />
                <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-slate-400 dark:text-slate-500">
                  ({portfolio.total_reviews ?? 0}{' '}
                  {portfolio.total_reviews === 1 ? 'review' : 'reviews'})
                </span>
              </span>
            </>
          )}

          {portfolio.years_experience != null &&
            portfolio.years_experience > 0 && (
              <>
                <span className="hidden h-3 w-px bg-slate-200 dark:bg-white/10 sm:inline-block" />
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  {portfolio.years_experience}{' '}
                  {portfolio.years_experience === 1 ? 'year' : 'years'} experience
                </span>
              </>
            )}
        </div>

        {/* Chips */}
        {(portfolio.phone ||
          portfolio.whatsapp ||
          portfolio.email ||
          portfolio.website_url ||
          portfolio.linkedin_url ||
          portfolio.instagram_url ||
          portfolio.facebook_url) && (
          <div className="mt-4 flex flex-wrap gap-1.5 sm:gap-2">
            {portfolio.phone && (
              <a href={`tel:${portfolio.phone}`} className={chipCls}>
                <Phone className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                {portfolio.phone}
              </a>
            )}

            {portfolio.whatsapp && (
              <a
                href={formatWhatsAppUrl(portfolio.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className={chipWhatsAppCls}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
            )}

            {portfolio.email && (
              <a href={`mailto:${portfolio.email}`} className={chipCls}>
                <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                Email
              </a>
            )}

            {portfolio.website_url && (
              <a
                href={formatExternalUrl(portfolio.website_url)}
                target="_blank"
                rel="noopener noreferrer"
                className={chipCls}
              >
                <Globe className="h-3.5 w-3.5 text-blue-500" />
                Website
              </a>
            )}

            {portfolio.linkedin_url && (
              <a
                href={formatExternalUrl(portfolio.linkedin_url)}
                target="_blank"
                rel="noopener noreferrer"
                className={chipCls}
              >
                <FaLinkedinIn className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                LinkedIn
              </a>
            )}

            {portfolio.instagram_url && (
              <a
                href={formatExternalUrl(portfolio.instagram_url)}
                target="_blank"
                rel="noopener noreferrer"
                className={chipCls}
              >
                <FaInstagram className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
                Instagram
              </a>
            )}

            {portfolio.facebook_url && (
              <a
                href={formatExternalUrl(portfolio.facebook_url)}
                target="_blank"
                rel="noopener noreferrer"
                className={chipCls}
              >
                <FaFacebookF className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                Facebook
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}