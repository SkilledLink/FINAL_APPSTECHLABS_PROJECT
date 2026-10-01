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
  X,
} from 'lucide-react';
import type { UserProfile } from '../types/profile.types';
import { StackedAvatars } from './StackedAvatars';
import { portfolioService } from '../../portfolio/services/portfolioService';
import { MessageUserButton } from '../../messages/components/MessageUserButton';
import VerifiedBadge from '../../subscription/components/VerifiedBadge';
import { subscriptionService } from '../../subscription/services/subscriptionService';
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
  /** Optional override — if provided, this tier is used verbatim. */
  subscriptionTier?: TierInfo | null;
  /**
   * Where the "Verify now" CTA navigates to.
   * Defaults to `/home/verification`.
   */
  verifyHref?: string;
  /**
   * Where the "Contact support" link navigates to.
   * Defaults to `/home/support`.
   */
  supportHref?: string;
  onFollow?: () => void;
  onMessage?: () => void;
  onRequestService?: () => void;
  onUpgrade?: () => void;
  onEditProfile?: () => void;
  onImageUpload?: (file: File, type: 'profile' | 'banner') => void;
  onShare?: () => void;
}

const portfolioRoute = (userId: string) => `/home/portfolio/${userId}`;

const KYC_REMINDER_INTERVAL_MS = 30_000;
const KYC_TOAST_ID = 'kyc-verify-reminder';

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
  supportHref = '/home/support',
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

  // Local dismissal of the inline banner — user can hide it for this
  // session but the toast reminders keep firing every 30s anyway.
  const [bannerDismissed, setBannerDismissed] = useState(false);

  /* ── Active subscription tier ────────────────────────── */
  const [fetchedTier, setFetchedTier] = useState<TierInfo | null>(null);

  useEffect(() => {
    if (subscriptionTierProp !== undefined && subscriptionTierProp !== null) {
      setFetchedTier(subscriptionTierProp);
      return;
    }
    if (!profile?.id) return;
    if (!profile.professional) return;

    let cancelled = false;

    const loadTier = async () => {
      try {
        if (isOwnProfile) {
          const res = await subscriptionService.getActive();
          const tier = res?.subscription?.tier ?? null;
          if (!cancelled) setFetchedTier(tier);
        } else {
          // The subscription service only exposes the active tier to the
          // current user; public profiles rely on the optional prop override.
          if (!cancelled) setFetchedTier(null);
        }
      } catch {
        if (!cancelled) setFetchedTier(null);
      }
    };

    loadTier();
    return () => {
      cancelled = true;
    };
  }, [profile?.id, profile?.professional, isOwnProfile, subscriptionTierProp]);

  const effectiveTier = subscriptionTierProp ?? fetchedTier;

  /* ── Two independent indicators ──────────────────────────── */
  const isKycVerified = !!profile.professional?.isVerified;
  const hasActiveSubscription = !!effectiveTier;

  /**
   * Show the KYC nudge only when all of these are true:
   *   - Viewing your own profile
   *   - You actually have a professional profile
   *   - You have NOT yet been verified
   */
  const needsKycVerification =
    isOwnProfile && !!profile.professional && !isKycVerified;

  /* ── Portfolio existence check ────────────────────────── */
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
    return () => {
      cancelled = true;
    };
  }, [profile?.id, isOwnProfile]);

  /* ── KYC toast reminder — fires every 30 seconds ──────── */
  useEffect(() => {
    if (!needsKycVerification) return;

    const showReminder = () => {
      // Fixed toastId → the newest reminder replaces the previous one
      // instead of stacking 20 toasts on the screen.
      toast.warning(
        ({ closeToast }: { closeToast?: () => void }) => (
          <div className="text-sm">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  Your profile isn’t verified yet
                </p>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                  Verify your identity to unlock messaging, job bids, and payouts.
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      closeToast?.();
                      navigate(verifyHref);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm transition hover:bg-amber-600"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    Verify now
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeToast?.();
                      navigate(supportHref);
                    }}
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

    // First reminder after the interval, then every interval after that.
    const id = window.setInterval(showReminder, KYC_REMINDER_INTERVAL_MS);

    return () => {
      window.clearInterval(id);
      // Kill any lingering reminder when we leave the page or the user
      // gets verified while we were mounted.
      toast.dismiss(KYC_TOAST_ID);
    };
  }, [needsKycVerification, navigate, verifyHref, supportHref]);

  /* ── Portfolio / nav helpers ──────────────────────────── */
  const handleViewPortfolio = useCallback(() => {
    if (!profile?.id) return;
    navigate(portfolioRoute(profile.id));
  }, [profile?.id, navigate]);

  const handleVerifyClick = useCallback(() => {
    navigate(verifyHref);
  }, [navigate, verifyHref]);

  const handleSupportClick = useCallback(() => {
    navigate(supportHref);
  }, [navigate, supportHref]);

  const profileData = profile as UserProfile & {
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
    banner_image_url?: string;
    followers_count?: number;
    account_type?: string;
  };

  const firstName = profileData.firstName ?? profileData.first_name ?? '';
  const lastName = profileData.lastName ?? profileData.last_name ?? '';
  const fullName = `${firstName} ${lastName}`.trim() || 'User';
  const tradeTitle = profile.professional?.profession || '';

  const displayFollowers =
    propFollowersCount ??
    profile.followersCount ??
    profileData.followers_count ??
    0;

  const profileImageUrl =
    profile.profileImageUrl ?? profileData.profile_image_url ?? '';
  const bannerImageUrl =
    profile.bannerImageUrl ?? profileData.banner_image_url ?? '';
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

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image.');
      return;
    }

    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`Image must be smaller than ${MAX_MB} MB.`);
      return;
    }

    onImageUpload?.(file, type);
    event.target.value = '';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
      {/* ── Banner ────────────────────────────────────── */}
      <div className="h-32 sm:h-44 md:h-52 w-full relative bg-slate-800">
        {bannerImageUrl ? (
          <img
            src={bannerImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
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
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-150 ease-out"
                style={{ width: `${uploadPercent}%` }}
              />
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

      {/* ── KYC nudge banner (own profile · unverified professional) ── */}
      {needsKycVerification && !bannerDismissed && (
        <div className="relative border-b border-amber-200/80 bg-gradient-to-r from-amber-50 via-amber-50/70 to-white dark:border-amber-900/50 dark:from-amber-950/40 dark:via-amber-950/20 dark:to-slate-900">
          <div className="flex flex-wrap items-start gap-3 px-4 py-3 sm:px-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Your profile isn’t verified yet
              </p>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                Verify your identity to unlock messaging, job bids, and
                payouts. It only takes a few minutes.
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleVerifyClick}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-amber-600 active:scale-[0.98]"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verify now
                </button>

                <button
                  type="button"
                  onClick={handleSupportClick}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  Contact support
                </button>
              </div>

              <p className="mt-2 text-[11px] italic text-slate-500 dark:text-slate-500">
                Having issues verifying? Contact support and we’ll help you
                sort it out.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              aria-label="Dismiss verification reminder"
              className="ml-auto shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Body ──────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pt-3 pb-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="relative shrink-0 group -mt-14 sm:-mt-16 md:-mt-20">
              <img
                src={
                  profileImageUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    fullName,
                  )}&background=random`
                }
                alt={fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover ring-4 ring-white shadow-xl bg-white dark:ring-slate-900 dark:bg-slate-800"
              />

              {isOwnProfile && onImageUpload && (
                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  disabled={anyUploading}
                  aria-label={
                    isUploadingProfile
                      ? `Uploading ${uploadPercent}%`
                      : 'Change profile picture'
                  }
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
                      <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider opacity-80">
                        Uploading
                      </span>
                    </>
                  ) : (
                    <>
                      <Camera
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        strokeWidth={2.25}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Change
                      </span>
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
              {/* ── Title row: name + tier badge + "follows you" ─── */}
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="text-lg font-black leading-tight text-slate-900 sm:text-2xl dark:text-slate-100">
                  {fullName}
                  {tradeTitle && `, ${tradeTitle}`}
                </h1>

                {/* Subscription tier badge — stays next to the name */}
                {hasActiveSubscription && effectiveTier && (
                  <VerifiedBadge tier={effectiveTier} size="sm" />
                )}

                {!isOwnProfile && followsYou && (
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    Follows you
                  </span>
                )}
              </div>

              {/* ── Stats row: followers · years · rating · VERIFIED ─── */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <StackedAvatars users={followersPreview} maxVisible={3} />
                  <span className="whitespace-nowrap">
                    {displayFollowers}{' '}
                    {displayFollowers === 1 ? 'Follower' : 'Followers'}
                  </span>
                </div>

                {profile.professional && (
                  <>
                    <span className="hidden text-slate-300 xs:inline dark:text-slate-700">
                      •
                    </span>
                    <span>
                      {profile.professional.yearsOfExperience || 0} Years in Trade
                    </span>

                    <span className="text-slate-300 dark:text-slate-700">•</span>

                    <span className="inline-flex items-center gap-1">
                      ⭐{' '}
                      {typeof profile.professional.rating === 'number'
                        ? profile.professional.rating.toFixed(1)
                        : '0.0'}
                    </span>

                    {/* ✅ KYC-Verified pill — sits right after the rating */}
                    {isKycVerified && (
                      <span
                        title="Identity verified by Didit"
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-950/60 dark:text-emerald-300"
                      >
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </span>
                    )}

                    {/* ⚠️ Unverified indicator — only on your own profile */}
                    {needsKycVerification && (
                      <button
                        type="button"
                        onClick={handleVerifyClick}
                        title="Your profile isn’t verified — click to start"
                        className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 transition hover:bg-amber-100 dark:border-amber-800/70 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-950/80"
                      >
                        <ShieldAlert className="h-3 w-3" />
                        Not verified · Verify
                      </button>
                    )}
                  </>
                )}
              </div>
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

            {/* Primary verify CTA when the user still needs to do KYC */}
            {needsKycVerification && (
              <button
                onClick={handleVerifyClick}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-amber-600 active:scale-[0.98]"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verify identity</span>
              </button>
            )}

            {isOwnProfile && isStandardAccount && (
              <button
                onClick={onUpgrade}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-amber-600"
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
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200'
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