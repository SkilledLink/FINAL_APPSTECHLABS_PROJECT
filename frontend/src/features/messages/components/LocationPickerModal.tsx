// src/features/messages/components/LocationPickerModal.tsx
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Crosshair, Loader2, MapPin, Send, X } from 'lucide-react';
import {
  buildOsmEmbedUrl,
  formatCoords,
  type LocationPayload,
} from '../../../utils/locationMessage';

interface LocationPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (payload: LocationPayload) => void;
  sending?: boolean;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  open,
  onClose,
  onSend,
  sending = false,
}) => {
  const [getting, setGetting] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [label, setLabel] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
        { headers: { Accept: 'application/json' } }
      );
      if (!res.ok) return;
      const data = await res.json();
      const addr = data?.address || {};
      const parts = [
        addr.suburb || addr.neighbourhood || addr.village || addr.hamlet,
        addr.city || addr.town || addr.municipality,
        addr.state || addr.region,
        addr.country,
      ].filter(Boolean);
      if (parts.length) setLabel(parts.slice(0, 3).join(', '));
    } catch {
      /* reverse geocoding is best-effort */
    }
  };

  const handleGetCurrent = () => {
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setGetting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCoords(c);
        setGetting(false);
        void reverseGeocode(c.lat, c.lng);
      },
      (err) => {
        setGetting(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Allow access in your browser settings and try again.'
            : 'Could not get your location. Try again.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const reset = () => {
    setCoords(null);
    setLabel('');
    setNote('');
    setError(null);
    setGetting(false);
  };

  const handleClose = () => {
    if (sending) return;
    reset();
    onClose();
  };

  const canSend = !!coords && !sending;

  const handleSend = () => {
    if (!coords) return;
    onSend({
      lat: coords.lat,
      lng: coords.lng,
      label: label.trim() || undefined,
      note: note.trim() || undefined,
    });
    // Don't reset here — parent will close us after the send completes.
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-md"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/70 dark:border-slate-800/70 shrink-0">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Share your location
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={sending}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body (scrollable) */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {error && (
                <div className="rounded-xl border border-rose-200/70 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 px-3.5 py-2.5 text-[12.5px] text-rose-700 dark:text-rose-300">
                  {error}
                </div>
              )}

              {!coords && (
                <div className="space-y-3">
                  <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Share your exact location so the other person can find you
                    — a job site, your workshop, or a meeting point.
                  </p>
                  <button
                    type="button"
                    onClick={handleGetCurrent}
                    disabled={getting}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] transition active:scale-[0.98] disabled:opacity-60"
                  >
                    {getting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Getting your location…
                      </>
                    ) : (
                      <>
                        <Crosshair className="w-4 h-4" />
                        Use my current location
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
                    We use your browser's location services. Nothing is sent
                    until you tap <strong>Send location</strong>.
                  </p>
                </div>
              )}

              {coords && (
                <>
                  {/* Map preview */}
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-200/70 dark:border-slate-800/70 bg-slate-100 dark:bg-slate-800">
                    <iframe
                      title="Location preview"
                      src={buildOsmEmbedUrl(coords.lat, coords.lng, 16)}
                      className="w-full h-full border-0 pointer-events-none"
                      loading="lazy"
                      sandbox="allow-scripts allow-same-origin"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-500/30 shadow-lg" />
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 text-center tabular-nums">
                    {formatCoords(coords.lat, coords.lng)}
                  </div>

                  <button
                    type="button"
                    onClick={handleGetCurrent}
                    disabled={getting}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition disabled:opacity-60 active:scale-[0.98]"
                  >
                    {getting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Refreshing…
                      </>
                    ) : (
                      <>
                        <Crosshair className="w-3.5 h-3.5" />
                        Refresh location
                      </>
                    )}
                  </button>

                  {/* Label */}
                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Place name <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="e.g. Akwa, Douala"
                      maxLength={120}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-300/70 dark:border-slate-800/70 text-[13px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                    />
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Note <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. Meet me at the gate around 3pm"
                      maxLength={200}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-300/70 dark:border-slate-800/70 text-[13px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none transition"
                    />
                    <p className="mt-1 text-[10px] text-slate-400 text-right tabular-nums">
                      {note.length}/200
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-200/70 dark:border-slate-800/70 flex items-center justify-end gap-2 shrink-0 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={handleClose}
                disabled={sending}
                className="px-4 py-2.5 rounded-xl text-[12.5px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[12.5px] font-bold transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send location
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};