// src/features/landing/components/CTABanner.tsx

import React from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTABanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-[#06142e] px-6 py-14 text-center sm:px-12 sm:py-16">

        {/* Subtle blue glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />

        {/* Subtle geometric accent */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-blue-500/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full border border-blue-500/10" />

        <div className="relative">

          {/* Small label */}
          <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-400">
            Ready when you are
          </span>

          {/* Heading */}
          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Your next connection is{" "}
            <span className="text-blue-500">
              just a click away.
            </span>
          </h2>

          {/* Description */}
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Find the right professional for the job — or make your skills
            easier to discover.
          </p>

          {/* Main CTA */}
          <div className="mt-8">
            <button
              type="button"
              onClick={() => navigate("/home/professionals")}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25"
            >
              Find a Professional
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Professional link */}
          <p className="mt-5 text-sm text-slate-400">
            Are you a professional?{" "}
            <button
              type="button"
              onClick={() => navigate("/onboarding")}
              className="font-semibold text-blue-400 transition hover:text-blue-300"
            >
              Join SkilledLink
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;