// src/features/portfolio/components/AvailabilityEditor.tsx
import { useEffect, useMemo, useState } from 'react';
import { Loader2, Save, RotateCcw, Coffee, Plus, X } from 'lucide-react';
import type {
  Availability,
  AvailabilityDay,
  AvailabilityInput,
} from '../types/portfolio.types';
import { AVAILABILITY_DAYS } from '../types/portfolio.types';

interface AvailabilityEditorProps {
  availability: Availability[];
  onSave: (data: AvailabilityInput[]) => Promise<void>;
  saving?: boolean;
}

interface DayDraft {
  day_of_week: AvailabilityDay;
  is_available: boolean;
  start_time: string;
  end_time: string;
  break_start: string;
  break_end: string;
}

/* ───────────────────────── Helpers ───────────────────────── */

const DAY_LABEL: Record<AvailabilityDay, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const DAY_SHORT: Record<AvailabilityDay, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

const DEFAULTS = {
  start_time: '08:00',
  end_time: '17:00',
  break_start: '12:00',
  break_end: '13:00',
};

const trimSeconds = (t?: string | null) =>
  t ? t.slice(0, 5) : '';

const emptyDraft = (): DayDraft[] =>
  AVAILABILITY_DAYS.map((day) => ({
    day_of_week: day,
    is_available: false,
    start_time: DEFAULTS.start_time,
    end_time: DEFAULTS.end_time,
    break_start: '',
    break_end: '',
  }));

const fromAvailability = (av: Availability[]): DayDraft[] => {
  const byDay = new Map<string, Availability>();
  av.forEach((a) => byDay.set(a.day_of_week, a));

  return AVAILABILITY_DAYS.map((day) => {
    const found = byDay.get(day);
    if (!found) {
      return {
        day_of_week: day,
        is_available: false,
        start_time: DEFAULTS.start_time,
        end_time: DEFAULTS.end_time,
        break_start: '',
        break_end: '',
      };
    }
    return {
      day_of_week: day,
      is_available: !!found.is_available,
      start_time: trimSeconds(found.start_time) || DEFAULTS.start_time,
      end_time: trimSeconds(found.end_time) || DEFAULTS.end_time,
      break_start: trimSeconds(found.break_start),
      break_end: trimSeconds(found.break_end),
    };
  });
};

const toInput = (drafts: DayDraft[]): AvailabilityInput[] =>
  drafts.map((d) => ({
    day_of_week: d.day_of_week,
    is_available: d.is_available,
    start_time: d.is_available && d.start_time ? d.start_time : undefined,
    end_time: d.is_available && d.end_time ? d.end_time : undefined,
    break_start:
      d.is_available && d.break_start ? d.break_start : undefined,
    break_end: d.is_available && d.break_end ? d.break_end : undefined,
  }));

/* ───────────────────────── Day row ───────────────────────── */

function DayRow({
  draft,
  disabled,
  onChange,
}: {
  draft: DayDraft;
  disabled: boolean;
  onChange: (patch: Partial<DayDraft>) => void;
}) {
  const hasBreak = Boolean(draft.break_start || draft.break_end);
  const active = draft.is_available;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border transition-all ${
        active
          ? 'border-blue-500/25 bg-blue-500/[0.03] dark:border-blue-400/20 dark:bg-blue-500/[0.05]'
          : 'border-slate-200/70 bg-white/60 dark:border-white/10 dark:bg-slate-800/30'
      }`}
    >
      {/* ── Header: day + toggle ── */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          {/* Day short badge */}
          <span
            className={`inline-flex h-8 w-11 shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold uppercase tracking-wider transition-colors ${
              active
                ? 'border-blue-500/25 bg-blue-500/10 text-blue-700 dark:border-blue-400/25 dark:text-blue-300'
                : 'border-slate-200/70 bg-slate-100/60 text-slate-500 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-400'
            }`}
          >
            {DAY_SHORT[draft.day_of_week]}
          </span>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {DAY_LABEL[draft.day_of_week]}
            </p>
            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
              {active
                ? `${draft.start_time || '—'} – ${draft.end_time || '—'}${
                    hasBreak ? ` · break ${draft.break_start || '—'}–${draft.break_end || '—'}` : ''
                  }`
                : 'Closed'}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <label
          className={`relative inline-flex shrink-0 items-center ${
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          }`}
        >
          <input
            type="checkbox"
            checked={active}
            disabled={disabled}
            onChange={(e) => onChange({ is_available: e.target.checked })}
            className="peer sr-only"
          />
          <div
            className="relative h-5 w-9 rounded-full bg-slate-300 transition-colors
                       peer-checked:bg-blue-600 dark:bg-slate-700
                       after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4
                       after:rounded-full after:border after:border-slate-300 after:bg-white
                       after:content-[''] after:transition-all
                       peer-checked:after:translate-x-full peer-checked:after:border-white"
          />
        </label>
      </div>

      {/* ── Expanded: time inputs ── */}
      {active && (
        <div className="space-y-3 border-t border-blue-500/15 px-3.5 py-3 dark:border-blue-400/10 sm:px-4">
          {/* Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                From
              </label>
              <input
                type="time"
                value={draft.start_time}
                disabled={disabled}
                onChange={(e) => onChange({ start_time: e.target.value })}
                className="w-full rounded-lg border border-white/50 bg-white/70 px-3 py-2 text-sm text-slate-900 backdrop-blur-md transition-all
                           focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/25
                           disabled:opacity-60 dark:border-white/10 dark:bg-slate-800/40 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                To
              </label>
              <input
                type="time"
                value={draft.end_time}
                disabled={disabled}
                onChange={(e) => onChange({ end_time: e.target.value })}
                className="w-full rounded-lg border border-white/50 bg-white/70 px-3 py-2 text-sm text-slate-900 backdrop-blur-md transition-all
                           focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/25
                           disabled:opacity-60 dark:border-white/10 dark:bg-slate-800/40 dark:text-white"
              />
            </div>
          </div>

          {/* Break toggle */}
          {!hasBreak ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange({
                  break_start: DEFAULTS.break_start,
                  break_end: DEFAULTS.break_end,
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300/70 bg-white/40 px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 transition-colors hover:border-blue-500/40 hover:text-blue-600 disabled:opacity-50 dark:border-white/15 dark:bg-slate-800/30 dark:text-slate-400 dark:hover:border-blue-400/40 dark:hover:text-blue-400"
            >
              <Plus className="h-3 w-3" />
              Add break
            </button>
          ) : (
            <div className="rounded-lg border border-slate-200/70 bg-white/50 p-3 dark:border-white/10 dark:bg-slate-800/30">
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  <Coffee className="h-3 w-3 text-blue-500" />
                  Break
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    onChange({ break_start: '', break_end: '' })
                  }
                  aria-label="Remove break"
                  className="text-slate-400 transition-colors hover:text-rose-500 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={draft.break_start}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange({ break_start: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/50 bg-white/70 px-3 py-2 text-sm text-slate-900 backdrop-blur-md transition-all
                             focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/25
                             disabled:opacity-60 dark:border-white/10 dark:bg-slate-800/40 dark:text-white"
                />
                <input
                  type="time"
                  value={draft.break_end}
                  disabled={disabled}
                  onChange={(e) => onChange({ break_end: e.target.value })}
                  className="w-full rounded-lg border border-white/50 bg-white/70 px-3 py-2 text-sm text-slate-900 backdrop-blur-md transition-all
                             focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/25
                             disabled:opacity-60 dark:border-white/10 dark:bg-slate-800/40 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */

export default function AvailabilityEditor({
  availability,
  onSave,
  saving = false,
}: AvailabilityEditorProps) {
  const initialDrafts = useMemo(
    () => fromAvailability(availability),
    [availability]
  );

  const [drafts, setDrafts] = useState<DayDraft[]>(initialDrafts);
  const [savingLocal, setSavingLocal] = useState(false);

  /* Sync when parent changes */
  useEffect(() => {
    setDrafts(initialDrafts);
  }, [initialDrafts]);

  /* Dirty check */
  const isDirty = useMemo(() => {
    return JSON.stringify(drafts) !== JSON.stringify(initialDrafts);
  }, [drafts, initialDrafts]);

  const activeCount = drafts.filter((d) => d.is_available).length;
  const isBusy = saving || savingLocal;

  const updateDay = (day: AvailabilityDay, patch: Partial<DayDraft>) => {
    setDrafts((prev) =>
      prev.map((d) => (d.day_of_week === day ? { ...d, ...patch } : d))
    );
  };

  const handleReset = () => {
    setDrafts(initialDrafts);
  };

  const handleSave = async () => {
    if (isBusy || !isDirty) return;
    setSavingLocal(true);
    try {
      await onSave(toInput(drafts));
    } finally {
      setSavingLocal(false);
    }
  };

  /* Copy-to-all convenience: applies Monday's times to all weekdays */
  const copyMondayToWeekdays = () => {
    const monday = drafts.find((d) => d.day_of_week === 'monday');
    if (!monday) return;
    setDrafts((prev) =>
      prev.map((d) => {
        if (
          d.day_of_week === 'saturday' ||
          d.day_of_week === 'sunday'
        ) {
          return d;
        }
        return {
          ...d,
          is_available: monday.is_available,
          start_time: monday.start_time,
          end_time: monday.end_time,
          break_start: monday.break_start,
          break_end: monday.break_end,
        };
      })
    );
  };

  return (
    <div className="space-y-4">
      {/* ── Top strip: summary + quick action ── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span className="font-bold tabular-nums text-blue-600 dark:text-blue-400">
            {activeCount}
          </span>{' '}
          of 7 days open for bookings
        </p>

        <button
          type="button"
          onClick={copyMondayToWeekdays}
          disabled={isBusy}
          className="text-[11px] font-semibold text-blue-600 transition-colors hover:text-blue-700 disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Copy Monday to weekdays
        </button>
      </div>

      {/* ── Days ── */}
      <div className="space-y-2.5">
        {drafts.map((draft) => (
          <DayRow
            key={draft.day_of_week}
            draft={draft}
            disabled={isBusy}
            onChange={(patch) => updateDay(draft.day_of_week, patch)}
          />
        ))}
      </div>

      {/* ── Save bar ── */}
      <div className="flex flex-col-reverse items-stretch gap-2 border-t border-slate-200/60 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {isDirty
            ? 'You have unsaved changes.'
            : 'All changes saved.'}
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isBusy}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200/80 bg-white/70 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-white disabled:opacity-50 sm:w-auto dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isBusy}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-500/25 transition-colors hover:bg-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isBusy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save schedule
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}