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
  portfolio: Portfolio;
}

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
    <div className="group flex items-center gap-3.5 py-3.5 transition-colors">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-200 dark:group-hover:border-blue-800/60 transition-colors">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </div>
        <div className="mt-0.5 break-words text-sm font-semibold text-slate-800 dark:text-slate-200">
          {value}
        </div>
      </div>
    </div>
  );
}

export default function PortfolioAboutTab({ portfolio }: PortfolioAboutTabProps) {
  const hasSocial =
    portfolio.website_url ||
    portfolio.linkedin_url ||
    portfolio.facebook_url ||
    portfolio.instagram_url ||
    portfolio.tiktok_url;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* 1. Bio & Story */}
      <div className="flex flex-col justify-between rounded-3xl border border-slate-200/70 bg-white/70 dark:border-slate-800/70 dark:bg-slate-900/70 p-6 sm:p-7 shadow-xs backdrop-blur-md transition-all">
        <div>
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              <UserCheck className="h-4 w-4" />
            </div>
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
              About & Story
            </h3>
          </div>

          {portfolio.bio ? (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-normal">
              {portfolio.bio}
            </p>
          ) : (
            <p className="mt-4 text-sm italic text-slate-400 dark:text-slate-500">
              No bio added yet.
            </p>
          )}

          {portfolio.mission_statement && (
            <div className="relative mt-6 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/30 p-4 sm:p-5 backdrop-blur-sm">
              <Quote className="absolute right-3 top-3 h-7 w-7 text-blue-200/80 dark:text-blue-800/40" />
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Mission Statement
              </div>
              <p className="relative z-10 mt-1 text-sm italic font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                "{portfolio.mission_statement}"
              </p>
            </div>
          )}

          {portfolio.business_description && (
            <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                About the Business
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {portfolio.business_description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Business Details */}
      <div className="rounded-3xl border border-slate-200/70 bg-white/70 dark:border-slate-800/70 dark:bg-slate-900/70 p-6 sm:p-7 shadow-xs backdrop-blur-md transition-all">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
            <Building2 className="h-4 w-4" />
          </div>
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
            Business Details
          </h3>
        </div>

        <div className="mt-1 divide-y divide-slate-100 dark:divide-slate-800">
          {portfolio.business_name && (
            <InfoRow
              icon={<Building2 className="h-4 w-4" />}
              label="Business Name"
              value={portfolio.business_name}
            />
          )}
          {portfolio.years_experience != null && (
            <InfoRow
              icon={<Briefcase className="h-4 w-4" />}
              label="Experience"
              value={`${portfolio.years_experience} year${portfolio.years_experience === 1 ? '' : 's'} in industry`}
            />
          )}
          {portfolio.years_in_business != null && (
            <InfoRow
              icon={<Award className="h-4 w-4" />}
              label="Established"
              value={`${portfolio.years_in_business} year${portfolio.years_in_business === 1 ? '' : 's'} operating`}
            />
          )}
          {portfolio.team_size != null && (
            <InfoRow
              icon={<Users className="h-4 w-4" />}
              label="Team Size"
              value={`${portfolio.team_size} ${portfolio.team_size === 1 ? 'person' : 'people'}`}
            />
          )}
          {(portfolio.city || portfolio.region || portfolio.country) && (
            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label="Location"
              value={[portfolio.city, portfolio.region, portfolio.country]
                .filter(Boolean)
                .join(', ')}
            />
          )}
          {portfolio.service_radius_km != null && (
            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label="Service Radius"
              value={`Up to ${portfolio.service_radius_km} km`}
            />
          )}
          {portfolio.license_number && (
            <InfoRow
              icon={<ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
              label="License"
              value={
                <span className="inline-flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {portfolio.license_number}
                  </span>
                  {portfolio.license_authority && (
                    <span className="text-slate-500 dark:text-slate-400 font-normal">
                      · {portfolio.license_authority}
                    </span>
                  )}
                </span>
              }
            />
          )}
          {portfolio.insurance_provider && (
            <InfoRow
              icon={<ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
              label="Insurance"
              value={portfolio.insurance_provider}
            />
          )}
        </div>
      </div>

      {/* 3. Direct Contact */}
      <div className="rounded-3xl border border-slate-200/70 bg-white/70 dark:border-slate-800/70 dark:bg-slate-900/70 p-6 sm:p-7 shadow-xs backdrop-blur-md transition-all">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
            <Phone className="h-4 w-4" />
          </div>
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
            Direct Contact
          </h3>
        </div>

        <div className="mt-1 divide-y divide-slate-100 dark:divide-slate-800">
          {portfolio.phone && (
            <InfoRow
              icon={<Phone className="h-4 w-4" />}
              label="Phone Number"
              value={
                <a
                  href={`tel:${portfolio.phone}`}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
                >
                  {portfolio.phone}
                </a>
              }
            />
          )}
          {portfolio.whatsapp && (
            <InfoRow
              icon={<MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
              label="WhatsApp"
              value={
                <a
                  href={`https://wa.me/${portfolio.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-colors"
                >
                  {portfolio.whatsapp}
                </a>
              }
            />
          )}
          {portfolio.email && (
            <InfoRow
              icon={<Mail className="h-4 w-4" />}
              label="Email Address"
              value={
                <a
                  href={`mailto:${portfolio.email}`}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
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

      {/* 4. Links & More */}
      <div className="flex flex-col justify-between rounded-3xl border border-slate-200/70 bg-white/70 dark:border-slate-800/70 dark:bg-slate-900/70 p-6 sm:p-7 shadow-xs backdrop-blur-md transition-all">
        <div>
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/50">
              <Link2 className="h-4 w-4" />
            </div>
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
              Links & Skills
            </h3>
          </div>

          {/* Social Profiles */}
          <div className="mt-4">
            <div className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Online Profiles
            </div>
            {hasSocial ? (
              <div className="flex flex-wrap gap-2">
                {portfolio.website_url && (
                  <a
                    href={portfolio.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-800/60 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800/60 transition-colors"
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
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-800/60 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-200 dark:hover:border-sky-800/60 transition-colors"
                  >
                    <Link2 className="h-3.5 w-3.5 text-sky-500" />
                    LinkedIn
                  </a>
                )}
                {portfolio.facebook_url && (
                  <a
                    href={portfolio.facebook_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-800/60 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800/60 transition-colors"
                  >
                    <Link2 className="h-3.5 w-3.5 text-blue-600" />
                    Facebook
                  </a>
                )}
                {portfolio.instagram_url && (
                  <a
                    href={portfolio.instagram_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-800/60 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:text-pink-600 dark:hover:text-pink-400 hover:border-pink-200 dark:hover:border-pink-800/60 transition-colors"
                  >
                    <Link2 className="h-3.5 w-3.5 text-pink-500" />
                    Instagram
                  </a>
                )}
                {portfolio.tiktok_url && (
                  <a
                    href={portfolio.tiktok_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-800/60 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    TikTok
                  </a>
                )}
              </div>
            ) : (
              <p className="text-xs italic text-slate-400 dark:text-slate-500">
                No links added.
              </p>
            )}
          </div>

          {/* Spoken Languages */}
          {portfolio.languages && portfolio.languages.length > 0 && (
            <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <LanguagesIcon className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                Languages
              </div>
              <div className="flex flex-wrap gap-1.5">
                {portfolio.languages.map((l) => (
                  <span
                    key={l}
                    className="rounded-lg border border-slate-200/60 dark:border-slate-700/60 bg-slate-100/60 dark:bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags / Specialties */}
          {portfolio.tags && portfolio.tags.length > 0 && (
            <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <Sparkles className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                Tags & Specialties
              </div>
              <div className="flex flex-wrap gap-1.5">
                {portfolio.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-lg border border-blue-200/60 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/40 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300"
                  >
                    <Tag className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}