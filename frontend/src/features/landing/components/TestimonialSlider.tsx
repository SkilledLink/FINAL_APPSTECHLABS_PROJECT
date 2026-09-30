// src/features/landing/components/TestimonialSlider.tsx

import React from "react";
import { Star, Quote, CheckCircle2, ArrowRight } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Marie N.",
    role: "Customer · Yaoundé",
    initials: "MN",
    content:
      "I needed someone to fix a problem at home and had no idea who to call. SkilledLink made finding a professional much easier.",
  },
  {
    id: 2,
    name: "Patrick M.",
    role: "Business Owner · Douala",
    initials: "PM",
    content:
      "Instead of asking around for days, I was able to find a professional whose skills matched exactly what I needed.",
  },
  {
    id: 3,
    name: "Emmanuel N.",
    role: "Electrician · Yaoundé",
    initials: "EN",
    content:
      "SkilledLink gives me a professional place to show my skills and makes it easier for customers to discover my work.",
  },
];

const TestimonialSlider: React.FC = () => {
  return (
    <section
      id="reviews"
      className="relative overflow-hidden bg-[#f8fafc] px-6 py-24 font-sans sm:py-28"
    >
      {/* Subtle background decoration */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-80 w-80 rounded-full bg-blue-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-slate-200/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* =========================
            HEADER
        ========================== */}
        <div className="grid items-end gap-8 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-600">
              What people say
            </span>

            <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-[#06142e] sm:text-5xl">
              Good work
              <br />
              <span className="text-blue-600">
                speaks for itself.
              </span>
            </h2>
          </div>

          <p className="max-w-xl text-lg leading-8 text-slate-600 lg:pb-1">
            From customers looking for help to professionals building their
            reputation, SkilledLink makes it easier for people to connect
            around real work.
          </p>
        </div>

        {/* =========================
            TESTIMONIAL AREA
        ========================== */}
        <div className="mt-14 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

          {/* =========================
              FEATURED TESTIMONIAL
          ========================== */}
          <div className="relative overflow-hidden rounded-[2rem] bg-[#06142e] p-8 shadow-xl sm:p-10 lg:p-12">
            
            {/* Decorative quote */}
            <Quote className="absolute right-8 top-8 h-24 w-24 text-white/[0.04]" />

            <div className="relative">

              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className="h-5 w-5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Main testimonial */}
              <blockquote className="mt-8 max-w-2xl text-2xl font-medium leading-relaxed text-white sm:text-3xl">
                “{testimonials[0].content}”
              </blockquote>

              {/* Customer */}
              <div className="mt-10 flex items-center gap-4">

                {/* Initial avatar */}
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white ring-4 ring-white/10">
                  {testimonials[0].initials}
                </div>

                <div>
                  <p className="font-bold text-white">
                    {testimonials[0].name}
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    {testimonials[0].role}
                  </p>
                </div>
              </div>

              {/* Verified */}
              <div className="mt-10 flex items-center gap-2 text-sm font-semibold text-blue-400">
                <CheckCircle2 className="h-4 w-4" />
                Verified experience
              </div>
            </div>
          </div>

          {/* =========================
              SMALL TESTIMONIALS
          ========================== */}
          <div className="grid gap-6">

            {testimonials.slice(1).map((testimonial) => (
              <div
                key={testimonial.id}
                className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8"
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <div className="relative mt-5">
                  <Quote className="absolute -right-1 -top-2 h-8 w-8 text-blue-600/10" />

                  <p className="relative pr-6 leading-7 text-slate-600">
                    “{testimonial.content}”
                  </p>
                </div>

                {/* Person */}
                <div className="mt-6 flex items-center gap-3">

                  {/* Initial avatar */}
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-[#06142e]">
                    {testimonial.initials}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#06142e]">
                      {testimonial.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* =========================
            BOTTOM STRIP
        ========================== */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row">

          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />

            <p className="text-sm font-medium text-slate-500">
              Real people. Real experiences. Real work.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700"
          >
            See more stories
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default TestimonialSlider;