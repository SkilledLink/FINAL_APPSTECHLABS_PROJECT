import React, { useState } from 'react';

interface BeforeAfterProps {
  beforeImage?: string;
  afterImage?: string;
}

export const BeforeAfter: React.FC<BeforeAfterProps> = ({ beforeImage, afterImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  if (!beforeImage || !afterImage) return null;

  return (
    <div className="my-8">
      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Transformation: Before & After</h4>
      <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden select-none">
        {/* After Image (Background) */}
        <img 
          src={afterImage} 
          alt="After Remodeling" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <span className="absolute bottom-4 right-4 bg-slate-900/80 text-white text-xs px-3 py-1 rounded-md backdrop-blur-sm z-10">After</span>

        {/* Before Image (Clipped overlay) */}
        <div 
          className="absolute inset-0 overflow-hidden" 
          style={{ width: `${sliderPosition}%` }}
        >
          <img 
            src={beforeImage} 
            alt="Before Remodeling" 
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{ width: '100%', height: '100%' }}
          />
          <span className="absolute bottom-4 left-4 bg-slate-900/80 text-white text-xs px-3 py-1 rounded-md backdrop-blur-sm z-10">Before</span>
        </div>

        {/* Interactive Slider Bar */}
        <div 
          className="absolute inset-y-0 w-1 bg-amber-500 cursor-ew-resize"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
            ↔
          </div>
        </div>

        <input 
          type="range" 
          min="0" 
          max="100" 
          value={sliderPosition} 
          onChange={(e) => setSliderPosition(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
        />
      </div>
    </div>
  );
};