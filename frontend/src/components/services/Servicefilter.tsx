import type { MarketplaceFilters } from "../Types/marketplace.types";

interface ServiceFiltersProps {
  filters: MarketplaceFilters;
  onChange: (filters: MarketplaceFilters) => void;
}

const categories = ["All", "Development", "Design", "Marketing", "Writing"];

export default function ServiceFilters({
  filters,
  onChange,
}: ServiceFiltersProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto w-full pb-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange({ ...filters, category: cat })}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shadow-sm ${
            filters.category === cat
              ? "bg-blue-600 text-white shadow-blue-500/20"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
