// src/features/portfolio/components/PortfolioAvailability.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Save, Loader2, Check } from 'lucide-react';
import type { Availability } from '../../../types/portfolio';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

interface Props {
  availability: Availability[];
  onSave: (data: any[]) => Promise<void>;
}

export default function PortfolioAvailability({ availability, onSave }: Props) {
  const [slots, setSlots] = useState<{ day: string; start: string; end: string; available: boolean }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (availability.length > 0) {
      setSlots(
        availability.map((a) => ({
          day: a.day_of_week,
          start: a.start_time || '09:00',
          end: a.end_time || '17:00',
          available: a.is_available,
        }))
      );
    } else {
      setSlots(DAYS.map((day) => ({ day, start: '09:00', end: '17:00', available: true })));
    }
  }, [availability]);

  const updateSlot = (index: number, field: string, value: any) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
    if (saved) setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(
        slots.map((s) => ({
          day_of_week: s.day,
          start_time: s.available ? s.start : null,
          end_time: s.available ? s.end : null,
          is_available: s.available,
        }))
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-cyan-500/20 p-6 shadow-2xl overflow-hidden"
    >
      {/* Hydro Ambient Light Refractions */}
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-cyan-500/10 dark:bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-blue-500/10 dark:bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header Badge & Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1'0 h-10 rounded-xl bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-indigo-500/15 dark:from-cyan-500/20 dark:to-blue-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20 shadow-inner">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Weekly Schedule
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set your availability hours for clients & bookings
            </p>
          </div>
        </div>

        {/* Schedule Slots List */}
        <div className="space-y-2.5">
          {slots.map((slot, idx) => (
            <motion.div
              key={slot.day}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.25 }}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 ${
                slot.available
                  ? 'bg-white/60 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60 shadow-sm'
                  : 'bg-slate-50/40 dark:bg-slate-900/30 border-slate-200/30 dark:border-slate-800/40 opacity-60'
              }`}
            >
              {/* Day Label */}
              <span className="w-14 font-semibold text-sm text-slate-800 dark:text-slate-200">
                {DAY_LABELS[slot.day]}
              </span>

              {/* Hydro Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={slot.available}
                  onChange={(e) => updateSlot(idx, 'available', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-600 shadow-inner"></div>
              </label>

              {/* Time Inputs or Unavailable Badge */}
              {slot.available ? (
                <div className="flex items-center gap-2 ml-auto">
                  <Clock size={14} className="text-cyan-500 dark:text-cyan-400 hidden sm:block" />
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => updateSlot(idx, 'start', e.target.value)}
                    className="bg-white/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition"
                  />
                  <ArrowRight size={12} className="text-slate-400" />
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => updateSlot(idx, 'end', e.target.value)}
                    className="bg-white/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition"
                  />
                </div>
              ) : (
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 ml-auto px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/40">
                  Unavailable
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-cyan-500/20 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <AnimatePresence mode="wait">
            {saving ? (
              <motion.div
                key="saving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Loader2 size={16} className="animate-spin" />
                <span>Saving Schedule...</span>
              </motion.div>
            ) : saved ? (
              <motion.div
                key="saved"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-emerald-300"
              >
                <Check size={16} />
                <span>Schedule Saved!</span>
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                <span>Save Schedule</span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}