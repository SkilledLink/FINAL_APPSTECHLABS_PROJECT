// src/features/landing/components/StatsGrid.tsx

import React from "react";
import { ArrowRight, CheckCircle2, Wrench } from "lucide-react";
import StressedPerson from "../../../assets/images/stressed-person.jpg";

const StatsGrid: React.FC = () => {
  return (
    <section id="need-work" className="relative overflow-hidden bg-[#f8fafc] px-6 py-20 font-sans sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">

          {/* IMAGE SIDE */}
          <div className="relative">
            {/* Image frame */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-100 p-2 shadow-xl">
              <img
                src={StressedPerson}
                alt="Person tired from dealing with household problems"
                className="h-auto max-h-[560px] w-full rounded-[1.6rem] object-contain"
              />

              {/* Small overlay */}
              <div className="absolute bottom-6 left-6 rounded-2xl bg-white/95 px-5 py-4 shadow-lg backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <Wrench className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Problem solved
                    </p>

                    <p className="text-sm font-bold text-[#06142e]">
                      Help is closer than you think.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CONTENT SIDE */}
          <div className="px-1 py-4 lg:px-4">

            {/* Small label */}
            <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
              When things go wrong
            </div>

            {/* Heading */}
            <h2 className="mt-5 max-w-xl text-3xl font-bold leading-tight tracking-tight text-[#06142e] sm:text-4xl lg:text-5xl">
              The problem is real.
              <br />
              <span className="text-blue-600">
                Finding help shouldn't be.
              </span>
            </h2>

            {/* Funny intro */}
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              The tap is leaking. The lights are off. Something needs fixing
              and suddenly you're asking everyone,
              <span className="font-semibold text-[#06142e]">
                {" "}
                "Do you know someone who can do this?"
              </span>
            </p>

            <p className="mt-4 max-w-xl leading-7 text-slate-500">
              Instead of making ten calls and hoping for the best, SkilledLink
              helps you find professionals ready to help with the job you need.
            </p>

            {/* Benefits */}
            <div className="mt-7 space-y-3">
              <Benefit text="Find professionals for the job you need" />
              <Benefit text="See skills, services and professional profiles" />
              <Benefit text="Connect without the endless searching" />
            </div>

            {/* CTA */}
            <button
              type="button"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#06142e] px-6 py-3.5 font-semibold text-white transition hover:bg-[#0b2148]"
            >
              Find a Professional
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Small bottom text */}
            <p className="mt-4 text-xs font-medium text-slate-400">
              Real skills. Real people. Real solutions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Benefit: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" />

      <span className="text-sm font-medium text-slate-700">
        {text}
      </span>
    </div>
  );
};

export default StatsGrid;