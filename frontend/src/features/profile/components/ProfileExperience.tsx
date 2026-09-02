import React from 'react';
import { Briefcase, Calendar } from 'lucide-react';
import type { ExperienceItem } from '../types/profile.types';

interface ProfileExperienceProps {
  experience: ExperienceItem[];
}

export const ProfileExperience: React.FC<ProfileExperienceProps> = ({ experience }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6">
      <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
        Work & Project History
      </h3>

      <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {experience.map((exp) => (
          <div key={exp.id} className="relative flex items-start gap-4 pl-8">
            <div className="absolute left-0 top-1 p-1.5 bg-indigo-600 text-white rounded-full shadow-md">
              <Briefcase className="w-3.5 h-3.5" />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {exp.title}
              </h4>
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {exp.companyName} {exp.location ? `• ${exp.location}` : ''}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 pt-1">
                {exp.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};