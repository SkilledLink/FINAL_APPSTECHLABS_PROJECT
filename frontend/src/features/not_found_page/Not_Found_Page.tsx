import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f0f4f8] px-6 py-16 font-sans text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      {/* ═══════════ BACKGROUND LAYER — same as AppLayout ═══════════ */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {/* Polygon geometry */}
        <div className="absolute inset-0 opacity-40 dark:opacity-25">
          <svg
            className="h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient
                id="notfound-poly-grad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <polygon points="50,20 320,180 180,420 20,310" fill="url(#notfound-poly-grad)" stroke="#2563EB" strokeWidth="0.5" />
            <polygon points="650,80 920,40 980,320 720,480" fill="url(#notfound-poly-grad)" stroke="#2563EB" strokeWidth="0.5" />
            <polygon points="180,620 480,780 120,920" fill="url(#notfound-poly-grad)" stroke="#2563EB" strokeWidth="0.5" />
            <polygon points="820,540 1150,710 980,940" fill="url(#notfound-poly-grad)" stroke="#2563EB" strokeWidth="0.5" />
            <polygon points="400,200 600,120 550,380" fill="url(#notfound-poly-grad)" stroke="#2563EB" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Ambient glows */}
        <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-blue-400/30 blur-3xl dark:bg-blue-600/20" />
        <div className="absolute bottom-1/4 -right-32 h-96 w-96 rounded-full bg-indigo-400/30 blur-3xl dark:bg-indigo-600/20" />
      </div>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
        {/* 404 */}
        <div className="relative">
          <h1
            className="
              select-none
              text-[110px]
              font-black
              leading-none
              tracking-[-0.08em]
              text-slate-900
              sm:text-[150px]
              md:text-[190px]
              dark:text-white
            "
          >
            404
          </h1>

          {/* Small blue line */}
          <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-blue-600" />
        </div>

        {/* Title */}
        <h2
          className="
            mt-8
            text-2xl
            font-bold
            tracking-tight
            text-slate-900
            sm:text-3xl
            md:text-4xl
            dark:text-white
          "
        >
          Oops! Page not found.
        </h2>

        {/* Description */}
        <p
          className="
            mx-auto
            mt-4
            max-w-xl
            text-sm
            leading-7
            text-slate-600
            sm:text-base
            dark:text-slate-400
          "
        >
          The page you're looking for doesn't exist, has been moved,
          or is no longer available. Let's get you back to discovering
          jobs and opportunities.
        </p>

        {/* ─────────────────────────────────────────────
            Action buttons
        ───────────────────────────────────────────── */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {/* Home */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="
              group
              inline-flex
              min-w-[150px]
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-slate-900
              px-6
              py-3
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-blue-600
              hover:shadow-lg
              hover:shadow-blue-600/20
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:ring-offset-2
              dark:bg-white
              dark:text-slate-900
              dark:hover:bg-blue-500
              dark:hover:text-white
              dark:focus:ring-offset-slate-950
            "
          >
            Go to Home
            <span className="text-base transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </button>

          {/* Find Jobs */}
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="
              inline-flex
              min-w-[150px]
              items-center
              justify-center
              rounded-xl
              border
              border-slate-300
              bg-white/80
              px-6
              py-3
              text-sm
              font-semibold
              text-slate-700
              backdrop-blur-sm
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:border-blue-500
              hover:text-blue-600
              hover:shadow-md
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:ring-offset-2
              dark:border-slate-700
              dark:bg-slate-900/70
              dark:text-slate-300
              dark:hover:border-blue-500
              dark:hover:text-blue-400
              dark:focus:ring-offset-slate-950
            "
          >
            Find Jobs
          </button>

          {/* Go Back */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              inline-flex
              min-w-[150px]
              items-center
              justify-center
              rounded-xl
              px-6
              py-3
              text-sm
              font-semibold
              text-slate-600
              transition-colors
              duration-200
              hover:text-blue-600
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              dark:text-slate-400
              dark:hover:text-blue-400
            "
          >
            ← Go Back
          </button>
        </div>

        {/* Bottom message */}
        <div
          className="
            mt-10
            flex
            items-center
            justify-center
            gap-2
            text-xs
            text-slate-500
            dark:text-slate-500
          "
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span>Your next opportunity is just a click away.</span>
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
        </div>
      </div>
    </section>
  );
}