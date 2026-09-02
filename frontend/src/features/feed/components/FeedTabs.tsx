import React from "react";
import type { FeedType } from "../types/feed.types";

interface FeedTabsProps {
  activeTab: FeedType;
  onTabChange: (tab: FeedType) => void;
}

const tabs: { id: FeedType; label: string }[] = [
  { id: "recommended", label: "Recommended" },
  { id: "following", label: "Following" },
  { id: "local", label: "Local" },
  { id: "trending", label: "Trending" },
];

export const FeedTabs: React.FC<FeedTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-gray-200 bg-white px-4 rounded-t-xl mb-4">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors relative ${
              isActive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};