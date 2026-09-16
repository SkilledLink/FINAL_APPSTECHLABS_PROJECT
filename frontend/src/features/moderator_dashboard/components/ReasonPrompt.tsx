import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ReasonPromptProps {
  title: string;
  description?: string;
  submitLabel?: string;
  requireNotes?: boolean;
  notesLabel?: string;
  extraField?: React.ReactNode;
  onSubmit: (reason: string, notes?: string) => void | Promise<void>;
  onCancel: () => void;
}

const ReasonPrompt: React.FC<ReasonPromptProps> = ({
  title,
  description,
  submitLabel = 'Confirm',
  requireNotes,
  notesLabel = 'Notes (optional)',
  extraField,
  onSubmit,
  onCancel,
}) => {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    if (reason.trim().length < 5) {
      setError('Reason must be at least 5 characters.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(reason.trim(), notes.trim() || undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
            )}
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Enter a reason (min 5 characters)..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
        />

        {requireNotes && (
          <>
            <label className="block text-sm font-medium text-gray-700 mt-3 mb-1">
              {notesLabel}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </>
        )}

        {extraField}

        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={submitting}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReasonPrompt;