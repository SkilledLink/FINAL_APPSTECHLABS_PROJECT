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
      {/* Preset Radius Buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((km) => {
          const isSelected = value === km && !isCustom;
          return (
            <button
              key={km}
              type="button"
              onClick={() => onChange(km)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 dark:bg-indigo-500'
                  : 'border border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {km} km
            </button>
          );
        })}
      </div>

      {/* Custom Radius Input */}
      <div className="flex items-center gap-2.5 pt-1">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
            className="w-24 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
          />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            km
          </span>
        </div>
      </div>
    </div>
  );
}