// src/features/profile/components/ProfileHeader.tsx

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  UserPlus,
  Wrench,
  Share2,
  MoreHorizontal,
  FolderOpen,
  Eye,
  ArrowRight,
  Camera,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import type { UserProfile } from '../types/profile.types';
import { StackedAvatars } from './StackedAvatars';
import { portfolioService } from '../../portfolio/services/portfolioService';
import { MessageUserButton } from '../../messages/components/MessageUserButton';
import VerifiedBadge from '../../subscription/components/VerifiedBadge';
import { subscriptionService } from '../../subscription/services/subscriptionService';
import { readTierBadge } from '../../subscription/tierCache';
import type { TierInfo } from '../../subscription/types/subscription.types';

interface UploadState {
  type: 'profile' | 'banner';
  percent: number;
}

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  followsYou?: boolean;
  canMessage?: boolean;
  canRequestService?: boolean;
  followersCount?: number;
  followersPreview?: UserProfile[];
  uploading?: UploadState | null;
  subscriptionTier?: TierInfo | null;
  verifyHref?: string;
  supportSectionId?: string;
  onFollow?: () => void;
  onMessage?: () => void;
  onRequestService?: () => void;
  onUpgrade?: () => void;
  onEditProfile?: () => void;
  onImageUpload?: (file: File, type: 'profile' | 'banner') => void;
  onShare?: () => void;
}

const portfolioRoute = (userId: string) => `/home/portfolio/${userId}`;
const KYC_REMINDER_INTERVAL_MS = 4 * 60 * 60 * 1000;
const KYC_TOAST_ID = 'kyc-verify-reminder';

function scrollToLandingSection(sectionId: string) {
  const section = document.getElementById(sectionId);
  if (!section) return false;
  const navbarHeight = 80;
  const sectionTop = section.getBoundingClientRect().top + window.scrollY - navbarHeight;
  window.scrollTo({ top: sectionTop, behavior: 'smooth' });
  return true;
}

function normalizeTier(raw: unknown): TierInfo | null {
  if (!raw || typeof raw !== 'object') return null;
  const t = raw as Record<string, any>;
  const id = t.id ?? t.tier_id ?? null;
  const name = typeof t.name === 'string' ? t.name : null;
  const level = typeof t.level === 'number' ? t.level : null;
  if (!id || !name || level === null) return null;
  return {
    id, name, level,
    badge_name: t.badge_name ?? null,
    badge_code: t.badge_code ?? null,
    badge_icon: t.badge_icon ?? null,
    badge_color: t.badge_color ?? null,
    badge_secondary_color: t.badge_secondary_color ?? null,
    badge_shape: t.badge_shape ?? null,
  } as TierInfo;
}

function extractEmbeddedTier(profile: unknown): TierInfo | null {
  if (!profile || typeof profile !== 'object') return null;
  const p = profile as Record<string, any>;
  const candidates: unknown[] = [
    p.tierBadge, p.tier_badge, p.tier,
    p.subscription?.tier, p.subscription?.tierBadge, p.subscription?.tier_badge,
    p.professional?.tierBadge, p.professional?.tier_badge, p.professional?.tier,
    p.professional?.subscription?.tier,
  ];
  for (const c of candidates) {
    const t = normalizeTier(c);
    if (t) return t;
  }
  return null;
}

function collectProfileIds(profile: unknown): string[] {
  const ids: string[] = [];
  if (profile && typeof profile === 'object') {
    const p = profile as Record<string, any>;
    const candidates = [
      p.id, p.userId, p.user_id, p.user?.id,
      p.professional?.user_id, p.professional?.userId, p.professional?.user?.id,
    ];
    for (const c of candidates) {
      if (typeof c === 'string' && c.length > 0) ids.push(c);
    }
  }
  if (typeof window !== 'undefined') {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    if (last && /^[0-9a-f-]{36}$/i.test(last)) ids.push(last);
  }
  return Array.from(new Set(ids));
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isOwnProfile,
  isFollowing = false,
  followsYou = false,
  canMessage = true,
  followersCount: propFollowersCount,
  followersPreview = [],
  uploading = null,
  subscriptionTier: subscriptionTierProp = null,
  verifyHref = '/home/verification',
  supportSectionId = 'contact',
  onFollow,
  onUpgrade,
  onEditProfile,
  onImageUpload,
  onShare,
}) => {
  const navigate = useNavigate();
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const [hasPortfolio, setHasPortfolio] = useState(false);
  const [checkingPortfolio, setCheckingPortfolio] = useState(true);
  const [fetchedTier, setFetchedTier] = useState<TierInfo | null>(null);

  useEffect(() => {
    if (!profile?.id) return;
    if (!profile.professional) return;
    if (subscriptionTierProp) {
      setFetchedTier(subscriptionTierProp);
      return;
    }

    let cancelled = false;

    const loadTier = async () => {
      try {
        const embedded = extractEmbeddedTier(profile);
        if (embedded) {
          if (!cancelled) setFetchedTier(embedded);
          return;
        }

        if (isOwnProfile) {
          try {
            const res = await subscriptionService.getActive();
            const tier = normalizeTier(res?.subscription?.tier ?? null);
            if (!cancelled) setFetchedTier(tier);
          } catch {
            if (!cancelled) setFetchedTier(null);
          }
          return;
        }

        const svc = subscriptionService as unknown as {
          getPublicTier?: (id: string) => Promise<{ tier?: unknown } | unknown | null>;
          getByProfessional?: (id: string) => Promise<{ tier?: unknown } | unknown | null>;
        };

        let raw: any = null;
        try {
          if (typeof svc.getPublicTier === 'function') raw = await svc.getPublicTier(profile.id);
          else if (typeof svc.getByProfessional === 'function') raw = await svc.getByProfessional(profile.id);
        } catch {
          raw = null;
        }

        const tierFromPublic = normalizeTier(
          (raw && (raw.tier ?? raw.subscription?.tier ?? raw)) ?? null
        );
        if (tierFromPublic) {
          if (!cancelled) setFetchedTier(tierFromPublic);
          return;
        }

        const ids = collectProfileIds(profile);
        let tierFromCache: TierInfo | null = null;
        for (const id of ids) {
          const cached = readTierBadge(id);
          const t = normalizeTier(cached);
          if (t) { tierFromCache = t; break; }
        }

        if (!cancelled) setFetchedTier(tierFromCache);
      } catch {
        if (!cancelled) setFetchedTier(null);
      }
    };

    loadTier();
    return () => { cancelled = true; };
  }, [profile, isOwnProfile, subscriptionTierProp]);

  const effectiveTier = subscriptionTierProp ?? fetchedTier;
  const hasActiveSubscription = !!effectiveTier;
  const isKycVerified = !!profile.professional?.isVerified;
  const isProfessional = !!profile.professional;
  const needsKycVerification = isOwnProfile && !!profile.professional && !isKycVerified;

  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;
    setCheckingPortfolio(true);

    const check = async () => {
      try {
        if (isOwnProfile) {
          const mine = await portfolioService.getMine();
          if (!cancelled) setHasPortfolio(!!mine);
        } else {
          await portfolioService.getPublic(profile.id);
          if (!cancelled) setHasPortfolio(true);
        }
      } catch {
        if (!cancelled) setHasPortfolio(false);
      } finally {
        if (!cancelled) setCheckingPortfolio(false);
      }
    };

    check();
    return () => { cancelled = true; };
  }, [profile?.id, isOwnProfile]);

  const goToContactSection = useCallback(() => {
    if (window.location.pathname === '/') {
      scrollToLandingSection(supportSectionId);
      return;
    }
    navigate('/');
    let attempts = 0;
    const tryScroll = () => {
      const ok = scrollToLandingSection(supportSectionId);
      if (!ok && attempts < 20) {
        attempts += 1;
        window.setTimeout(tryScroll, 50);
      }
    };
    window.setTimeout(tryScroll, 100);
  }, [navigate, supportSectionId]);

  useEffect(() => {
    if (!needsKycVerification) return;
    const showReminder = () => {
      toast.info(
        ({ closeToast }: { closeToast?: () => void }) => (
          <div className="text-sm">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  Verify your account
                </p>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                  Complete verification to unlock messaging, job bids, and payouts.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { closeToast?.(); navigate(verifyHref); }}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    Verify now
                  </button>
                  <button
                    type="button"
                    onClick={() => { closeToast?.(); goToContactSection(); }}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <HelpCircle className="h-3 w-3" />
                    Contact support
                  </button>
                </div>
              </div>
            </div>
          </div>
        ),
        {
          toastId: KYC_TOAST_ID,
          autoClose: 12_000,
          closeOnClick: false,
          draggable: false,
          position: 'bottom-right',
        }
      );
    };
    const id = window.setInterval(showReminder, KYC_REMINDER_INTERVAL_MS);
    return () => { window.clearInterval(id); toast.dismiss(KYC_TOAST_ID); };
  }, [needsKycVerification, navigate, verifyHref, goToContactSection]);

  const handleViewPortfolio = useCallback(() => {
    if (!profile?.id) return;
    navigate(portfolioRoute(profile.id));
  }, [profile?.id, navigate]);

  const handleVerifyClick = useCallback(() => { navigate(verifyHref); }, [navigate, verifyHref]);

  const profileData = profile as UserProfile & {
    first_name?: string; last_name?: string;
    profile_image_url?: string; banner_image_url?: string;
    followers_count?: number; account_type?: string;
  };

  const firstName = profileData.firstName ?? profileData.first_name ?? '';
  const lastName = profileData.lastName ?? profileData.last_name ?? '';
  const fullName = `${firstName} ${lastName}`.trim() || 'User';
  const tradeTitle = profile.professional?.profession || '';
  const displayFollowers = propFollowersCount ?? profile.followersCount ?? profileData.followers_count ?? 0;
  const profileImageUrl = profile.profileImageUrl ?? profileData.profile_image_url ?? '';
  const bannerImageUrl = profile.bannerImageUrl ?? profileData.banner_image_url ?? '';
  const accountType = profile.accountType ?? profileData.account_type;
  const isStandardAccount = accountType === 'standard';

  const isUploadingProfile = uploading?.type === 'profile';
  const isUploadingBanner = uploading?.type === 'banner';
  const uploadPercent = uploading?.percent ?? 0;
  const anyUploading = !!uploading;

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'profile' | 'banner',
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select a valid image.'); return; }
    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) { alert(`Image must be smaller than ${MAX_MB} MB.`); return; }
    onImageUpload?.(file, type);
    event.target.value = '';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
      <div className="h-32 sm:h-44 md:h-52 w-full relative bg-slate-800">
        {bannerImageUrl ? (
          <img src={bannerImageUrl} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
            <span className="text-sm">No banner image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

        {isUploadingBanner && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-slate-950/75 backdrop-blur-sm">
            <div className="text-3xl sm:text-4xl font-black tabular-nums text-white tracking-tight">
              {uploadPercent}%
            </div>
            <div className="h-1.5 w-48 max-w-[60%] overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-blue-500 transition-all duration-150 ease-out" style={{ width: `${uploadPercent}%` }} />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white/85">
              <Loader2 className="h-3 w-3 animate-spin" />
              Uploading banner
            </div>
          </div>
        )}

        {isOwnProfile && onImageUpload && !isUploadingBanner && (
          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            disabled={anyUploading}
            className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-md transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <Camera className="h-3.5 w-3.5" />
            Edit Banner
          </button>
        )}

        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={anyUploading}
          onChange={(e) => handleImageChange(e, 'banner')}
        />
      </div>

      <div className="px-4 sm:px-6 pt-3 pb-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="relative shrink-0 group -mt-14 sm:-mt-16 md:-mt-20">
              <img
                src={profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`}
                alt={fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover ring-4 ring-white shadow-xl bg-white dark:ring-slate-900 dark:bg-slate-800"
              />

              {isOwnProfile && onImageUpload && (
                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  disabled={anyUploading}
                  aria-label={isUploadingProfile ? `Uploading ${uploadPercent}%` : 'Change profile picture'}
                  className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-0.5 rounded-full bg-slate-950/65 text-white backdrop-blur-[2px] transition-opacity duration-200 focus-visible:opacity-100 focus-visible:outline-none ${
                    isUploadingProfile
                      ? 'cursor-wait opacity-100'
                      : 'cursor-pointer opacity-0 group-hover:opacity-100'
                  } ${anyUploading && !isUploadingProfile ? 'cursor-not-allowed opacity-0' : ''}`}
                >
                  {isUploadingProfile ? (
                    <>
                      <span className="text-lg font-black tabular-nums leading-none sm:text-xl">
                        {uploadPercent}%
                      </span>
                      <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider opacity-80">Uploading</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                    </>
                  )}
                </button>
              )}

              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={anyUploading}
                onChange={(e) => handleImageChange(e, 'profile')}
              />
            </div>

            <div className="flex-1 min-w-0 space-y-1.5 pt-2 sm:pt-3 md:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-black leading-tight text-slate-900 sm:text-2xl dark:text-slate-100">
                  {fullName}
                  {tradeTitle && `, ${tradeTitle}`}
                </h1>
                {/* Tier badge only, no checkmark. */}
                {hasActiveSubscription && effectiveTier && (
                  <VerifiedBadge tier={effectiveTier} size="sm" />
                )}
                {!isOwnProfile && followsYou && (
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    Follows you
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <StackedAvatars users={followersPreview} maxVisible={3} />
                  <span className="whitespace-nowrap">
                    {displayFollowers} {displayFollowers === 1 ? 'Follower' : 'Followers'}
                  </span>
                </div>

                {profile.professional && (
                  <>
                    <span className="hidden text-slate-300 xs:inline dark:text-slate-600">•</span>
                    <span className="text-slate-600 dark:text-slate-300">
                      {profile.professional.yearsOfExperience || 0} Years in Trade
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-200">
                      <span className="text-amber-500">★</span>
                      {typeof profile.professional.rating === 'number'
                        ? profile.professional.rating.toFixed(1)
                        : '0.0'}
                    </span>
                  </>
                )}
              </div>

              {/* Identity chip — restored. */}
              {isProfessional && (
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {isKycVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/70 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
                      <ShieldCheck className="h-3 w-3" />
                      Identity verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/70 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300">
                      <ShieldAlert className="h-3 w-3" />
                      Unverified identity
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 pt-2 md:pt-3">
            {!isOwnProfile && hasPortfolio && !checkingPortfolio && (
              <button
                onClick={handleViewPortfolio}
                aria-label={`View ${fullName}'s portfolio`}
                className="group relative flex items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]"
              >
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.25),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <FolderOpen className="relative h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                <span className="relative">View Portfolio</span>
                <ArrowRight className="relative -mr-0.5 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            {isOwnProfile && hasPortfolio && !checkingPortfolio && (
              <button
                onClick={handleViewPortfolio}
                aria-label="Preview your portfolio"
                className="group flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 transition-all hover:border-blue-300 hover:bg-slate-50 hover:text-blue-600 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-blue-800 dark:hover:bg-slate-700 dark:hover:text-blue-400"
              >
                <Eye className="h-3.5 w-3.5 text-slate-500 transition-colors group-hover:text-blue-500 dark:text-slate-400 dark:group-hover:text-blue-400" />
                <span>Preview Portfolio</span>
              </button>
            )}

            {needsKycVerification && (
              <button
                onClick={handleVerifyClick}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs shadow-blue-600/25 transition hover:bg-blue-700 active:scale-[0.98]"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verify identity</span>
              </button>
            )}

            {isOwnProfile && isStandardAccount && (
              <button
                onClick={onUpgrade}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs shadow-blue-600/25 transition hover:bg-blue-700"
              >
                <Wrench className="h-3.5 w-3.5" />
                <span>Become a Professional</span>
              </button>
            )}

            {isOwnProfile && (
              <button
                onClick={onEditProfile}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Edit Profile
              </button>
            )}

            {!isOwnProfile && (
              <>
                <button
                  onClick={onFollow}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    isFollowing
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </button>

                <MessageUserButton
                  userId={profile.id}
                  disabled={!canMessage}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                />
              </>
            )}

            <button
              onClick={onShare}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>

            <button
              className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;