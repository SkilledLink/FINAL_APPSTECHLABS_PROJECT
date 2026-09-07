// src/features/profile/components/ProfileSkills.tsx

import React from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import type { UserProfile } from '../types/profile.types';

interface ProfileSkillsProps {
  profile: UserProfile;
  isOwnProfile?: boolean;
}

export const ProfileSkills: React.FC<ProfileSkillsProps> = ({ profile, isOwnProfile }) => {
  const skills = profile.professional?.skills || [];

  if (!profile.professional && !isOwnProfile) return null;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
          Skills & Qualifications
        </h3>
        {isOwnProfile && profile.professional && (
          <button className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            <Plus className="w-3.5 h-3.5" /> Add Skill
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.length > 0 ? (
          skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              {skill}
            </span>
          ))
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500">No skills listed.</p>
        )}
      </div>
    </div>
  );
};