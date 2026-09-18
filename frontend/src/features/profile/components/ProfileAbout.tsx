// src/features/profile/components/ProfileAbout.tsx

import React from 'react';
import { Mail, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import type { UserProfile } from '../types/profile.types';

const formatDate = (dateValue: unknown): string => {
  if (!dateValue) return 'Unknown';

  let date: Date;

  if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === 'number') {
    const timestamp =
      dateValue < 10000000000 ? dateValue * 1000 : dateValue;
    date = new Date(timestamp);
  } else {
    const value = String(dateValue).trim();
    if (!value) return 'Unknown';

    const normalizedValue = value.includes(' ')
      ? value.replace(' ', 'T')
      : value;

    date = new Date(normalizedValue);
    if (Number.isNaN(date.getTime())) {
      date = new Date(value);
    }
  }

  if (Number.isNaN(date.getTime())) return 'Unknown';

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/* ─────────────────────────────────────────────────────── */
/*  BIO CARD — natural height, no h-full                    */
/* ─────────────────────────────────────────────────────── */

export const ProfileBio: React.FC<{ profile: UserProfile }> = ({ profile }) => (
  <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2.5">
    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
      Bio
    </h3>
    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
      {profile.bio || 'No bio yet.'}
    </p>

    {profile.professional && (
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
          Professional Bio
        </h4>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          {profile.professional.bio || 'No professional bio provided.'}
        </p>
      </div>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────── */
/*  DETAILS CARD — natural height, no h-full                */
/* ─────────────────────────────────────────────────────── */

export const ProfileDetails: React.FC<{ profile: UserProfile }> = ({ profile }) => (
  <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2.5">
    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
      Details
    </h3>

    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
        <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
        <span className="truncate">{profile.email}</span>
      </div>

      {profile.location && (
        <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
          <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>{profile.location}</span>
        </div>
      )}

      <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
        <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
        <span>Joined {formatDate(profile.createdAt)}</span>
      </div>

      <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          {profile.professional?.isVerified
            ? 'Verified Professional'
            : 'Standard Account'}
        </span>
      </div>

      {profile.professional && (
        <>
          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
            <span className="font-bold shrink-0">⭐</span>
            <span>
              {Number(profile.professional.rating || 0).toFixed(1)} (
              {profile.professional.totalReviews || 0} reviews)
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
            <span className="font-bold shrink-0">✅</span>
            <span>{profile.professional.completedJobs || 0} jobs completed</span>
          </div>

          {profile.professional.hourlyRate && (
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <span className="font-bold shrink-0">💵</span>
              <span>${profile.professional.hourlyRate}/hr</span>
            </div>
          )}
        </>
      )}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────── */
/*  LEGACY DEFAULT EXPORT                                   */
/* ─────────────────────────────────────────────────────── */

const ProfileAbout: React.FC<{ profile: UserProfile }> = ({ profile }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
    <div className="lg:col-span-2">
      <ProfileBio profile={profile} />
    </div>
    <div>
      <ProfileDetails profile={profile} />
    </div>
  </div>
);

export default ProfileAbout;