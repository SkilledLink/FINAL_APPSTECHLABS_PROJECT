// src/features/landing/components/TradesMarquee.tsx

import React from "react";

const trades = [
  {
    name: "Electrician",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/0/04/Electrician_at_work.jpg",
  },
  {
    name: "Plumber",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/a/af/Cameroon_male_plumbier_at_work_01.jpg",
  },
  {
    name: "Carpenter",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/33/Carpenter_at_work_1.jpg",
  },
  {
    name: "Mason",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/7/7c/Cameroon_male_mason_at_work.jpg",
  },
  {
    name: "Mechanic",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/9/9a/M%C3%A9canicien_au_travail.jpg",
  },
  {
    name: "Welder",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/5/59/Soudeur2.jpg",
  },
];

const TradesMarquee: React.FC = () => {
  const marqueeItems = [...trades, ...trades];

  return (
    <section
      id="trades"
      className="relative overflow-hidden bg-[#f0f4f8] py-20 font-sans"
    >
      {/* =====================================================
          BACKGROUND
          Same style as AppLayout, but much more subtle
      ====================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {/* Polygon geometry */}
        <div className="absolute inset-0 opacity-15">
          <svg
            className="h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 1200 1000"
          >
            <defs>
              <linearGradient
                id="trades-poly-grad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="#2563EB"
                  stopOpacity="0.15"
                />

                <stop
                  offset="100%"
                  stopColor="#1E40AF"
                  stopOpacity="0.02"
                />
              </linearGradient>
            </defs>

            {/* Top-left polygon */}
            <polygon
              points="50,20 320,180 180,420 20,310"
              fill="url(#trades-poly-grad)"
              stroke="#2563EB"
              strokeWidth="0.5"
            />

            {/* Top-right polygon */}
            <polygon
              points="650,80 920,40 980,320 720,480"
              fill="url(#trades-poly-grad)"
              stroke="#2563EB"
              strokeWidth="0.5"
            />

            {/* Bottom-left triangle */}
            <polygon
              points="180,620 480,780 120,920"
              fill="url(#trades-poly-grad)"
              stroke="#2563EB"
              strokeWidth="0.5"
            />

            {/* Bottom-right triangle */}
            <polygon
              points="820,540 1150,710 980,940"
              fill="url(#trades-poly-grad)"
              stroke="#2563EB"
              strokeWidth="0.5"
            />

            {/* Center triangle */}
            <polygon
              points="400,200 600,120 550,380"
              fill="url(#trades-poly-grad)"
              stroke="#2563EB"
              strokeWidth="0.5"
            />
          </svg>
        </div>

        {/* Soft ambient blue glow */}
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blue-400/15 blur-3xl" />

        {/* Soft ambient indigo glow */}
        <div className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <div className="relative z-10">
        {/* Section heading */}
        <div className="mx-auto mb-12 max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-[3px] w-10 rounded-full bg-[#2563EB]" />

              <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#2563EB]">
                SkilledLink
              </span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl lg:text-5xl">
              Skilled people.
              <br />
              <span className="text-[#2563EB]">Real trades.</span>
            </h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-[#64748B] sm:text-lg">
              From building and electrical work to plumbing, mechanics and
              welding — discover skilled people doing real work across
              Cameroon.
            </p>
          </div>
        </div>

        {/* =================================================
            PHOTO MARQUEE
        ================================================== */}
        <div className="relative w-full overflow-hidden">
          {/* Left fade */}
          <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-20 bg-gradient-to-r from-[#f0f4f8] to-transparent sm:w-32" />

          {/* Right fade */}
          <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-20 bg-gradient-to-l from-[#f0f4f8] to-transparent sm:w-32" />

          <div className="trades-marquee flex w-max gap-6">
            {marqueeItems.map((trade, index) => (
              <article
                key={`${trade.name}-${index}`}
                className="group w-[280px] shrink-0 sm:w-[340px]"
              >
                {/* =========================================
                    REAL WORKER PHOTO
                ========================================== */}
                <div className="relative h-[250px] overflow-hidden rounded-2xl bg-slate-200 shadow-lg sm:h-[290px]">
                  <img
                    src={trade.image}
                    alt={`${trade.name} working in Cameroon`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Dark fade at bottom of image */}
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

                  {/* Trade name */}
                  <div className="absolute bottom-5 left-5">
                    <h3 className="text-2xl font-extrabold text-white drop-shadow-lg">
                      {trade.name}
                    </h3>

                    <div className="mt-2 h-1 w-10 rounded-full bg-[#F5C542]" />
                  </div>
                </div>

                {/* Label underneath */}
                <div className="mt-3 flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B]">
                    Skilled Professional
                  </span>

                  <span className="text-xs font-semibold text-[#2563EB]">
                    Cameroon
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Bottom message */}
        <div className="mx-auto mt-12 max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-3 text-sm font-medium text-[#64748B]">
            <span className="h-2 w-2 rounded-full bg-[#F5C542]" />

            <span>
              Real people. Real skills. Across Cameroon.
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          MARQUEE ANIMATION
      ====================================================== */}
      <style>{`
        .trades-marquee {
          animation: trades-scroll 45s linear infinite;
          padding-left: 24px;
        }

        .trades-marquee:hover {
          animation-play-state: paused;
        }

        @keyframes trades-scroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(calc(-50% - 12px));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .trades-marquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
};

export default TradesMarquee;