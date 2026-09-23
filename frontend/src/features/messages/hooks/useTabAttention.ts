import { useEffect } from 'react';

const FAVICON_SELECTOR = 'link[rel~="icon"]';

function getFaviconEl(): HTMLLinkElement | null {
  return document.querySelector<HTMLLinkElement>(FAVICON_SELECTOR);
}

/** Inline SVG favicon — a red dot with a white center. */
const RED_DOT_FAVICON =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
      '<circle cx="16" cy="16" r="14" fill="#ef4444"/>' +
      '<circle cx="16" cy="16" r="6" fill="#ffffff"/>' +
      '</svg>'
  );

/**
 * While `active` is true, alternates `document.title` between the original
 * title and `message` every 1.5s, and swaps the favicon for a red dot.
 * Everything is restored on deactivate or unmount.
 */
export function useTabAttention(active: boolean, message: string): void {
  useEffect(() => {
    if (!active) return;

    const originalTitle = document.title;
    const faviconEl = getFaviconEl();
    const originalFavicon = faviconEl?.href ?? null;

    if (faviconEl) faviconEl.href = RED_DOT_FAVICON;

    let toggle = false;
    const flash = () => {
      document.title = toggle ? originalTitle : message;
      toggle = !toggle;
    };
    flash();
    const id = window.setInterval(flash, 1500);

    return () => {
      window.clearInterval(id);
      document.title = originalTitle;
      if (faviconEl && originalFavicon) faviconEl.href = originalFavicon;
    };
  }, [active, message]);
}