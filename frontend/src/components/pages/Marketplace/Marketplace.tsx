import { useMarketplace } from "../../services/hooks/useMarketplace";
import ServiceGrid from "../../services/ServiceGrid";
import ServiceSearch from "../../services/ServiceSearch";
import ServiceFilters from "../../services/Servicefilter";

interface MarketplacePageProps {
  onViewProfile: (id: string) => void;
  onContact: (id: string) => void;
}

export default function MarketplacePage({
  onViewProfile,
  onContact,
}: MarketplacePageProps) {
  const {
    professionals,
    totalCount,
    loading,
    filters,
    setFilters,
    clearFilters,
  } = useMarketplace();

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500 text-sm">
        Loading marketplace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black p-6">
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-6 py-4 mb-6 shadow-sm">
        <div className="flex items-center gap-2 font-black text-black">
          <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
          <span>Explore Marketplace v2</span>
        </div>
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ServiceFilters
            filters={filters}
            onChange={setFilters}
            onClear={clearFilters}
          />
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <ServiceSearch
              value={filters.search}
              onChange={(search: string) => setFilters({ ...filters, search })}
            />

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs text-black">
                <span className="text-gray-500">Sort by</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      sortBy: e.target.value as typeof filters.sortBy,
                    })
                  }
                  className="bg-transparent font-semibold text-black focus:outline-none cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating-high">Rating: High to Low</option>
                  <option value="years-high">
                    Years in Trade: High to Low
                  </option>
                </select>
              </div>

              <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                Showing {totalCount} results
              </span>
            </div>
          </div>

          <ServiceGrid
            professionals={professionals}
            onViewProfile={onViewProfile}
            onContact={onContact}
          />
        </div>
      </div>
    </div>
  );
}
