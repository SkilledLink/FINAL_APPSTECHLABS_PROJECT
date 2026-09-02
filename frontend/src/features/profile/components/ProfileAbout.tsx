import React from 'react';
import { Mail, Calendar, ShieldCheck, Building2 } from 'lucide-react';
import type { UserProfile } from '../types/profile.types';

interface ProfileAboutProps {
  profile: UserProfile;
}

export const ProfileAbout: React.FC<ProfileAboutProps> = ({ profile }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Bio Card */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
          Professional Bio
        </h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
          {profile.bio || 'No biography provided yet.'}
        </p>
      </div>

      {/* Sidebar Details Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
          Account Overview
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <Mail className="w-4 h-4 text-indigo-500" />
            <span className="truncate">{profile.email}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Member since {profile.createdAt}</span>
          </div>

          {profile.companyMeta?.teamSize && (
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <span>Team Size: {profile.companyMeta.teamSize}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Verification: {profile.isVerified ? 'Verified' : 'Pending'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};