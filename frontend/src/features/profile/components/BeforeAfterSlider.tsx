import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface BeforeAfterSliderProps {
  title: string;
  subtitle?: string;
  beforeImage: string;
  afterImage: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  title,
  subtitle,
  beforeImage,
  afterImage,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs w-full">
      {/* Aspect Ratio Container for Fluid Scaling */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] select-none overflow-hidden bg-slate-950">
        {/* After Image */}
        <img
          src={afterImage}
          alt="After renovation"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 px-2 py-0.5 bg-slate-900/80 text-white text-[9px] sm:text-[10px] font-extrabold uppercase rounded tracking-wider backdrop-blur-xs z-10">
          After
        </span>

        {/* Before Image Overlay */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={beforeImage}
            alt="Before renovation"
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{ width: '100%' }}
          />
          <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 px-2 py-0.5 bg-slate-900/80 text-white text-[9px] sm:text-[10px] font-extrabold uppercase rounded tracking-wider backdrop-blur-xs z-10">
            Before
          </span>
        </div>

        {/* Divider Handle Bar */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none flex items-center justify-center z-20"
          style={{ left: `calc(${sliderPos}% - 1px)` }}
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white text-indigo-600 shadow-md flex items-center justify-center border border-slate-200 touch-none">
            <SlidersHorizontal className="w-3 h-3 sm:w-4 sm:h-4 rotate-90" />
          </div>
        </div>

        {/* Touch & Mouse Drag Input */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 touch-pan-y"
        />
      </div>

      <div className="p-3 sm:p-4">
        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 line-clamp-1">
          {title}
        </h4>
        {subtitle && (
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};