// src/features/profile/components/ProfileAbout.tsx

import React from 'react';
import { Mail, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import type{ UserProfile } from '../types/profile.types';

interface ProfileAboutProps {
  profile: UserProfile;
}

export const ProfileAbout: React.FC<ProfileAboutProps> = ({ profile }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Bio</h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
          {profile.bio || 'No bio yet.'}
        </p>
        {profile.professional && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Professional Bio</h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {profile.professional.bio || 'No professional bio provided.'}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <Mail className="w-4 h-4 text-indigo-500" />
            <span className="truncate">{profile.email}</span>
          </div>
          {profile.location && (
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-indigo-500" />
              <span>{profile.location}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              {profile.professional?.isVerified ? 'Verified Professional' : 'Standard Account'}
            </span>
          </div>
          {profile.professional && (
            <>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <span className="font-bold">⭐</span>
                <span>{profile.professional.rating.toFixed(1)} ({profile.professional.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <span className="font-bold">✅</span>
                <span>{profile.professional.completedJobs} jobs completed</span>
              </div>
              {profile.professional.hourlyRate && (
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <span className="font-bold">💵</span>
                  <span>${profile.professional.hourlyRate}/hr</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};