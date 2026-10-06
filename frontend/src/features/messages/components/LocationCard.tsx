// src/features/messages/components/LocationCard.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, ExternalLink, MapPin } from 'lucide-react';
import {
  buildGoogleMapsUrl,
  buildOsmEmbedUrl,
  formatCoords,
  type LocationPayload,
} from '../../../utils/locationMessage';

interface LocationCardProps {
  location: LocationPayload;
  isSender: boolean;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  isSender,
}) => {
  const [copied, setCopied] = useState(false);

  const mapsUrl = buildGoogleMapsUrl(location.lat, location.lng);
  const embedUrl = buildOsmEmbedUrl(location.lat, location.lng);

  const handleCopy = async () => {
    const text = [
      location.label ? `📍 ${location.label}` : '📍 Shared location',
      formatCoords(location.lat, location.lng),
      location.note ? `\n${location.note}` : '',
      `\n${mapsUrl}`,
    ]
      .filter(Boolean)
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — silently ignore */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={`w-[280px] sm:w-[320px] rounded-2xl overflow-hidden border shadow-[0_4px_16px_-8px_rgba(15,23,42,0.2)] ${
        isSender
          ? 'border-blue-400/40 bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
          : 'border-slate-200/70 bg-white dark:border-slate-800/70 dark:bg-slate-900 dark:text-slate-100'
      }`}
    >
      {/* ── Header strip ─────────────────────────────────── */}
      <div
        className={`flex items-center gap-2 px-3 py-2 text-[10.5px] font-bold uppercase tracking-wider ${
          isSender
            ? 'bg-black/20 text-white'
            : 'bg-slate-100/80 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300'
        }`}
      >
        <MapPin className="w-3.5 h-3.5" />
        <span>Shared location</span>
      </div>

      {/* ── Map preview ──────────────────────────────────── */}
      <div className="relative w-full h-40 bg-slate-100 dark:bg-slate-800">
        <iframe
          title="Shared location map"
          src={embedUrl}
          className="w-full h-full border-0 pointer-events-none"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        />

        {/* Centre pin overlay (visual anchor even if iframe is slow) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-500/30 shadow-lg" />
        </div>

        {/* Bottom gradient for readability */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
      </div>

      {/* ── Details ──────────────────────────────────────── */}
      <div className="p-3 space-y-1.5">
        {location.label && (
          <p
            className={`text-[13px] font-semibold leading-tight truncate ${
              isSender ? 'text-white' : 'text-slate-900 dark:text-slate-100'
            }`}
            title={location.label}
          >
            {location.label}
          </p>
        )}

        <p
          className={`text-[11px] font-mono tabular-nums ${
            isSender
              ? 'text-blue-100/90'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {formatCoords(location.lat, location.lng)}
        </p>

        {location.note && (
          <p
            className={`text-[12px] leading-snug pt-1 border-t ${
              isSender
                ? 'text-blue-50 border-white/15'
                : 'text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-800/60'
            }`}
          >
            {location.note}
          </p>
        )}

        {/* ── Actions ────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 pt-2">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11.5px] font-bold transition active:scale-[0.97] ${
              isSender
                ? 'bg-white text-blue-700 hover:bg-blue-50'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open in Maps
          </a>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void handleCopy();
            }}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11.5px] font-bold transition active:scale-[0.97] ${
              isSender
                ? 'bg-white/15 text-white hover:bg-white/25'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};