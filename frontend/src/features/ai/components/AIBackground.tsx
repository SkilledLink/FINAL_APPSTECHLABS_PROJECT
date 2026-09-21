// src/features/ai/components/AIBackground.tsx
/**
 * Shared decorative background — matches AppLayout's polygon +
 * ambient glow layer so the AI surfaces blend seamlessly into
 * the rest of the app.
 *
 * Drop inside a `relative` parent. It renders an absolutely
 * positioned, pointer-events-none layer at z-0.
 */
export function AIBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Polygon geometry — mirrors AppLayout / AuthLayout */}
      <div className="absolute inset-0 opacity-40 dark:opacity-25">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient
              id="ai-poly-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <polygon
            points="50,20 320,180 180,420 20,310"
            fill="url(#ai-poly-grad)"
            stroke="#2563EB"
            strokeWidth="0.5"
          />
          <polygon
            points="650,80 920,40 980,320 720,480"
            fill="url(#ai-poly-grad)"
            stroke="#2563EB"
            strokeWidth="0.5"
          />
          <polygon
            points="180,620 480,780 120,920"
            fill="url(#ai-poly-grad)"
            stroke="#2563EB"
            strokeWidth="0.5"
          />
          <polygon
            points="820,540 1150,710 980,940"
            fill="url(#ai-poly-grad)"
            stroke="#2563EB"
            strokeWidth="0.5"
          />
          <polygon
            points="400,200 600,120 550,380"
            fill="url(#ai-poly-grad)"
            stroke="#2563EB"
            strokeWidth="0.5"
          />
        </svg>
      </div>

      {/* Ambient glows — top-left blue, bottom-right indigo */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-blue-400/30 dark:bg-blue-600/20 blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-indigo-400/30 dark:bg-indigo-600/20 blur-3xl" />
    </div>
  );
}