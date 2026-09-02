import  { useState } from "react";
import type { FeedType } from "../types/feed.types";
import { useFeedFilters } from "../hooks/useFeedFilters";
import { FeedTabs } from "./FeedTabs";
import { FeedFilters } from "./FeedFilters";
import { RecommendedFeed } from "./RecommendedFeed";
import { FollowingFeed } from "./FollowingFeed";
import { LocalFeed } from "./LocalFeed";
import { TrendingFeed } from "./TrendingFeed";

export default function Feed() {
  const [activeTab, setActiveTab] = useState<FeedType>("recommended");
  const { filters, updateFilter, clearFilters, hasActiveFilters } = useFeedFilters();

  return (
    <div className="max-w-2xl mx-auto py-4 px-2 sm:px-4">
      {/* Highlights / Stories row reference */}
      <div className="flex space-x-4 overflow-x-auto pb-4 mb-4 scrollbar-none">
        <div className="flex flex-col items-center space-y-1 cursor-pointer">
          <div className="w-14 h-14 rounded-full border-2 border-blue-500 p-0.5 flex items-center justify-center bg-gray-50">
            <span className="text-blue-600 font-bold text-xl">+</span>
          </div>
          <span className="text-xs text-gray-700">Add Highlight</span>
        </div>
        {["Cabinetry", "Pipe Fix", "Painting"].map((cat, idx) => (
          <div key={idx} className="flex flex-col items-center space-y-1 cursor-pointer flex-shrink-0">
            <img
              src="https://res.cloudinary.com/vo8xndxy/image/upload/v1787224662/samples/zoom.avif"
              alt={cat}
              className="w-14 h-14 rounded-full object-cover border border-gray-200"
            />
            <span className="text-xs text-gray-700">{cat}</span>
          </div>
        ))}
      </div>

      {/* Post Composer box reference */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center space-x-3 mb-3">
          <img
            src="https://res.cloudinary.com/vo8xndxy/image/upload/v1787224662/samples/zoom.avif"
            alt="Current User"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm text-gray-500 cursor-pointer">
            What are you working on?
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex space-x-4">
            <button className="text-xs font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1">🖼️ Photo</button>
            <button className="text-xs font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1">📹 Video</button>
            <button className="text-xs font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1">🛠️ Project</button>
          </div>
          <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Post
          </button>
        </div>
      </div>

      {/* Main Feed Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="px-4">
          <FeedFilters
            filters={filters}
            onFilterChange={updateFilter}
            onClear={clearFilters}
            hasActive={hasActiveFilters}
          />
          {activeTab === "recommended" && <RecommendedFeed filters={filters} />}
          {activeTab === "following" && <FollowingFeed filters={filters} />}
          {activeTab === "local" && <LocalFeed filters={filters} />}
          {activeTab === "trending" && <TrendingFeed filters={filters} />}
        </div>
      </div>
    </div>
  );
}