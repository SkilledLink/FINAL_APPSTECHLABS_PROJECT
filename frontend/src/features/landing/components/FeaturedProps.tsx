// src/features/landing/components/FeaturedProps.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  MapPin,
  Star,
  BriefcaseBusiness,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const FeaturedProps: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section
      id="professionals"
      className="relative overflow-hidden bg-white py-24 font-sans sm:py-28"
    >
      {/* Very subtle background shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg
          className="absolute right-0 top-0 h-full w-full opacity-[0.035]"
          viewBox="0 0 1200 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon
            points="850,0 1200,100 1080,420 780,280"
            fill="#2563EB"
          />
          <polygon
            points="0,620 300,500 420,800 0,800"
            fill="#1E3A8A"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* =========================
            TOP INTRO
        ========================== */}
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          {/* LEFT */}
          <div>
            {/* Small label */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
              <BriefcaseBusiness className="h-4 w-4" />
              For Professionals
            </div>

            {/* Heading */}
            <h2 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-[#06142e] sm:text-5xl lg:text-6xl">
              Build your professional{" "}
              <span className="text-blue-600">presence.</span>
            </h2>

            {/* Description */}
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Create a profile that shows your skills, experience and
              services — and make it easier for customers across Cameroon
              to find you.
            </p>

            {/* Button */}
            <div className="mt-8">
              <button
                type="button"
                onClick={() => navigate("/onboarding")}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Create Your Profile
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Trust points */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <TrustPoint text="Get discovered" />
              <TrustPoint text="Build trust" />
              <TrustPoint text="Grow your work" />
            </div>
          </div>

          {/* RIGHT — PROFILE CARD */}
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-blue-100/60 blur-3xl" />
            <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-slate-100 blur-3xl" />

            {/* Main card */}
            <div className="relative mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.10)] sm:p-8">
              {/* Card header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Professional Profile
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#06142e]">
                      SkilledLink
                    </h3>

                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                  </div>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                  Verified
                </span>
              </div>

              {/* Profile */}
              <div className="mt-6 flex items-center gap-4">
                {/* Avatar */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-[#06142e]">
                  EN
                </div>

                <div className="min-w-0">
                  <h4 className="truncate text-xl font-bold text-[#06142e]">
                    Emmanuel N.
                  </h4>

                  <p className="mt-1 text-sm font-medium text-blue-600">
                    Electrician
                  </p>

                  <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" />
                    Yaoundé
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                  <span className="text-sm font-medium text-slate-700">
                    Available for work
                  </span>
                </div>

                <span className="text-xs font-medium text-slate-400">
                  Today
                </span>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-100 bg-white py-4">
                <ProfileStat
                  value="4.9"
                  label="Rating"
                  icon={<Star className="h-4 w-4" />}
                />

                <ProfileStat
                  value="28"
                  label="Jobs"
                  icon={<BriefcaseBusiness className="h-4 w-4" />}
                />

                <ProfileStat
                  value="3+"
                  label="Years"
                  icon={<ShieldCheck className="h-4 w-4" />}
                />
              </div>

              {/* Skills */}
              <div className="mt-6">
                <p className="text-sm font-semibold text-[#06142e]">
                  Skills & Services
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <SkillTag text="Electrical Wiring" />
                  <SkillTag text="Solar Installation" />
                  <SkillTag text="Repairs" />
                  <SkillTag text="Maintenance" />
                </div>
              </div>

              {/* Profile strength */}
              <div className="mt-7">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Profile strength
                  </span>

                  <span className="text-sm font-bold text-[#06142e]">
                    92%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[92%] rounded-full bg-blue-600" />
                </div>
              </div>

              {/* View professional profile */}
              <button
                type="button"
                onClick={() => navigate("/home/professionals")}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#06142e] px-5 py-3.5 font-semibold text-white transition hover:bg-[#0b2148]"
              >
                View Professional Profile
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Floating notification */}
            <div className="absolute -bottom-6 -left-5 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <BriefcaseBusiness className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    New opportunity
                  </p>

                  <p className="text-sm font-bold text-[#06142e]">
                    Customer near you
                  </p>
                </div>
              </div>
            </div>

            {/* Floating rating */}
            <div className="absolute -right-5 top-10 hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl sm:block">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                  <Star className="h-4 w-4 text-blue-600" />
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Customer rating
                  </p>

                  <p className="text-sm font-bold text-[#06142e]">
                    4.9 / 5
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            BOTTOM INFO STRIP
        ========================== */}
        <div className="mt-24 border-t border-slate-200 pt-10">
          <div className="grid gap-8 md:grid-cols-3">
            <InfoBlock
              number="01"
              title="Create your profile"
              text="Show customers what you can do, where you work and the services you offer."
            />

            <InfoBlock
              number="02"
              title="Get discovered"
              text="Build a professional presence that helps customers find the right skills."
            />

            <InfoBlock
              number="03"
              title="Grow your work"
              text="Turn your professional presence into new opportunities and connections."
            />
          </div>
        </div>
      </div>
    </section>
  );
};

/* =========================
   SMALL COMPONENTS
========================= */

const TrustPoint: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" />

      <span className="text-sm font-medium text-slate-700">
        {text}
      </span>
    </div>
  );
};

const ProfileStat: React.FC<{
  value: string;
  label: string;
  icon: React.ReactNode;
}> = ({ value, label, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center px-3 text-center">
      <div className="mb-1 flex items-center gap-1 text-blue-600">
        {icon}

        <span className="text-lg font-bold text-[#06142e]">
          {value}
        </span>
      </div>

      <span className="text-xs font-medium text-slate-400">
        {label}
      </span>
    </div>
  );
};

const SkillTag: React.FC<{ text: string }> = ({ text }) => {
  return (
    <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
      {text}
    </span>
  );
};

const InfoBlock: React.FC<{
  number: string;
  title: string;
  text: string;
}> = ({ number, title, text }) => {
  return (
    <div className="flex gap-4">
      <span className="text-sm font-bold text-blue-600">
        {number}
      </span>

      <div>
        <h4 className="font-bold text-[#06142e]">
          {title}
        </h4>

        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
};

export default FeaturedProps;