import React from 'react';

export const AuthIllustration: React.FC = () => {
  return (
    <div className="w-full lg:w-5/12 bg-[#1B195B] rounded-3xl lg:rounded-r-none p-8 flex flex-col justify-center items-center relative overflow-hidden min-h-[340px] lg:min-h-[500px]">
      {/* Background Dots Grid Accent */}
      <div className="absolute top-6 left-6 grid grid-cols-4 gap-2 opacity-20">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 bg-white rounded-full" />
        ))}
      </div>

      {/* Hero Vector Graphic */}
      <svg
        className="w-full max-w-[280px] sm:max-w-[320px] h-auto relative z-10"
        viewBox="0 0 400 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Bookshelf */}
        <path d="M70 140 H180 V146 H70 Z" fill="#6C63FF" />
        <rect x="95" y="90" width="16" height="50" rx="3" fill="#A5A6F6" />
        <rect x="115" y="90" width="16" height="50" rx="3" fill="#A5A6F6" />
        <path d="M80 146 L95 180 L102 180 L87 146 Z" fill="#4D47C3" />

        {/* Floating Frame */}
        <rect x="250" y="130" width="45" height="55" rx="4" fill="#A5A6F6" opacity="0.3" />
        <path d="M255 175 L270 150 L285 175 Z" fill="#A5A6F6" opacity="0.5" />

        {/* Desk */}
        <path d="M50 220 H350 V232 H50 Z" fill="#D2B48C" />
        <path d="M75 232 L110 300 H125 L90 232 Z" fill="#5C2626" />
        <path d="M325 232 L290 300 H275 L310 232 Z" fill="#5C2626" />

        {/* Laptop */}
        <path d="M85 185 H155 V218 H85 Z" fill="#4D47C3" />
        <ellipse cx="120" cy="201" rx="4" ry="4" fill="#FFFFFF" opacity="0.6" />
        <path d="M75 218 H165 V220 H75 Z" fill="#3A358D" />

        {/* Character */}
        <path d="M125 300 L160 230 L200 230 L180 300 Z" fill="#3A358D" />
        <path d="M180 230 C180 190 205 170 240 170 C275 170 290 190 290 230 Z" fill="#FFF8F0" />
        <path d="M210 215 C210 215 230 225 250 215" stroke="#E26D5C" strokeWidth="6" strokeLinecap="round" />
        <circle cx="215" cy="150" r="28" fill="#FCEADE" />
        <path d="M190 145 C190 120 210 110 235 115 C250 118 260 130 255 148 C245 140 230 140 220 145 Z" fill="#2D2B52" />
        <circle cx="205" cy="150" r="9" stroke="#3A358D" strokeWidth="2.5" fill="none" />
        <circle cx="225" cy="150" r="9" stroke="#3A358D" strokeWidth="2.5" fill="none" />
        <line x1="214" y1="150" x2="216" y2="150" stroke="#3A358D" strokeWidth="2.5" />
      </svg>
    </div>
  );
};