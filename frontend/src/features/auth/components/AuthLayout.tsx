import React from "react";
import { Headphones, CreditCard, TrendingUp } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitleLinkText?: string;
  subtitleLinkTo?: string;
  subtitlePrefix?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#E5E8EB] flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans">
      {/* Main Container Card */}
      <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[680px]">
        
        {/* Left Section: Form Area */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-between bg-white">
          {/* Top Brand Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg bg-[#1B3A2B] flex items-center justify-center text-white font-black text-sm">
              S
            </div>
            <span className="text-xl font-extrabold text-[#111827] tracking-tight">
              solara
            </span>
          </div>

          {/* Form Wrapper */}
          <div className="w-full max-w-sm mx-auto my-auto py-4">
            {children}
          </div>
        </div>

        {/* Right Section: Dark Forest Green Visual Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#122E21] p-10 flex-col justify-between relative overflow-hidden text-white">
          {/* Ambient Background Blur Glows */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#1D4A35] rounded-full blur-3xl opacity-50 pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#0A1D15] rounded-full blur-3xl opacity-60 pointer-events-none" />

          {/* Top Right Utility Link */}
          <div className="flex justify-end z-10">
            <button className="flex items-center gap-2 text-xs font-medium text-emerald-100/80 hover:text-white transition">
              <Headphones size={15} />
              <span>Support</span>
            </button>
          </div>

          {/* Floating Promotional Graphic Card */}
          <div className="z-10 my-auto py-6">
            <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-2xl relative mb-8 max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold leading-tight text-slate-900">
                    Reach financial goals faster
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Use your Venus card around the world with no hidden fees. Hold, transfer and spend money.
                  </p>
                  <button className="px-4 py-2 bg-[#122E21] text-white text-xs font-semibold rounded-full hover:bg-[#1B3A2B] transition">
                    Learn more
                  </button>
                </div>

                {/* Simulated Glass Credit Card */}
                <div className="relative">
                  <div className="bg-gradient-to-tr from-slate-700 to-slate-900 text-white rounded-xl p-3 shadow-lg transform rotate-6 hover:rotate-0 transition duration-300 border border-slate-600/50">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[9px] font-bold tracking-widest text-slate-300">Solara</span>
                      <CreditCard size={14} className="text-slate-300" />
                    </div>
                    <p className="text-[10px] font-mono tracking-wider text-slate-200 mb-2">
                      7812 2139 0823 XXXX
                    </p>
                    <div className="flex justify-between text-[8px] text-slate-400">
                      <span>VALID THRU</span>
                      <span>08/28</span>
                    </div>
                  </div>

                  {/* Earnings Pill Badge */}
                  <div className="absolute -bottom-3 -left-3 bg-white border border-slate-100 shadow-md rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-slate-800">
                    <TrendingUp size={12} className="text-emerald-600" />
                    <div>
                      <span className="block text-[8px] text-slate-400 uppercase font-semibold">Earnings</span>
                      <span className="text-[11px] font-extrabold">$350.40</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Content Announcement */}
            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Introducing new features
              </h2>
              <p className="text-xs text-emerald-100/70 leading-relaxed">
                Analyzing previous trends ensures that businesses always make the right decision. And as the scale of the decision and its impact magnifies...
              </p>
            </div>
          </div>

          {/* Carousel Slider Indicators */}
          <div className="flex items-center justify-center gap-1.5 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
          </div>
        </div>

      </div>
    </div>
  );
};