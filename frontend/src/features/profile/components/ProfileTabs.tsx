import React from 'react';
import type { ProfileTab } from '../types/profile.types';

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onChangeTab: (tab: ProfileTab) => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const tabs: { id: ProfileTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'work', label: 'Work' },
    { id: 'services', label: 'Services' },
    { id: 'posts', label: 'Posts' },
    { id: 'reviews', label: 'Reviews' },
  ];

  return (
    <div className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-1 sm:px-3 rounded-xl sm:rounded-2xl my-3 sm:my-4 overflow-x-auto no-scrollbar scroll-smooth">
      <div className="flex items-center min-w-max gap-1 sm:gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative py-2.5 sm:py-3 px-3.5 sm:px-5 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${
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