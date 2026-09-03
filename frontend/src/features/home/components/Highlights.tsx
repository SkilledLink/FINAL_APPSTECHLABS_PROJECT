import React from 'react';
import type { Highlight } from '../../posts/types/post.types';

interface HighlightsProps {
  highlights: Highlight[];
  onAddHighlight: () => void;
}

const Highlights: React.FC<HighlightsProps> = ({
  highlights,
  onAddHighlight,
}) => {
  return (
    <div
      className="w-full min-w-0 flex gap-4 overflow-x-auto pb-2 mb-4"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Add Highlight Button */}
      <button
        type="button"
        onClick={onAddHighlight}
        className="flex flex-col items-center shrink-0"
      >
        <div className="w-16 h-16 rounded-full border-2 border-blue-600 bg-gray-100 flex items-center justify-center relative">
          <img
            src="https://i.pravatar.cc/150?img=12"
            alt="User"
            className="w-full h-full rounded-full object-cover opacity-50"
          />

          <div className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 border-2 border-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-3 h-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
        </div>

        <span className="text-xs font-medium mt-1 whitespace-nowrap">
          Add Highlight
        </span>
      </button>

      {/* Existing Highlights */}
      {highlights.map((h) => (
        <button
          type="button"
          key={h.id}
          onClick={() => console.log(`Clicked ${h.label}`)}
          className="flex flex-col items-center shrink-0"
        >
          <div className="w-16 h-16 rounded-full border-2 border-blue-600 p-0.5">
            <img
              src={h.imageUrl}
              alt={h.label}
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          <span className="text-xs font-medium mt-1 whitespace-nowrap">
            {h.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default Highlights;
