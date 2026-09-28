import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { MessageSquare, ArrowLeft, Sparkles } from 'lucide-react';
import { AIChat } from './AIChat';
import { AIBackground } from './AIBackground';
import { useAIChat } from '../hooks/useAIChat';

/* ------------------------------------------------------------------ */
/*  Floating button geometry / persistence helpers                    */
/* ------------------------------------------------------------------ */
const BUTTON_SIZE = 56; // matches w-14 h-14
const EDGE_PADDING = 8;
const STORAGE_KEY = 'skilledlink:ai-widget-position';

interface Point {
  x: number;
  y: number;
}

function getDefaultPosition(): Point {
  if (typeof window === 'undefined') return { x: 320, y: 520 };
  const isMd = window.innerWidth >= 768;
  return {
    x: window.innerWidth - BUTTON_SIZE - 24,
    // bottom-36 on mobile (144px), bottom-6 on md+ (24px)
    y: window.innerHeight - BUTTON_SIZE - (isMd ? 24 : 144),
  };
}

function clampPosition({ x, y }: Point): Point {
  if (typeof window === 'undefined') return { x, y };
  const maxX = Math.max(EDGE_PADDING, window.innerWidth - BUTTON_SIZE - EDGE_PADDING);
  const maxY = Math.max(EDGE_PADDING, window.innerHeight - BUTTON_SIZE - EDGE_PADDING);
  return {
    x: Math.min(Math.max(x, EDGE_PADDING), maxX),
    y: Math.min(Math.max(y, EDGE_PADDING), maxY),
  };
}

function loadPosition(): Point {
  if (typeof window === 'undefined') return getDefaultPosition();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Point>;
      if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
        return clampPosition({ x: parsed.x, y: parsed.y });
      }
    }
  } catch {
    /* ignore malformed storage */
  }
  return getDefaultPosition();
}

export function AIFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const chat = useAIChat();

  /* ---------------- tooltip timers ---------------- */
  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;

    const popupTimer = setTimeout(() => {
      setShowTooltip(true);
      fadeTimer = setTimeout(() => setShowTooltip(false), 20000);
    }, 180000);

    return () => {
      clearTimeout(popupTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, []);

  /* ---------------- draggable position ---------------- */
  const [position, setPosition] = useState<Point>(loadPosition);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef({
    dragging: false,
    moved: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  // Keep the button inside the viewport when the window is resized
  useEffect(() => {
    const handleResize = () => setPosition(prev => clampPosition(prev));
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const persistPosition = (next: Point) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage may be unavailable */
    }
  };

  const handleButtonPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    // Only respond to primary button for mouse
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const drag = dragRef.current;
    drag.dragging = true;
    drag.moved = false;
    drag.pointerId = e.pointerId;
    drag.startX = e.clientX;
    drag.startY = e.clientY;
    drag.originX = position.x;
    drag.originY = position.y;

    buttonRef.current?.setPointerCapture(e.pointerId);
  };

  const handleButtonPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag.dragging || e.pointerId !== drag.pointerId) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    // Small threshold so a normal tap/click isn't treated as a drag
    if (!drag.moved && Math.hypot(dx, dy) > 4) drag.moved = true;

    if (drag.moved) {
      setPosition(clampPosition({ x: drag.originX + dx, y: drag.originY + dy }));
    }
  };

  const handleButtonPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag.dragging) return;

    drag.dragging = false;

    if (buttonRef.current?.hasPointerCapture(e.pointerId)) {
      buttonRef.current.releasePointerCapture(e.pointerId);
    }

    if (drag.moved) {
      // Persist the final resting position
      setPosition(prev => {
        const clamped = clampPosition(prev);
        persistPosition(clamped);
        return clamped;
      });

      // Swallow the trailing click event
      window.setTimeout(() => {
        dragRef.current.moved = false;
      }, 250);
    } else {
      dragRef.current.moved = false;
    }
  };

  const handleOpen = () => {
    // Ignore the click that follows a drag gesture
    if (dragRef.current.moved) return;
    setShowTooltip(false);
    setIsOpen(true);
  };

  const handleClose = () => setIsOpen(false);

  // Show tooltip below the button when it's dragged near the top edge
  const tooltipBelow = position.y < 110;

  return (
    <>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col overflow-hidden bg-[#f0f4f8] transition-colors dark:bg-slate-950">
          <AIBackground />

          <header className="relative z-40 flex shrink-0 items-center justify-between border-b border-slate-200/70 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/70">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-2 text-slate-600 transition-colors hover:bg-white/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/30">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    AI Assistant
                  </h2>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    SkilledLink Concierge
                  </p>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 ring-1 ring-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" />
              Online
            </span>
          </header>

          <main className="relative z-10 min-h-0 flex-1">
            <AIChat chat={chat} />
          </main>
        </div>
      ) : (
        <div
          className="fixed z-40"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            touchAction: 'none',
          }}
        >
          <div className="relative">
            {showTooltip && (
              <div
                className={`absolute right-0 flex items-center gap-2 whitespace-nowrap rounded-2xl rounded-br-md border border-white/10 bg-slate-900/90 px-4 py-2.5 text-xs font-medium text-white shadow-2xl backdrop-blur-xl duration-300 animate-in fade-in dark:bg-slate-800/90 ${
                  tooltipBelow
                    ? 'top-full mt-2 slide-in-from-top-1'
                    : 'bottom-full mb-2 slide-in-from-bottom-1'
                }`}
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                <span>Hello, do you need help?</span>
                <button
                  type="button"
                  onClick={() => setShowTooltip(false)}
                  className="ml-1 text-xs text-slate-400 hover:text-white"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>
            )}

            <button
              ref={buttonRef}
              type="button"
              onClick={handleOpen}
              onPointerDown={handleButtonPointerDown}
              onPointerMove={handleButtonPointerMove}
              onPointerUp={handleButtonPointerUp}
              onPointerCancel={handleButtonPointerUp}
              className="group relative flex h-14 w-14 cursor-grab select-none items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_10px_30px_-8px_rgba(37,99,235,0.7)] transition-[transform,box-shadow] duration-200 hover:scale-105 hover:shadow-[0_14px_40px_-8px_rgba(37,99,235,0.9)] active:scale-95 active:cursor-grabbing"
              aria-label="Open AI Assistant (drag to move)"
              title="Click to open · drag to move"
            >
              <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-blue-500/40 opacity-75" />
              <MessageSquare className="relative h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}