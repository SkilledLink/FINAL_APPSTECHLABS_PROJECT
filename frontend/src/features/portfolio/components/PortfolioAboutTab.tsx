// src/features/portfolio/components/PortfolioAboutTab.tsx
import React from 'react';
import {
  Award,
  Briefcase,
  Building2,
  ExternalLink,
  Globe,
  Languages as LanguagesIcon,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Quote,
  ShieldCheck,
  Tag,
  Users,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import type { Portfolio } from '../types/portfolio.types';

interface PortfolioAboutTabProps {
  portfolio?: Portfolio | null;
}

/* ───────────────────────── Shared tokens ───────────────────────── */

const CARD =
  'relative overflow-hidden rounded-md border border-slate-200/70 bg-white/85 ' +
  'backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 ' +
  'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)] ' +
  'dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-16px_rgba(0,0,0,0.5)] ' +
  'p-5 sm:p-6';

const CARD_HEADER =
  'mb-4 flex items-center gap-2.5 border-b border-slate-200/60 pb-4 dark:border-white/10';

const CARD_TITLE =
  'text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white';

const ICON_TILE =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ' +
  'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:border-blue-400/20 dark:text-blue-400';

const MINI_LABEL =
  'text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500';

const CHIP_LINK =
  'inline-flex items-center gap-1.5 rounded border border-slate-200/80 bg-white/70 ' +
  'px-3 py-1.5 text-xs font-semibold text-slate-700 backdrop-blur-md ' +
  'transition-colors hover:border-blue-500/40 hover:text-blue-700 ' +
  'dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-200 ' +
  'dark:hover:border-blue-500/40 dark:hover:text-blue-400';

const CHIP_NEUTRAL =
  'rounded-sm border border-slate-200/60 bg-white/70 px-2.5 py-1 text-xs ' +
  'font-medium text-slate-700 dark:border-white/10 dark:bg-slate-800/50 ' +
  'dark:text-slate-300';

const CHIP_BLUE =
  'inline-flex items-center gap-1 rounded-sm border border-blue-500/20 ' +
  'bg-blue-500/8 px-2.5 py-1 text-xs font-semibold text-blue-700 ' +
  'dark:border-blue-400/20 dark:text-blue-300';

/* ───────────────────────── InfoRow ───────────────────────── */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3.5 py-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:border-blue-400/20 dark:text-blue-400">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className={MINI_LABEL}>{label}</div>
        <div className="mt-0.5 break-words text-sm font-semibold text-slate-800 dark:text-slate-200">
          {value}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Component ───────────────────────── */

export default function PortfolioAboutTab({
  portfolio,
}: PortfolioAboutTabProps) {
  if (!portfolio) {
    return (
      <div className="rounded-md border border-dashed border-slate-200/80 bg-slate-50/60 px-6 py-10 text-center dark:border-white/10 dark:bg-slate-900/40">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          No portfolio data available yet.
        </p>
      </div>
    );
  }

  const hasSocial = Boolean(
    portfolio.website_url ||
      portfolio.linkedin_url ||
      portfolio.facebook_url ||
      portfolio.instagram_url ||
      portfolio.tiktok_url
  );

  const locationString = [portfolio.city, portfolio.region, portfolio.country]
    .filter(Boolean)
    .join(', ');

  const formattedWhatsApp = portfolio.whatsapp
    ? portfolio.whatsapp.replace(/[^0-9]/g, '')
    : '';

  return (
    <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
      {/* ═══════════ 1. Bio & Story ═══════════ */}
      <div className={CARD}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <div className={CARD_HEADER}>
          <div className={ICON_TILE}>
            <UserCheck className="h-4 w-4" />
          </div>
          <h3 className={CARD_TITLE}>About & story</h3>
        </div>

        {portfolio.bio ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {portfolio.bio}
          </p>
        ) : (
          <p className="text-sm italic text-slate-400 dark:text-slate-500">
            No bio added yet.
          </p>
        )}

        {portfolio.mission_statement && (
          <div className="relative mt-5 overflow-hidden rounded-sm border-l-2 border-blue-500 bg-blue-500/5 px-4 py-3 dark:bg-blue-500/10">
            <Quote className="absolute right-3 top-3 h-6 w-6 text-blue-200/70 dark:text-blue-800/40" />
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">
              Mission statement
            </div>
            <p className="relative z-10 mt-1 text-sm font-medium italic leading-relaxed text-slate-800 dark:text-slate-200">
              "{portfolio.mission_statement}"
            </p>
          </div>
        )}

        {portfolio.business_description && (
          <div className="mt-5 border-t border-slate-200/60 pt-4 dark:border-white/10">
            <div className="mb-1.5 flex items-center gap-1.5">
              <Building2 className="h-3 w-3 text-blue-500" />
              <span className={MINI_LABEL}>About the business</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {portfolio.business_description}
            </p>
          </div>
        )}
      </div>

      {/* ═══════════ 2. Business Details ═══════════ */}
      <div className={CARD}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <div className={CARD_HEADER}>
          <div className={ICON_TILE}>
            <Building2 className="h-4 w-4" />
          </div>
          <h3 className={CARD_TITLE}>Business details</h3>
        </div>

        <div className="divide-y divide-slate-200/60 dark:divide-white/10">
          {portfolio.business_name && (
            <InfoRow
              icon={<Building2 className="h-4 w-4" />}
              label="Business name"
              value={portfolio.business_name}
            />
          )}
          {portfolio.years_experience != null && (
            <InfoRow
              icon={<Briefcase className="h-4 w-4" />}
              label="Experience"
              value={`${portfolio.years_experience} year${
                portfolio.years_experience === 1 ? '' : 's'
              } in industry`}
            />
          )}
          {portfolio.years_in_business != null && (
            <InfoRow
              icon={<Award className="h-4 w-4" />}
              label="Established"
              value={`${portfolio.years_in_business} year${
                portfolio.years_in_business === 1 ? '' : 's'
              } operating`}
            />
          )}
          {portfolio.team_size != null && (
            <InfoRow
              icon={<Users className="h-4 w-4" />}
              label="Team size"
              value={`${portfolio.team_size} ${
                portfolio.team_size === 1 ? 'person' : 'people'
              }`}
            />
          )}
          {locationString && (
            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label="Location"
              value={locationString}
            />
          )}
          {portfolio.service_radius_km != null && (
            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label="Service radius"
              value={`Up to ${portfolio.service_radius_km} km`}
            />
          )}
          {portfolio.license_number && (
            <InfoRow
              icon={<ShieldCheck className="h-4 w-4" />}
              label="License"
              value={
                <span className="inline-flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {portfolio.license_number}
                  </span>
                  {portfolio.license_authority && (
                    <span className="font-normal text-slate-500 dark:text-slate-400">
                      · {portfolio.license_authority}
                    </span>
                  )}
                </span>
              }
            />
          )}
          {portfolio.insurance_provider && (
            <InfoRow
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Insurance"
              value={portfolio.insurance_provider}
            />
          )}
        </div>
      </div>

      {/* ═══════════ 3. Direct Contact ═══════════ */}
      <div className={CARD}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <div className={CARD_HEADER}>
          <div className={ICON_TILE}>
            <Phone className="h-4 w-4" />
          </div>
          <h3 className={CARD_TITLE}>Direct contact</h3>
        </div>

        <div className="divide-y divide-slate-200/60 dark:divide-white/10">
          {portfolio.phone && (
            <InfoRow
              icon={<Phone className="h-4 w-4" />}
              label="Phone number"
              value={
                <a
                  href={`tel:${portfolio.phone}`}
                  className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {portfolio.phone}
                </a>
              }
            />
          )}
          {portfolio.whatsapp && (
            <InfoRow
              icon={<MessageCircle className="h-4 w-4" />}
              label="WhatsApp"
              value={
                <a
                  href={`https://wa.me/${formattedWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {portfolio.whatsapp}
                </a>
              }
            />
          )}
          {portfolio.email && (
            <InfoRow
              icon={<Mail className="h-4 w-4" />}
              label="Email address"
              value={
                <a
                  href={`mailto:${portfolio.email}`}
                  className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {portfolio.email}
                </a>
              }
            />
          )}
          {!portfolio.phone && !portfolio.whatsapp && !portfolio.email && (
            <p className="py-4 text-sm italic text-slate-400 dark:text-slate-500">
              No contact details provided yet.
            </p>
          )}
        </div>
      </div>

      {/* ═══════════ 4. Links & Skills ═══════════ */}
      <div className={CARD}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <div className={CARD_HEADER}>
          <div className={ICON_TILE}>
            <Link2 className="h-4 w-4" />
          </div>
          <h3 className={CARD_TITLE}>Links & skills</h3>
        </div>

        <div className="mb-2.5">
          <span className={MINI_LABEL}>Online profiles</span>
        </div>
        {hasSocial ? (
          <div className="flex flex-wrap gap-2">
            {portfolio.website_url && (
              <a
                href={portfolio.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className={CHIP_LINK}
              >
                <Globe className="h-3.5 w-3.5 text-blue-500" />
                Website
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            )}
            {portfolio.linkedin_url && (
              <a
                href={portfolio.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className={CHIP_LINK}
              >
                <Link2 className="h-3.5 w-3.5 text-blue-500" />
                LinkedIn
              </a>
            )}
            {portfolio.facebook_url && (
              <a
                href={portfolio.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className={CHIP_LINK}
              >
                <Link2 className="h-3.5 w-3.5 text-blue-500" />
                Facebook
              </a>
            )}
            {portfolio.instagram_url && (
              <a
                href={portfolio.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className={CHIP_LINK}
              >
                <Link2 className="h-3.5 w-3.5 text-blue-500" />
                Instagram
              </a>
            )}
            {portfolio.tiktok_url && (
              <a
                href={portfolio.tiktok_url}
                target="_blank"
                rel="noopener noreferrer"
                className={CHIP_LINK}
              >
                <Link2 className="h-3.5 w-3.5 text-blue-500" />
                TikTok
              </a>
            )}
          </div>
        ) : (
          <p className="text-xs italic text-slate-400 dark:text-slate-500">
            No links added.
          </p>
        )}

        {portfolio.languages && portfolio.languages.length > 0 && (
          <div className="mt-5 border-t border-slate-200/60 pt-4 dark:border-white/10">
            <div className="mb-2.5 flex items-center gap-1.5">
              <LanguagesIcon className="h-3.5 w-3.5 text-blue-500" />
              <span className={MINI_LABEL}>Languages</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {portfolio.languages.map((lang, index) => (
                <span key={`${lang}-${index}`} className={CHIP_NEUTRAL}>
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {portfolio.tags && portfolio.tags.length > 0 && (
          <div className="mt-5 border-t border-slate-200/60 pt-4 dark:border-white/10">
            <div className="mb-2.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <span className={MINI_LABEL}>Tags & specialties</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {portfolio.tags.map((tag, index) => (
                <span key={`${tag}-${index}`} className={CHIP_BLUE}>
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}