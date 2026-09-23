import { useEffect } from 'react';

/**
 * Path to the ringtone asset.
 *
 * Assumes the file lives in `public/assets/ringtones/` so Vite serves it
 * verbatim from the site root. If your file lives under `src/assets/ringtones/`
 * instead, replace this with a static import:
 *
 *   import ringtoneUrl from '../../../assets/ringtones/....mp3';
 *   const RINGTONE_SRC = ringtoneUrl;
 */
const RINGTONE_SRC =
  '../../../assets/ringtones/ElevenLabs_Cheerful_marimba_ringtone_melody,_modern_smartphone_default.mp3';

/**
 * Plays a looping ringtone while `active` is true; stops and rewinds when it
 * goes false. Safe against autoplay-blocking (logs a warning, does not crash).
 */
export function useRingtone(active: boolean, volume = 0.6): void {
  useEffect(() => {
    if (!active) return;

    const audio = new Audio(RINGTONE_SRC);
    audio.loop = true;
    audio.volume = volume;

    const promise = audio.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch((err) => {
        // Autoplay policies can block playback until the user has interacted
        // with the page at least once. Non-fatal — the UI still shows.
        console.warn('[RINGTONE] playback blocked:', err);
      });
    }

    return () => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        /* ignore */
      }
    };
  }, [active, volume]);
}