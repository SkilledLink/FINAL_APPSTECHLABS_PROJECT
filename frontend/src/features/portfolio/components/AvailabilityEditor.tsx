import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save } from 'lucide-react';
import type{ Availability } from '../../../api/portfolioApi';

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

interface AvailabilityEditorProps {
  availability: Availability[];
  onSave: (data: { day_of_week: string; start_time: string | null; end_time: string | null; is_available: boolean }[]) => Promise<void>;
}

export default function AvailabilityEditor({ availability, onSave }: AvailabilityEditorProps) {
  const [slots, setSlots] = useState<{ day_of_week: string; start_time: string; end_time: string; is_available: boolean }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (availability.length > 0) {
      setSlots(availability.map(a => ({
        day_of_week: a.day_of_week,
        start_time: a.start_time || '09:00',
        end_time: a.end_time || '17:00',
        is_available: a.is_available,
      })));
    } else {
      // Default: all days available 9-5
      setSlots(DAYS.map(day => ({
        day_of_week: day,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true,
      })));
    }
  }, [availability]);

  const updateSlot = (index: number, field: string, value: any) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(slots);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-blue-400/20 dark:border-blue-400/20 p-4 shadow-lg">
      <div className="space-y-3">
        {slots.map((slot, index) => (
          <motion.div
            key={slot.day_of_week}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 flex-wrap"
          >
            <div className="w-16 font-medium text-slate-700 dark:text-slate-300 text-sm">
              {DAY_LABELS[slot.day_of_week]}
            </div>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="checkbox"
                checked={slot.is_available}
                onChange={(e) => updateSlot(index, 'is_available', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <input
                type="time"
                value={slot.start_time}
                onChange={(e) => updateSlot(index, 'start_time', e.target.value)}
                disabled={!slot.is_available}
                className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm disabled:opacity-50 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
              />
              <span className="text-slate-500 dark:text-slate-400 text-sm">to</span>
              <input
                type="time"
                value={slot.end_time}
                onChange={(e) => updateSlot(index, 'end_time', e.target.value)}
                disabled={!slot.is_available}
                className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm disabled:opacity-50 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
              />
            </div>
          </motion.div>
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Save size={16} /> {saving ? 'Saving...' : 'Save Availability'}
      </button>
    </div>
  );
}