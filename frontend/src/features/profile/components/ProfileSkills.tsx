import React from 'react';
import { ThumbsUp, Plus } from 'lucide-react';
import type { SkillItem } from '../types/profile.types';

interface ProfileSkillsProps {
  skills: SkillItem[];
  isOwnProfile?: boolean;
}

export const ProfileSkills: React.FC<ProfileSkillsProps> = ({ skills, isOwnProfile }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
          Skills & Qualifications
        </h3>
        {isOwnProfile && (
          <button className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            <Plus className="w-3.5 h-3.5" /> Add Skill
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {skill.name}
              </p>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {skill.category}
              </span>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ThumbsUp className="w-3 h-3" /> {skill.endorsements}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};