// src/features/profile/components/ProfileHeader.tsx

import React, { useRef } from 'react';
import {
  BadgeCheck,
  UserPlus,
  MessageSquare,
  Wrench,
  Share2,
  MoreHorizontal,
} from 'lucide-react';
import type { UserProfile } from '../types/profile.types';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  followersCount?: number;
  onFollow?: () => void;
  onMessage?: () => void;
  onRequestService?: () => void;
  onUpgrade?: () => void;
  onEditProfile?: () => void;
  onImageUpload?: (file: File, type: 'profile' | 'banner') => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isOwnProfile,
  isFollowing = false,
  followersCount: propFollowersCount,
  onFollow,
  onMessage,
  onRequestService,
  onUpgrade,
  onEditProfile,
  onImageUpload,
}) => {
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  // Support both camelCase and snake_case API responses
  const profileData = profile as UserProfile & {
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
    banner_image_url?: string;
    followers_count?: number;
    account_type?: string;
  };

  const firstName =
    profileData.firstName ??
    profileData.first_name ??
    '';

  const lastName =
    profileData.lastName ??
    profileData.last_name ??
    '';

  const fullName =
    `${firstName} ${lastName}`.trim() || 'User';

  const tradeTitle =
    profile.professional?.profession || '';

  const displayFollowers =
    propFollowersCount ??
    profile.followersCount ??
    profileData.followers_count ??
    0;

  const profileImageUrl =
    profile.profileImageUrl ??
    profileData.profile_image_url ??
    '';

  const bannerImageUrl =
    profile.bannerImageUrl ??
    profileData.banner_image_url ??
    '';

  const accountType =
    profile.accountType ??
    profileData.account_type;

  /**
   * Handles selecting an image.
   *
   * The input is reset before opening so that
   * selecting the same image again still fires
   * the change event.
   */
  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'profile' | 'banner'
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image.');
      event.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be smaller than 10MB.');
      event.target.value = '';
      return;
    }

    console.log(
      `Selected ${type} image:`,
      file.name
    );

    if (onImageUpload) {
      onImageUpload(file, type);
    }

    // Reset the input so the same image
    // can be selected again later.
    event.target.value = '';
  };

  const openBannerPicker = () => {
    if (!onImageUpload) {
      console.warn(
        'ProfileHeader: onImageUpload is not provided.'
      );
      return;
    }

    bannerInputRef.current?.click();
  };

  const openProfilePicker = () => {
    if (!onImageUpload) {
      console.warn(
        'ProfileHeader: onImageUpload is not provided.'
      );
      return;
    }

    profileInputRef.current?.click();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs">

      {/* Hidden Banner File Input */}
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) =>
          handleImageChange(event, 'banner')
        }
      />

      {/* Hidden Profile File Input */}
      <input
        ref={profileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) =>
          handleImageChange(event, 'profile')
        }
      />

      {/* Banner */}
      <div className="h-32 sm:h-48 md:h-60 w-full relative bg-slate-800">

        {bannerImageUrl ? (
          <img
            src={bannerImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <span className="text-sm">
              No banner image
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

        {/* Edit Banner */}
        {isOwnProfile && onImageUpload && (
          <button
            type="button"
            onClick={openBannerPicker}
            className="absolute bottom-3 right-3 z-20 px-3 py-2 bg-white/90 dark:bg-slate-900/90 rounded-lg shadow-md text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Edit Banner
          </button>
        )}
      </div>

      {/* Profile Details */}
      <div className="p-4 sm:p-6 relative">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-14 sm:-mt-20 md:-mt-24 mb-3 sm:mb-4">

          {/* Avatar + Name */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-4">

            {/* Avatar */}
            <div className="relative shrink-0 group">

              <img
                src={
                  profileImageUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    fullName
                  )}&background=random`
                }
                alt={fullName}
                className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl"
              />

              {/* Verification Badge */}
              {profile.professional?.isVerified && (
                <span className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full ring-2 ring-white dark:ring-slate-900">
                  <BadgeCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
              )}

              {/* Change Profile Image */}
              {isOwnProfile && onImageUpload && (
                <button
                  type="button"
                  onClick={openProfilePicker}
                  className="absolute bottom-0 left-0 right-0 mx-auto w-full text-center bg-black/50 text-white text-[10px] font-bold py-1 rounded-b-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  Change
                </button>
              )}
            </div>

            {/* Name + Stats */}
            <div className="pb-0.5 space-y-1">

              <div className="flex items-center gap-1.5 flex-wrap">

                <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                  {fullName}
                  {tradeTitle && `, ${tradeTitle}`}
                </h1>

                {profile.professional?.isVerified && (
                  <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 fill-blue-500/10 shrink-0" />
                )}

              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-500 dark:text-slate-400">

                <span>
                  {displayFollowers} Followers
                </span>

                {profile.professional && (
                  <>
                    <span className="hidden xs:inline">
                      •
                    </span>

                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {profile.professional.isVerified
                        ? 'Verified'
                        : 'Unverified'}
                    </span>

                    <span>•</span>

                    <span>
                      {profile.professional.yearsOfExperience || 0}{' '}
                      Years in Trade
                    </span>

                    <span>•</span>

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

          {/* Action Buttons */}
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:flex items-center gap-2 pt-2 md:pt-0 w-full md:w-auto">

            {/* Upgrade – now checks for 'user' to match backend AccountType.USER = "user" */}
            {isOwnProfile &&
              accountType === 'user' && (
                <button
                  type="button"
                  onClick={onUpgrade}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl sm:rounded-2xl shadow-xs transition active:scale-[0.98]"
                >
                  <Wrench className="w-3.5 h-3.5 shrink-0" />
                  <span>Become a Professional</span>
                </button>
              )}

            {/* Edit Profile */}
            {isOwnProfile && (
              <button
                type="button"
                onClick={onEditProfile}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl sm:rounded-2xl transition active:scale-[0.98]"
              >
                Edit Profile
              </button>
            )}

            {/* Other User Actions */}
            {!isOwnProfile && (
              <>
                <button
                  type="button"
                  onClick={onFollow}
                  className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-xl transition active:scale-[0.98] ${
                    isFollowing
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 shrink-0" />

                  <span>
                    {isFollowing
                      ? 'Following'
                      : 'Follow'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onMessage}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl sm:rounded-2xl transition active:scale-[0.98]"
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span>Message</span>
                </button>
              </>
            )}

            {/* Request Service */}
            {profile.professional && !isOwnProfile && (
              <button
                type="button"
                onClick={onRequestService}
                className="col-span-2 xs:col-span-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl sm:rounded-2xl transition shadow-xs active:scale-[0.98]"
              >
                <Wrench className="w-3.5 h-3.5 shrink-0" />

                <span className="whitespace-nowrap">
                  Request Service
                </span>
              </button>
            )}

            {/* Utility Buttons */}
            <div className="hidden sm:flex items-center gap-2">

              <button
                type="button"
                className="p-2.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98]"
                aria-label="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="p-2.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98]"
                aria-label="More options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;