import React, { useState } from "react";
import { Filter, X } from "lucide-react";
import { DiscoverHero } from "../components/DiscoverHero";
import { DiscoverTypeTabs } from "../components/DiscoverTypeTabs";
import { DiscoverFilterSidebar } from "../components/DiscoverFilterSidebar";
import { FeaturedCarousel } from "../components/FeaturedCarousel";
import { TopProfessionalsSection } from "../components/TopProfessionalsSection";
import { TrendingCategoriesCarousel } from "../components/TrendingCategoriesCarousel";
import { OpportunitiesCarousel } from "../components/OpportunitiesCarousel";
import {
  mockFeatured,
  mockTopProfessionals,
  mockTrendingCategories,
  mockOpportunities,
} from "../data/mockDiscoverData";
import type { DiscoverTabType, DiscoverFilterState } from "../types/discover";

export const DiscoverPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<DiscoverTabType>("all");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState<DiscoverFilterState>({
    locationOption: "near_me",
    locationInput: "",
    categories: [],
    minRating: 0,
    verifiedOnly: false,
    backgroundChecked: false,
    identityVerified: false,
    priceRange: 50,
    experienceLevels: [],
  });

  const handleFilterChange = (updated: Partial<DiscoverFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleClearFilters = () => {
    setFilters({
      locationOption: "near_me",
      locationInput: "",
      categories: [],
      minRating: 0,
      verifiedOnly: false,
      backgroundChecked: false,
      identityVerified: false,
      priceRange: 10,
      experienceLevels: [],
    });
  };

  return (
    <div className="relative min-h-screen transition-colors duration-300">
      <div className="space-y-10">
        <DiscoverHero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onTagClick={(tag) => setSearchQuery(tag)}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <DiscoverTypeTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 shadow-sm active:scale-95 transition-all"
          >
            <Filter size={16} className="text-blue-500" />
            <span>Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <div className="hidden lg:block lg:col-span-1 sticky top-6">
            <DiscoverFilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearFilters}
            />
          </div>

          <div className="lg:col-span-3 space-y-12">
            <FeaturedCarousel items={mockFeatured} />
            <TopProfessionalsSection professionals={mockTopProfessionals} />
            <TrendingCategoriesCarousel categories={mockTrendingCategories} />
            <OpportunitiesCarousel opportunities={mockOpportunities} />
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet – fixed close button */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative w-full max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl h-full overflow-y-auto shadow-2xl border-l border-slate-200 dark:border-slate-800">
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Filter size={16} className="text-blue-500" /> Filters
              </h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <DiscoverFilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearFilters}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;