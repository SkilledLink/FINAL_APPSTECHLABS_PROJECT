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
    <div className="border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="scrollbar-thin flex gap-1 overflow-x-auto px-2">
        {TABS.map((tab) => {
          const isActive = tab.value === active;
          const count = counts[tab.value];
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={`relative whitespace-nowrap px-4 py-3.5 text-sm font-semibold transition-colors duration-200 ${
                isActive
                  ? 'text-slate-900 dark:text-slate-100'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {tab.label}
                {typeof count === 'number' && count > 0 && (
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums transition-colors duration-200 ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </span>

              {isActive && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}