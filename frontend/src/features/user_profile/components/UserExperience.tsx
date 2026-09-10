// src/features/user_profile/components/UserExperience.tsx

import React from 'react';
import { Briefcase } from 'lucide-react';
import type { UserProfile } from '../types/user.types';

interface UserExperienceProps {
  profile: UserProfile;
}

export const UserExperience: React.FC<UserExperienceProps> = ({
  profile,
}) => {
  if (!profile.professional) return null;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6">
      <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
        Work Experience
      </h3>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-indigo-600 text-white rounded-full shadow-md">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {profile.professional.profession}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {profile.professional.yearsOfExperience} years of experience
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {profile.professional.completedJobs} projects completed
            </p>
            {profile.professional.city && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Based in {profile.professional.city},{' '}
                {profile.professional.country}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};