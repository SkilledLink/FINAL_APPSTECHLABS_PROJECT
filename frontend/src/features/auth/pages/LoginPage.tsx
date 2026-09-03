<<<<<<< HEAD
import { LoginForm } from "../components/LoginForm";
import { useNavigate } from "react-router-dom";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');`;

const PANEL_ANIMATION = `
@keyframes vantage-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(4%, -3%) scale(1.05); }
  66% { transform: translate(-3%, 4%) scale(0.97); }
}
.vantage-blob { animation: vantage-drift 14s ease-in-out infinite; }
.vantage-blob-2 { animation-delay: -5s; animation-duration: 18s; }
.vantage-blob-3 { animation-delay: -9s; animation-duration: 16s; }
`;

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row overflow-hidden">
      <style>{FONT_IMPORT + PANEL_ANIMATION}</style>

      {/* LEFT — identity panel */}
      <div className="relative lg:w-[46%] w-full h-[30vh] lg:h-screen bg-[#0F172A] overflow-hidden flex flex-col justify-between">
        <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full bg-[#4F46E5]/40 blur-3xl vantage-blob" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#F59E0B]/30 blur-3xl vantage-blob vantage-blob-2" />
        <div className="absolute top-1/3 right-1/4 w-56 h-56 rounded-full bg-[#6366F1]/30 blur-3xl vantage-blob vantage-blob-3" />

        <div className="relative z-10 px-8 lg:px-12 pt-8 lg:pt-12" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-[#F59E0B]" />
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">Vantage</span>
          </div>
        </div>

        <div className="relative z-10 px-8 lg:px-12 pb-8 lg:pb-14 max-w-md" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
          <p className="text-white text-xl lg:text-[28px] leading-[1.3] font-semibold hidden lg:block">
            Access carries weight when it's earned, not assumed.
          </p>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-10 lg:py-0 bg-white">
        <div className="w-full max-w-[400px]">
          <LoginForm onSuccess={() => navigate("/dashboard")} />
        </div>
      </div>
    </div>
  );
}
=======
import React from "react";
import { LoginForm } from "../components/LoginForm";

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-[#eef2f6]">
      {/* Left Column: Image with Floating Dark Card */}
      <div className="relative hidden md:flex items-center justify-center p-8 bg-gray-200 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&q=80"
          alt="Construction Fieldwork"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark Quote Box Overlay */}
        <div className="relative z-10 max-w-md w-full bg-[#112233]/90 backdrop-blur-xs p-8 rounded-xl text-white space-y-4 shadow-xl border border-white/10">
          <p className="text-2xl font-serif leading-snug tracking-wide">
            “Trust is built over time and proven through quality work.”
          </p>
          <div className="text-xs text-gray-300 space-y-1">
            <p className="font-sans font-medium text-gray-200">IBM Plex Sans</p>
            <p className="font-sans text-gray-400">- Fieldwork</p>
          </div>
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="flex items-center justify-center p-6 bg-[#eef2f6]">
        <LoginForm />
      </div>
    </div>
  );
};
>>>>>>> 068172ec0a0ac18df41f431507b0fe7a6030a66c
