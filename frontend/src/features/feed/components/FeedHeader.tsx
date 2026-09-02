import React from 'react';

interface HighlightProps {
  label: string;
  active?: boolean;
}

const HighlightItem: React.FC<HighlightProps> = ({ label, active = false }) => {
  return (
    <button
      className={`
        px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap
        transition-all duration-200
        ${active 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
      `}
    >
      {label}
    </button>
  );
};

const FeedHeader: React.FC = () => {
  const highlights = ['Cabinetry', 'Pipe Fix', 'Painting'];
  
  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b border-gray-200 bg-white overflow-x-auto">
      <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Highlight
      </button>
      
      {highlights.map((item) => (
        <HighlightItem key={item} label={item} />
      ))}
    </div>
  );
};

export default FeedHeader;