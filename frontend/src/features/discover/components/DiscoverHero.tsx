import React from "react";
import { Search } from "lucide-react";
import { quickSearchTags } from "../data/mockDiscoverData";

interface DiscoverHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onTagClick: (tag: string) => void;
}

export const DiscoverHero: React.FC<DiscoverHeroProps> = ({
  searchQuery,
  onSearchChange,
  onTagClick,
}) => {
  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-lg min-h-[220px] flex items-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full p-6 md:p-8 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
          Explore
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 mb-2 text-white">
          Find the right professionals & opportunities
        </h1>
        <p className="text-sm text-blue-100/80 mb-6">
          Connect with trusted experts, top businesses, and quality services.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
          <div className="flex items-center flex-1 w-full px-3 py-1.5">
            <Search className="text-blue-200 mr-2 shrink-0" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search for professionals, businesses, services..."
              className="w-full bg-transparent text-sm text-white placeholder-blue-200/60 focus:outline-none"
            />
          </div>
          <button className="w-full sm:w-auto px-6 py-2.5 bg-white text-blue-600 hover:bg-blue-50 font-medium text-sm rounded-lg transition-all shadow-md">
            Search
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          {quickSearchTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-blue-100 transition-colors border border-white/10"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};