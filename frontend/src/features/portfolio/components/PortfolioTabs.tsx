// src/features/portfolio/components/PortfolioTabs.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Briefcase, Star, Clock, type LucideIcon } from 'lucide-react';

export type Tab = 'overview' | 'works' | 'services' | 'availability';

interface TabOption {
  id: Tab;
  label: string;
  icon: LucideIcon;
}

const tabs: TabOption[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'works', label: 'Works', icon: Briefcase },
  { id: 'services', label: 'Services', icon: Star },
  { id: 'availability', label: 'Availability', icon: Clock },
];

interface PortfolioTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function PortfolioTabs({ activeTab, onTabChange }: PortfolioTabsProps) {
  return (
    <div className="relative border-b border-slate-200/80 dark:border-slate-800/80 pb-1">
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-1 px-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-colors duration-200 flex items-center gap-2 whitespace-nowrap outline-none select-none ${
                isActive
                  ? 'text-cyan-600 dark:text-cyan-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
              }`}
            >
              {/* Sliding Active Pill Background */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 rounded-2xl shadow-sm"
                />
              )}

              {/* Icon & Text */}
              <Icon
                size={16}
                className={`relative z-10 transition-colors ${
                  isActive
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              />
              <span className="relative z-10">{tab.label}</span>

              {/* Bottom Glow Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute -bottom-1.5 left-3 right-3 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}