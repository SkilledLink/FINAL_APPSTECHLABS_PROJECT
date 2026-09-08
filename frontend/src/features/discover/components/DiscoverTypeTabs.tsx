import React from "react";
import { LayoutGrid, User, Building2, Wrench, Briefcase, FolderKanban } from "lucide-react";
import type { DiscoverTabType } from "../types/discover";

interface DiscoverTypeTabsProps {
  activeTab: DiscoverTabType;
  onTabChange: (tab: DiscoverTabType) => void;
}

const iconMap: Record<string, React.ElementType> = {
  LayoutGrid,
  User,
  Building2,
  Wrench,
  Briefcase,
  FolderKanban,
};

export const DiscoverTypeTabs: React.FC<DiscoverTypeTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: DiscoverTabType; label: string; icon: string; count: number }[] = [
    { id: "all", label: "All", icon: "LayoutGrid", count: 245 },
    { id: "professionals", label: "Professionals", icon: "User", count: 120 },
    { id: "businesses", label: "Businesses", icon: "Building2", count: 45 },
    { id: "services", label: "Services", icon: "Wrench", count: 80 },
    { id: "jobs", label: "Jobs", icon: "Briefcase", count: 30 },
    { id: "portfolios", label: "Portfolios", icon: "FolderKanban", count: 60 },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
      {tabs.map((tab) => {
        const Icon = iconMap[tab.icon] || LayoutGrid;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
              ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 hover:bg-white/80 dark:hover:bg-slate-800/80"
              }
            `}
          >
            <Icon size={16} className={isActive ? "text-white" : "text-blue-500 dark:text-blue-400"} />
            <span>{tab.label}</span>
            <span
              className={`
                text-[10px] font-bold px-2 py-0.5 rounded-full
                ${isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}
              `}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};