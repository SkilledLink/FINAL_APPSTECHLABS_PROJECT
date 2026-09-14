const PRESETS = [5, 10, 25, 50, 100];

interface ServiceRadiusSelectorProps {
  value: number;
  onChange: (radiusKm: number) => void;
  presets?: number[];
}

export default function ServiceRadiusSelector({
  value,
  onChange,
  presets = PRESETS,
}: ServiceRadiusSelectorProps) {
  const isCustom = !presets.includes(value);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {presets.map((km) => {
          const isSelected = value === km && !isCustom;
          return (
            <button
              key={km}
              type="button"
              onClick={() => onChange(km)}
              className={`rounded px-3.5 py-2 text-sm font-semibold transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'border border-slate-200/80 bg-white text-slate-700 hover:border-blue-500/40 hover:text-blue-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:text-blue-400'
              }`}
            >
              {km} km
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2.5 pt-1">
        <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          Custom
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={0.5}
            max={200}
            step={0.5}
            value={isCustom ? value : ''}
            placeholder="0"
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isNaN(n) && n >= 0.5 && n <= 200) onChange(n);
            }}
            className="w-24 rounded border border-slate-200/80 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/25 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
          />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            km
          </span>
        </div>
      </div>
    </div>
  );
}