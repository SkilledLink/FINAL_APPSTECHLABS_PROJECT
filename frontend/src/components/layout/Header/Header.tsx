// src/components/layout/Header/Header.tsx

import React, { useState } from 'react';
import {
  Search,
  X,
  MapPin,
  Star,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ProfileLink } from '../../../features/profile/components/ProfileLink';
import { NotificationBell } from '../../../features/notifications';
import VerifiedBadge from '../../../features/subscription/components/VerifiedBadge';
import type { TierInfo } from '../../../features/subscription/types/subscription.types';
import { cacheTierBadge } from '../../../features/subscription/tierCache';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
}

interface TierBadgePayload {
  tier_id: string;
  level: number;
  name: string;
  badge_name?: string | null;
  badge_code?: string | null;
  badge_icon?: string | null;
  badge_color?: string | null;
  badge_secondary_color?: string | null;
  badge_shape?: string | null;
}

interface SearchResult {
  id: string;
  user_id: string;
  profession: string;
  bio?: string | null;
  skills?: string[] | null;
  years_of_experience?: number | null;
  services?: string[] | null;
  hourly_rate?: number | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  available: boolean;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  completed_jobs: number;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  profile_image_url?: string | null;
  relevance_score: number;
  tier_badge?: TierBadgePayload | null;
}

function pluralizeProfession(word: string): string {
  const w = word.trim();
  if (!w) return 'professionals';
  const lower = w.toLowerCase();
  if (lower.endsWith('man')) return `${w.slice(0, -3)}men`;
  if (lower.endsWith('y')) return `${w.slice(0, -1)}ies`;
  if (
    lower.endsWith('s') ||
    lower.endsWith('x') ||
    lower.endsWith('ch') ||
    lower.endsWith('sh')
  ) {
    return `${w}es`;
  }
  return `${w}s`;
}

function tierBadgeToTierInfo(tb: TierBadgePayload): TierInfo {
  return {
    id: tb.tier_id,
    name: tb.name,
    level: tb.level,
    badge_name: tb.badge_name ?? null,
    badge_code: tb.badge_code ?? null,
    badge_icon: tb.badge_icon ?? null,
    badge_color: tb.badge_color ?? null,
    badge_secondary_color: tb.badge_secondary_color ?? null,
    badge_shape: tb.badge_shape ?? null,
  } as TierInfo;
}

export default function Header({ isDark, toggleTheme }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [resolvedProfession, setResolvedProfession] = useState<string | null>(null);
  const [submittedQuery, setSubmittedQuery] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);
    setResolvedProfession(null);
    setSubmittedQuery(query);

    try {
      const params = new URLSearchParams({ q: query, limit: '20' });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/search/professionals?${params.toString()}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || `Search failed with status ${response.status}`
        );
      }

      const resolved = response.headers.get('X-Resolved-Profession');
      setResolvedProfession(resolved && resolved.trim() ? resolved : null);

      const data: SearchResult[] = await response.json();
      setSearchResults(data);

      data.forEach((r) => {
        if (r.tier_badge) {
          cacheTierBadge(r.user_id, r.tier_badge);
          cacheTierBadge(r.id, r.tier_badge);
        }
      });
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(
        error instanceof Error
          ? error.message
          : 'Something went wrong while searching.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchResults([]);
    setSearchError('');
    setSearchQuery('');
    setResolvedProfession(null);
    setSubmittedQuery('');
  };

  const handleResultNavigate = () => {
    closeSearch();
  };

  const emptyStateTitle = resolvedProfession
    ? `No ${pluralizeProfession(resolvedProfession).toLowerCase()} available right now`
    : 'No professionals found';

  const emptyStateBody = resolvedProfession
    ? `We don't have any ${pluralizeProfession(
        resolvedProfession
      ).toLowerCase()} on SkilledLink at the moment. Check back soon, or try a different trade.`
    : `We couldn't find anyone matching "${submittedQuery}". Try another profession, skill, service, or location.`;

  return (
    <>
      <header className="h-24 w-full bg-white/60 dark:bg-[#070b14]/60 backdrop-blur-xl border-b border-blue-300/30 dark:border-blue-400/20 flex items-center justify-between px-6 sm:px-8 z-30 shadow-sm transition-colors duration-300 shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <svg
            className="w-full h-full opacity-40 dark:opacity-45"
            viewBox="0 0 1200 96"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter
                id="light-blue-glow-header"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <linearGradient id="thunder-blue-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#93c5fd" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            <motion.path
              d="M -50 18 L 120 54 L 180 30 L 290 72 L 350 42 L 480 78 L 560 24 L 710 66 L 830 30 L 940 72 L 1050 36 L 1250 60"
              stroke="url(#thunder-blue-grad-1)"
              strokeWidth="1.1"
              strokeLinecap="round"
              filter="url(#light-blue-glow-header)"
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.7, 0.3, 0.8, 0.4],
                strokeWidth: [0.9, 1.2, 0.9, 1.3, 1],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />

            <motion.path
              d="M 180 30 L 220 6 L 270 22 M 480 78 L 510 102 M 710 66 L 750 90 L 790 78 M 940 72 L 980 94"
              stroke="#93c5fd"
              strokeWidth="0.75"
              strokeLinecap="round"
              opacity="0.5"
              filter="url(#light-blue-glow-header)"
              initial={{ opacity: 0.15 }}
              animate={{ opacity: [0.15, 0.6, 0.2, 0.65, 0.15] }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                repeatType: 'mirror',
                delay: 0.5,
              }}
            />
          </svg>

          <div className="absolute -top-10 left-1/3 w-72 h-24 bg-blue-300/20 dark:bg-blue-500/15 rounded-full blur-3xl" />
        </div>

        <div className="flex items-center gap-6 flex-1 z-10 relative">
          <Link
            to="/"
            className="group flex items-center shrink-0 select-none outline-none"
            aria-label="SkilledLink home"
          >
            <div className="text-3xl font-bold tracking-tight transition-all duration-500 group-hover:scale-[1.03]">
              <span className="text-slate-900 dark:text-white">Skilled</span>
              <span className="text-blue-500">Link</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 z-10 relative shrink-0">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-blue-50/60 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all relative border border-transparent hover:border-blue-200/50 dark:hover:border-slate-700/50"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          <NotificationBell />
        </div>
      </header>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] w-screen h-screen bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-2xl overflow-y-auto"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeSearch();
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.25 }}
              className="min-h-full flex justify-center pointer-events-none"
            >
              <div
                className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-12 pointer-events-auto"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-1">
                      SkilledLink
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                      Find a professional
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Search by profession, skill, service, or location.
                    </p>
                  </div>
                  <button
                    onClick={closeSearch}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-blue-300 dark:hover:border-blue-600 transition-all shadow-sm"
                    aria-label="Close search"
                  >
                    <X size={21} />
                  </button>
                </div>

                <form onSubmit={handleSearch} className="relative">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Search size={21} className="text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search professionals, jobs, services..."
                    className="w-full h-16 pl-14 pr-16 text-base sm:text-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-300/30 focus:border-blue-400 dark:focus:border-blue-400 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Search"
                  >
                    <Search size={19} />
                  </button>
                </form>

                <AnimatePresence>
                  {resolvedProfession && !isSearching && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
                    >
                      <span className="font-medium">Showing only</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/60 dark:border-blue-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {resolvedProfession}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isSearching && (
                  <div className="mt-10 flex flex-col items-center justify-center py-12">
                    <div className="w-9 h-9 border-2 border-blue-100 dark:border-blue-900 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin mb-4" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      Finding professionals...
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Searching across SkilledLink
                    </p>
                  </div>
                )}

                {searchError && !isSearching && (
                  <div className="mt-8 p-5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                        <X size={17} className="text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-red-700 dark:text-red-400">
                          Search failed
                        </p>
                        <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
                          {searchError}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!isSearching && searchResults.length > 0 && (
                  <div className="mt-10">
                    <div className="flex items-end justify-between mb-4 px-1">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          Professionals
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          People matching your search
                        </p>
                      </div>
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        {searchResults.length} result
                        {searchResults.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {searchResults.map((professional, index) => {
                        const hasTier = !!professional.tier_badge;
                        const isKycVerified = professional.is_verified;

                        return (
                          <motion.div
                            key={professional.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.2,
                              delay: Math.min(index * 0.035, 0.25),
                            }}
                          >
                            <div onMouseDown={closeSearch}>
                              <ProfileLink
                                userId={professional.user_id}
                                onAfterNavigate={handleResultNavigate}
                                className="group block w-full text-left no-underline"
                                ariaLabel={`View profile of ${professional.first_name} ${professional.last_name}`}
                              >
                                <div className="relative p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200">
                                  <div className="flex items-start gap-4">
                                    <div className="relative shrink-0">
                                      {professional.profile_image_url ? (
                                        <img
                                          src={professional.profile_image_url}
                                          alt={`${professional.first_name} ${professional.last_name}`}
                                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                                        />
                                      ) : (
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                                          {professional.first_name?.[0]?.toUpperCase()}
                                          {professional.last_name?.[0]?.toUpperCase()}
                                        </div>
                                      )}
                                      <span
                                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                                          professional.available ? 'bg-green-500' : 'bg-slate-400'
                                        }`}
                                      />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      {/* Name + tier badge. NO checkmark. */}
                                      <div className="flex flex-wrap items-center gap-2 pr-8">
                                        <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                          {professional.first_name} {professional.last_name}
                                        </h4>
                                        {hasTier && professional.tier_badge && (
                                          <VerifiedBadge
                                            tier={tierBadgeToTierInfo(professional.tier_badge)}
                                            size="sm"
                                          />
                                        )}
                                      </div>

                                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                                        {professional.profession}
                                      </p>

                                      {/* Identity chip — verified OR unverified. */}
                                      <div className="mt-2">
                                        {isKycVerified ? (
                                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-900/60 text-[10.5px] font-bold uppercase tracking-wide">
                                            <ShieldCheck size={11} />
                                            Identity verified
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-900/60 text-[10.5px] font-bold uppercase tracking-wide">
                                            <ShieldAlert size={11} />
                                            Unverified identity
                                          </span>
                                        )}
                                      </div>

                                      {(professional.city ||
                                        professional.region ||
                                        professional.country) && (
                                        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                          <MapPin size={13} className="shrink-0" />
                                          <span className="truncate">
                                            {[professional.city, professional.region, professional.country]
                                              .filter(Boolean)
                                              .join(', ')}
                                          </span>
                                        </div>
                                      )}

                                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1">
                                          <Star size={13} className="fill-current text-yellow-500" />
                                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                                            {professional.rating.toFixed(1)}
                                          </span>
                                          <span>({professional.total_reviews})</span>
                                        </span>
                                        {professional.years_of_experience !== null &&
                                          professional.years_of_experience !== undefined && (
                                            <span>
                                              {professional.years_of_experience} yr
                                              {professional.years_of_experience !== 1 ? 's' : ''}{' '}
                                              experience
                                            </span>
                                          )}
                                        {professional.hourly_rate !== null &&
                                          professional.hourly_rate !== undefined && (
                                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                              {professional.hourly_rate} / hour
                                            </span>
                                          )}
                                      </div>

                                      {professional.skills && professional.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                          {professional.skills.slice(0, 4).map((skill) => (
                                            <span
                                              key={skill}
                                              className="px-2.5 py-1 text-[11px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg"
                                            >
                                              {skill}
                                            </span>
                                          ))}
                                          {professional.skills.length > 4 && (
                                            <span className="px-2 py-1 text-[11px] text-slate-400 dark:text-slate-500">
                                              +{professional.skills.length - 4}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    <div className="hidden sm:flex shrink-0 w-9 h-9 rounded-xl items-center justify-center text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all">
                                      <ArrowUpRight size={18} />
                                    </div>
                                  </div>

                                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <span
                                      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                                        professional.available
                                          ? 'text-green-600 dark:text-green-400'
                                          : 'text-slate-400 dark:text-slate-500'
                                      }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          professional.available ? 'bg-green-500' : 'bg-slate-400'
                                        }`}
                                      />
                                      {professional.available
                                        ? 'Available for work'
                                        : 'Currently unavailable'}
                                    </span>
                                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                                      View profile
                                    </span>
                                  </div>
                                </div>
                              </ProfileLink>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!isSearching &&
                  !searchError &&
                  submittedQuery.trim() &&
                  searchResults.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-10 py-16 px-6 text-center bg-white/60 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl"
                    >
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                        <Search size={25} className="text-blue-500 dark:text-blue-400" />
                      </div>
                      <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                        {emptyStateTitle}
                      </p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-md mx-auto">
                        {emptyStateBody}
                      </p>
                      {resolvedProfession && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setSearchResults([]);
                            setResolvedProfession(null);
                            setSubmittedQuery('');
                          }}
                          className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all"
                        >
                          <Search size={15} />
                          Try a different search
                        </button>
                      )}
                    </motion.div>
                  )}

                {!submittedQuery.trim() &&
                  searchResults.length === 0 &&
                  !isSearching && (
                    <div className="mt-10">
                      <div className="mb-4">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          Try a search
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          Popular professional searches
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['Electrician', 'Plumber', 'Carpenter', 'Welder', 'Mechanic', 'Mason'].map(
                          (term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => setSearchQuery(term)}
                              className="px-4 py-2.5 text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all"
                            >
                              {term}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}