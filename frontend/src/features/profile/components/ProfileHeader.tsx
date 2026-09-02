import React from 'react';
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
  onFollow?: () => void;
  onMessage?: () => void;
  onRequestService?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onFollow,
  onMessage,
  onRequestService,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs">
      {/* Cover Image Banner with Fluid Height */}
      <div className="h-32 sm:h-48 md:h-60 w-full relative bg-slate-800">
        {profile.coverImage && (
          <img
            src={profile.coverImage}
            alt="Cover Workstation"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      </div>

      {/* Profile Details Container */}
      <div className="p-4 sm:p-6 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-14 sm:-mt-20 md:-mt-24 mb-3 sm:mb-4">
          {/* Avatar and Primary Identity Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-4">
            <div className="relative shrink-0">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl"
              />
              <span className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full ring-2 ring-white dark:ring-slate-900">
                <BadgeCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
            </div>

            <div className="pb-0.5 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                  {profile.name}, {profile.tradeTitle}
                </h1>
                <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 fill-blue-500/10 shrink-0" />
              </div>

              {/* Responsive Metadata Pills */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>{profile.followersCount} Followers</span>
                <span className="hidden xs:inline">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  Verified
                </span>
                <span>•</span>
                <span>{profile.yearsInTrade} Years in Trade</span>
              </div>
            </div>
          </div>

          {/* Action Button Grid on Mobile / Flex Row on Desktop */}
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:flex items-center gap-2 pt-2 md:pt-0 w-full md:w-auto">
            <button
              onClick={onFollow}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl sm:rounded-2xl shadow-xs transition active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0" />
              <span>Follow</span>
            </button>

            <button
              onClick={onMessage}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl sm:rounded-2xl transition active:scale-[0.98]"
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span>Message</span>
            </button>

            <button
              onClick={onRequestService}
              className="col-span-2 xs:col-span-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl sm:rounded-2xl transition shadow-xs active:scale-[0.98]"
            >
              <Wrench className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Request Service</span>
            </button>

            {/* Tertiary Utility Icon Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <button className="p-2.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98]">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98]">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};