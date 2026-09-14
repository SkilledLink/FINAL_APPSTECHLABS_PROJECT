import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Coffee,
  FileText,
  Loader2,
  Save,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type {
  Availability,
  AvailabilityDay,
  AvailabilityInput,
} from '../types/portfolio.types';
import { AVAILABILITY_DAYS } from '../types/portfolio.types';

interface PortfolioAvailabilityProps {
  availability: Availability[];
  saving?: boolean;
  isOwner?: boolean;
  onSave: (items: AvailabilityInput[]) => Promise<void>;
}

interface DayState {
  day: AvailabilityDay;
  is_available: boolean;
  start_time: string;
  end_time: string;
  break_start: string;
  break_end: string;
  notes: string;
}

const DEFAULT_START = '08:00';
const DEFAULT_END = '18:00';

function buildDefaultWeek(): DayState[] {
  return AVAILABILITY_DAYS.map((day) => ({
    day,
    is_available: false,
    start_time: DEFAULT_START,
    end_time: DEFAULT_END,
    break_start: '',
    break_end: '',
    notes: '',
  }));
}

function fromAvailability(items: Availability[]): DayState[] {
  const map = new Map<AvailabilityDay, Availability>();
  items.forEach((a) => map.set(a.day_of_week, a));
  return AVAILABILITY_DAYS.map((day) => {
    const existing = map.get(day);
    return {
      day,
      is_available: existing?.is_available ?? false,
      start_time: existing?.start_time ?? DEFAULT_START,
      end_time: existing?.end_time ?? DEFAULT_END,
      break_start: existing?.break_start ?? '',
      break_end: existing?.break_end ?? '',
      notes: existing?.notes ?? '',
    };
  });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function PortfolioAvailability({
  availability,
  saving = false,
  isOwner = false,
  onSave,
}: PortfolioAvailabilityProps) {
  const [week, setWeek] = useState<DayState[]>(buildDefaultWeek());

  useEffect(() => {
    setWeek(fromAvailability(availability));
  }, [availability]);

  const updateDay = (day: AvailabilityDay, patch: Partial<DayState>) => {
    setWeek((prev) =>
      prev.map((d) => (d.day === day ? { ...d, ...patch } : d))
    );
  };

  const handleSave = async () => {
    const payload: AvailabilityInput[] = week
      .filter((d) => d.is_available)
      .map((d) => ({
        day_of_week: d.day,
        start_time: d.start_time || undefined,
        end_time: d.end_time || undefined,
        is_available: true,
        break_start: d.break_start || undefined,
        break_end: d.break_end || undefined,
        notes: d.notes.trim() || undefined,
      }));
    await onSave(payload);
  };

  const activeDays = week.filter((d) => d.is_available).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50/80 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              Availability & Hours
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {activeDays > 0
                ? `Available ${activeDays} day${activeDays === 1 ? '' : 's'} a week`
                : 'No active schedule configured'}
            </p>
          </div>
        </div>

        {isOwner && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Save Schedule</span>
          </button>
        )}
      </div>

      {/* Non-Owner View */}
      {!isOwner ? (
        <div className="rounded-3xl border border-slate-200/70 bg-white/70 dark:border-slate-800/70 dark:bg-slate-900/70 p-6 shadow-xs backdrop-blur-md">
          {activeDays === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                This professional hasn't configured their schedule yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {week.map((d) => (
                <div
                  key={d.day}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="min-w-[100px] font-semibold text-sm text-slate-800 dark:text-slate-200">
                      {capitalize(d.day)}
                    </div>
                    {d.is_available ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/60 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/60 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/60 px-2.5 py-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        <XCircle className="h-3 w-3" />
                        Closed
                      </span>
                    )}
                  </div>

                  {d.is_available && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-medium sm:justify-end">
                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-100/50 dark:bg-slate-800/50 px-3 py-1.5 tabular-nums text-slate-800 dark:text-slate-200">
                        <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        {d.start_time} – {d.end_time}
                      </span>

                      {d.break_start && d.break_end && (
                        <span className="inline-flex items-center gap-1 rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/30 px-2.5 py-1 text-amber-700 dark:text-amber-400">
                          <Coffee className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                          Break: {d.break_start} – {d.break_end}
                        </span>
                      )}

                      {d.notes && (
                        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 italic">
                          <FileText className="h-3 w-3" />
                          {d.notes}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Owner Interactive View */
        <div className="space-y-3">
          {week.map((d) => (
            <div
              key={d.day}
              className={`rounded-2xl border transition-all ${
                d.is_available
                  ? 'border-blue-200 dark:border-blue-800/60 bg-blue-50/30 dark:bg-blue-950/20 shadow-xs'
                  : 'border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/60 opacity-80'
              } p-4 backdrop-blur-md`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex cursor-pointer items-center gap-3 select-none">
                  <input
                    type="checkbox"
                    checked={d.is_available}
                    onChange={(e) =>
                      updateDay(d.day, { is_available: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:checked:bg-blue-600 transition-colors cursor-pointer"
                  />
                  <span
                    className={`min-w-[90px] font-semibold text-sm ${
                      d.is_available
                        ? 'text-slate-900 dark:text-slate-100'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {capitalize(d.day)}
                  </span>
                </label>

                {d.is_available && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
                    <input
                      type="time"
                      value={d.start_time}
                      onChange={(e) =>
                        updateDay(d.day, { start_time: e.target.value })
                      }
                      className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                    />
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">
                      –
                    </span>
                    <input
                      type="time"
                      value={d.end_time}
                      onChange={(e) =>
                        updateDay(d.day, { end_time: e.target.value })
                      }
                      className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {d.is_available && (
                <div className="mt-3 grid gap-3 border-t border-blue-100/80 dark:border-blue-900/30 pt-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Break Start
                    </label>
                    <input
                      type="time"
                      value={d.break_start}
                      onChange={(e) =>
                        updateDay(d.day, { break_start: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Break End
                    </label>
                    <input
                      type="time"
                      value={d.break_end}
                      onChange={(e) =>
                        updateDay(d.day, { break_end: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Notes / Exceptions
                    </label>
                    <input
                      type="text"
                      value={d.notes}
                      onChange={(e) => updateDay(d.day, { notes: e.target.value })}
                      placeholder="e.g. By appointment only"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}