import type { MarketplaceFilters } from "../Types/marketplace.types";

interface ServiceFiltersProps {
  filters: MarketplaceFilters;
  onChange: (filters: MarketplaceFilters) => void;
  onClear: () => void;
}

const TRADES = [
  { name: "Electrician", count: 0 },
  { name: "Plumber", count: 0 },
  { name: "HVAC Technician", count: 0 },
  { name: "Carpenter", count: 0 },
  { name: "Welder", count: 0 },
];

const LICENSE_TIERS = ["Master", "Journeyman", "Apprentice"];
const INSURANCE_STATUSES = ["Verified", "Pending", "Not Verified"];

export default function ServiceFilters({
  filters,
  onChange,
  onClear,
}: ServiceFiltersProps) {
  const handleTradeToggle = (trade: string) => {
    const exists = filters.trades.includes(trade);
    const trades = exists
      ? filters.trades.filter((t) => t !== trade)
      : [...filters.trades, trade];
    onChange({ ...filters, trades });
  };

  const handleTierToggle = (tier: string) => {
    const exists = filters.licenseTiers.includes(tier);
    const licenseTiers = exists
      ? filters.licenseTiers.filter((t) => t !== tier)
      : [...filters.licenseTiers, tier];
    onChange({ ...filters, licenseTiers });
  };

  const handleInsuranceToggle = (status: string) => {
    const exists = filters.insuranceStatuses.includes(status);
    const insuranceStatuses = exists
      ? filters.insuranceStatuses.filter((s) => s !== status)
      : [...filters.insuranceStatuses, status];
    onChange({ ...filters, insuranceStatuses });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-6 text-black shadow-sm">
      <div className="relative">
        <input
          type="text"
          placeholder="Search filters..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-black placeholder:text-gray-400 focus:outline-none focus:border-blue-600"
        />
      </div>

      <div>
        <h3 className="font-bold text-sm text-black mb-3">Filters</h3>

        {/* Trade Section */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center font-semibold text-xs text-black">
            <span>Trade</span>
            <span>▾</span>
          </div>
          <div className="space-y-2">
            {TRADES.map((t) => (
              <label
                key={t.name}
                className="flex items-center justify-between text-xs text-gray-700 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.trades.includes(t.name)}
                    onChange={() => handleTradeToggle(t.name)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {t.name}
                </span>
                <span className="text-gray-400">({t.count})</span>
              </label>
            ))}
          </div>
        </div>

        {/* Radius Section */}
        <div className="space-y-3 pt-4 mt-4 border-t border-gray-100">
          <div className="flex justify-between items-center font-semibold text-xs text-black">
            <span>Radius</span>
            <span>▾</span>
          </div>
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="50"
              value={filters.radius}
              onChange={(e) =>
                onChange({ ...filters, radius: Number(e.target.value) })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>0 miles</span>
              <span>50+ miles</span>
            </div>
          </div>
        </div>

        {/* License Tier Section */}
        <div className="space-y-3 pt-4 mt-4 border-t border-gray-100">
          <div className="flex justify-between items-center font-semibold text-xs text-black">
            <span>License Tier</span>
            <span>▾</span>
          </div>
          <div className="space-y-2">
            {LICENSE_TIERS.map((tier) => (
              <label
                key={tier}
                className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.licenseTiers.includes(tier)}
                  onChange={() => handleTierToggle(tier)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {tier}
              </label>
            ))}
          </div>
        </div>

        {/* Insurance Status Section */}
        <div className="space-y-3 pt-4 mt-4 border-t border-gray-100">
          <div className="flex justify-between items-center font-semibold text-xs text-black">
            <span>Insurance Status</span>
            <span>▾</span>
          </div>
          <div className="space-y-2">
            {INSURANCE_STATUSES.map((status) => (
              <label
                key={status}
                className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.insuranceStatuses.includes(status)}
                  onChange={() => handleInsuranceToggle(status)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {status}
              </label>
            ))}
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-gray-100">
          <button
            onClick={onClear}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-black py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
