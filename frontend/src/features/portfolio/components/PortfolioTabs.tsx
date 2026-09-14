// src/features/portfolio/components/PortfolioTabs.tsx
export type PortfolioTab = 'services' | 'works' | 'availability' | 'about';

interface PortfolioTabsProps {
  active: PortfolioTab;
  onChange: (tab: PortfolioTab) => void;
  counts?: Partial<Record<PortfolioTab, number>>;
}

const TABS: { value: PortfolioTab; label: string }[] = [
  { value: 'services', label: 'Services' },
  { value: 'works', label: 'Works' },
  { value: 'availability', label: 'Availability' },
  { value: 'about', label: 'About' },
];

export default function PortfolioTabs({
  active,
  onChange,
  counts = {},
}: PortfolioTabsProps) {
  return (
    <div className="relative">
      {/* Horizontal scroll container — bleeds to the panel edges on mobile */}
      <div
        role="tablist"
        aria-label="Portfolio sections"
        className="scrollbar-thin flex gap-1 overflow-x-auto
                   [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
                   px-2 sm:px-3"
      >
        {TABS.map((tab) => {
          const isActive = tab.value === active;
          const count = counts[tab.value];
          const showCount = typeof count === 'number' && count > 0;

          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.value)}
              className={`relative whitespace-nowrap rounded-t-sm px-3 py-3.5 text-[13px] font-semibold
                          transition-colors duration-200
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30
                          sm:px-4 sm:text-sm
                          ${
                            isActive
                              ? 'text-slate-900 dark:text-white'
                              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                          }`}
            >
              <span className="inline-flex items-center gap-2">
                {tab.label}

                {showCount && (
                  <span
                    className={`inline-flex h-4 min-w-[18px] items-center justify-center
                                rounded-sm px-1 text-[10px] font-bold tabular-nums
                                transition-colors duration-200
                                ${
                                  isActive
                                    ? 'bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                  >
                    {count}
                  </span>
                )}
              </span>

              {/* Active underline — sharp edges */}
              {isActive && (
                <span
                  className="pointer-events-none absolute inset-x-2 -bottom-px h-[2px] rounded-sm
                             bg-gradient-to-r from-blue-500 to-blue-700
                             dark:from-blue-400 dark:to-blue-600"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}