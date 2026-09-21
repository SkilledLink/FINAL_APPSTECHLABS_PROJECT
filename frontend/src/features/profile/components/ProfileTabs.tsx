// src/features/profile/components/ProfileTabs.tsx

import React from 'react';
import { LayoutDashboard, Image, FileText, Briefcase, Wrench, Star } from 'lucide-react';
import type { ProfileTab } from '../types/profile.types';

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onChangeTab: (tab: ProfileTab) => void;
  isProfessional: boolean;
  layout?: 'horizontal' | 'vertical';
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onChangeTab,
  isProfessional,
  layout = 'horizontal',
}) => {
  const baseTabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'media', label: 'Media', icon: <Image className="w-4 h-4" /> },
    { id: 'posts', label: 'Posts', icon: <FileText className="w-4 h-4" /> },
  ];

  const professionalTabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'work', label: 'Work', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'services', label: 'Services', icon: <Wrench className="w-4 h-4" /> },
    { id: 'reviews', label: 'Reviews', icon: <Star className="w-4 h-4" /> },
  ];

  const tabs = isProfessional ? [...baseTabs, ...professionalTabs] : baseTabs;

  // ── Vertical sidebar ────────────────────────────────────────
  if (layout === 'vertical') {
    return (
      <aside className="w-full lg:w-56 shrink-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-2 shadow-xs lg:sticky lg:top-20 h-fit">
        <h3 className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Profile Menu
        </h3>
        <nav className="flex flex-col gap-0.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all w-full text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    );
  }

  // ── Horizontal tabs ─────────────────────────────────────────
  return (
    <div className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-1 sm:px-3 rounded-xl overflow-x-auto">
      <div className={`flex items-center gap-1 ${isProfessional ? 'min-w-max' : 'justify-center'}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative py-3 px-4 text-sm font-bold transition-colors whitespace-nowrap ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};