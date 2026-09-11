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
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-2">
        {presets.map((km) => (
          <button
            key={km}
            type="button"
            onClick={() => onChange(km)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              value === km && !isCustom
                ? 'bg-ink-900 text-white shadow-lg shadow-ink-900/20'
                : 'border border-ink-200 bg-white text-ink-700 hover:border-ink-300'
            }`}
          >
            {km} km
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-ink-500">Custom</label>
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
          className="w-24 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <span className="text-xs text-ink-400">km</span>
      </div>
    </div>
  );
}