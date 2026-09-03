import React from 'react';

interface FullScreenVideoProps {
  videoUrl: string;
  onClose: () => void;
}

const FullScreenVideo: React.FC<FullScreenVideoProps> = ({ videoUrl, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
      
      <video 
        src={videoUrl} 
        controls 
        autoPlay 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default FullScreenVideo;