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
  portfolio: Portfolio;
  onEdit?: () => void;
  isOwner?: boolean;
}

/** Ensure external links start with http:// or https:// */
const formatExternalUrl = (url: string) => {
  if (!url) return '#';
  return url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `https://${url}`;
};

/** Clean up phone numbers for the WhatsApp URL scheme */
const formatWhatsAppUrl = (phone: string) => {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return `https://wa.me/${cleaned}`;
};

/** Shared chip class – adapts to light/dark automatically */
const chipCls =
  'inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-500/40 hover:bg-cyan-50/60 hover:text-cyan-700 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-cyan-500/40 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-400';

export default function PortfolioHeader({
  portfolio,
  onEdit,
  isOwner = false,
}: PortfolioHeaderProps) {
  const author = portfolio.user;
  const fullName = author
    ? `${author.first_name} ${author.last_name}`.trim() ||
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

  return (
    <div className="group/header relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-xl transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-900/80">
      {/* Cover */}
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-700 sm:h-56 dark:from-cyan-600 dark:via-blue-700 dark:to-slate-900">
        {portfolio.cover_image_url ? (
          <img
            src={portfolio.cover_image_url}
            alt={`${portfolio.business_name || fullName} cover`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover/header:scale-[1.02]"
          />
        ) : (
          <>
            {/* Decorative radial glows */}
            <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_70%,white,transparent_40%)]" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          </>
        )}

        {/* Bottom fade for avatar legibility */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />

        {isOwner && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/95 px-3.5 py-1.5 text-xs font-bold text-slate-900 shadow-lg shadow-slate-900/10 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-xl active:scale-95 dark:border-slate-700/60 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit profile
          </button>
        )}
      </div>

      {/* Body */}
      <div className="relative px-6 pb-6">
        {/* Avatar overlap + Featured badge */}
        <div className="-mt-14 mb-4 flex items-end justify-between gap-3">
          <Avatar
            name={fullName}
            avatar={author?.profile_image_url ?? undefined}
            size="xl"
            className="!h-24 !w-24 !text-2xl ring-4 ring-white dark:!ring-slate-900"
          />

          {portfolio.is_featured && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 backdrop-blur-md dark:text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              Featured
            </span>
          )}
        </div>

        {/* Name + Verified badge */}
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            {portfolio.business_name || fullName}
          </h1>
          {portfolio.is_verified && (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-400"
              title="Verified professional"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified
            </span>
          )}
        </div>

        {portfolio.business_name && author && (
          <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
            by {fullName}
          </p>
        )}

        {portfolio.tagline && (
          <p className="mt-2 text-base font-medium text-slate-700 dark:text-slate-300">
            {portfolio.tagline}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
            {locationLabel}
          </span>

          {portfolio.average_rating != null && portfolio.average_rating > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {Number(portfolio.average_rating).toFixed(1)}
              </span>
              <span className="text-slate-400 dark:text-slate-500">
                ({portfolio.total_reviews}{' '}
                {portfolio.total_reviews === 1 ? 'review' : 'reviews'})
              </span>
            </span>
          )}

          {portfolio.years_experience != null && portfolio.years_experience > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
              {portfolio.years_experience}{' '}
              {portfolio.years_experience === 1 ? 'year' : 'years'} experience
            </span>
          )}
        </div>

        {/* Contact & Social chips */}
        <div className="mt-5 flex flex-wrap gap-2">
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
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:bg-emerald-500/15 dark:text-emerald-400"
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
              <Globe className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
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
      </div>
    </div>
  );
}