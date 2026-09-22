// src/features/profile/components/ProfileHeader.tsx

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  UserPlus,
  Wrench,
  Share2,
  MoreHorizontal,
  FolderOpen,
  Eye,
  ArrowRight,
} from 'lucide-react';
import type { UserProfile } from '../types/profile.types';
import { StackedAvatars } from './StackedAvatars';
import { portfolioService } from '../../portfolio/services/portfolioService';
import { MessageUserButton } from '../../messages/components/MessageUserButton';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  followsYou?: boolean;
  canMessage?: boolean;
  canRequestService?: boolean;
  followersCount?: number;
  followersPreview?: UserProfile[];
  onFollow?: () => void;
  onMessage?: () => void; // kept for backwards compat; no longer used by this component
  onRequestService?: () => void;
  onUpgrade?: () => void;
  onEditProfile?: () => void;
  onImageUpload?: (file: File, type: 'profile' | 'banner') => void;
  onShare?: () => void;
}

/* ────────────────────────────────────────────────────────────
 * Portfolio route
 *   /home/portfolio/:userId
 * ──────────────────────────────────────────────────────────── */
const portfolioRoute = (userId: string) => `/home/portfolio/${userId}`;

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isOwnProfile,
  isFollowing = false,
  followsYou = false,
  canMessage = true,
  followersCount: propFollowersCount,
  followersPreview = [],
  onFollow,
  onUpgrade,
  onEditProfile,
  onImageUpload,
  onShare,
}) => {
  const navigate = useNavigate();
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  /* ── Portfolio existence check ────────────────────────── */
  const [hasPortfolio, setHasPortfolio] = useState(false);
  const [checkingPortfolio, setCheckingPortfolio] = useState(true);

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

  const handleViewPortfolio = useCallback(() => {
    if (!profile?.id) return;
    navigate(portfolioRoute(profile.id));
  }, [profile?.id, navigate]);

  /* ── Existing profile normalisation ────────────────────── */
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

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'profile' | 'banner'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image.');
      return;
    }
    onImageUpload?.(file, type);
    event.target.value = '';
  };

  /* ── Render ────────────────────────────────────────────── */
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

        {isOwnProfile && onImageUpload && (
          <button
            onClick={() => bannerInputRef.current?.click()}
            className="absolute bottom-3 right-3 z-20 px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 rounded-lg shadow-md text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white transition"
          >
            Edit Banner
          </button>
        )}

        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageChange(e, 'banner')}
        />
      </div>

      {/* ── Body ──────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pt-3 pb-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* Left group: avatar + name */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="relative shrink-0 group -mt-14 sm:-mt-16 md:-mt-20">
              <img
                src={
                  profileImageUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    fullName
                  )}&background=random`
                }
                alt={fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl bg-white dark:bg-slate-800"
              />

              {profile.professional?.isVerified && (
                <span className="absolute bottom-1 right-1 bg-blue-600 text-white p-1 rounded-full ring-2 ring-white dark:ring-slate-900">
                  <BadgeCheck className="w-3.5 h-3.5" />
                </span>
              )}

              {isOwnProfile && onImageUpload && (
                <button
                  onClick={() => profileInputRef.current?.click()}
                  className="absolute bottom-0 left-0 right-0 mx-auto w-full text-center bg-black/50 text-white text-[10px] font-bold py-1 rounded-b-full opacity-0 group-hover:opacity-100 transition"
                >
                  Change
                </button>
              )}

              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageChange(e, 'profile')}
              />
            </div>

            <div className="flex-1 min-w-0 pt-2 sm:pt-3 md:pt-0 space-y-1.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                  {fullName}
                  {tradeTitle && `, ${tradeTitle}`}
                </h1>
                {profile.professional?.isVerified && (
                  <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
                )}
                {!isOwnProfile && followsYou && (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700">
                    Follows you
                  </span>
                )}
              </div>

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
                    <span className="hidden xs:inline text-slate-300 dark:text-slate-700">
                      •
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {profile.professional.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span>
                      {profile.professional.yearsOfExperience || 0} Years in Trade
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span>
                      ⭐{' '}
                      {typeof profile.professional.rating === 'number'
                        ? profile.professional.rating.toFixed(1)
                        : '0.0'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Actions ───────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-3">
            {!isOwnProfile && hasPortfolio && !checkingPortfolio && (
              <button
                onClick={handleViewPortfolio}
                aria-label={`View ${fullName}'s portfolio`}
                className="group relative flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/25 transition-all active:scale-[0.98] overflow-hidden"
              >
                <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.25),transparent_70%)]" />
                <FolderOpen className="w-3.5 h-3.5 relative transition-transform group-hover:scale-110" />
                <span className="relative">View Portfolio</span>
                <ArrowRight className="w-3 h-3 relative -mr-0.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            {isOwnProfile && hasPortfolio && !checkingPortfolio && (
              <button
                onClick={handleViewPortfolio}
                aria-label="Preview your portfolio"
                className="group flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-[0.98]"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                <span>Preview Portfolio</span>
              </button>
            )}

            {isOwnProfile && isStandardAccount && (
              <button
                onClick={onUpgrade}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Become a Professional</span>
              </button>
            )}

            {isOwnProfile && (
              <button
                onClick={onEditProfile}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl transition"
              >
                Edit Profile
              </button>
            )}

            {!isOwnProfile && (
              <>
                <button
                  onClick={onFollow}
                  className={`flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                    isFollowing
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </button>

                {/* ── Message → MessageUserButton ── */}
                <MessageUserButton
                  userId={profile.id}
                  disabled={!canMessage}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl transition"
                />
              </>
            )}

            <button
              onClick={onShare}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              aria-label="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;