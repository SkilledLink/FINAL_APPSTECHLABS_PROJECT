import React from 'react';

export interface Highlight {
  id: string;
  label?: string;
  title?: string;
  imageUrl?: string;
  image?: string;
}

interface ProjectHighlightsProps {
  highlights: Highlight[];
}

// Online Unsplash trade photos used as high-res fallbacks for broken or missing URLs
const ONLINE_FALLBACK_IMAGES = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5tcJIjwxE1yS1fIJpDd6CDIVXqRwn4E7R8Oa0Jt9ugUW81J6FfSRr0XM&s=10', // Cabinetry / Kitchen
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-xf7IDLpRETzqoe3hz8WqbFLKLi5YKHhn1VemTUFRNIkyKGY7eGn5Lvpn&s=10', // Plumbing / Pipe
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_Wh6T2ohcyakpqnhLqOU3dQnbRbULSOBwVrSA5GVaWIGnRFZpr6crC_Kw&s=10', // Painting
];

const ProjectHighlights: React.FC<ProjectHighlightsProps> = ({ highlights }) => {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm transition-colors duration-300">
      <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
        Project Highlights
      </h2>

      <div className="space-y-3">
        {highlights && highlights.length > 0 ? (
          highlights.map((item, index) => {
            // Flexible fallbacks for both imageUrl/image and label/title property names
            const displayTitle = item.label || item.title || 'Highlight';
            const rawImageUrl = item.imageUrl || item.image;
            
            // Replace placeholder services with real online pictures
            const validImageUrl = rawImageUrl && !rawImageUrl.includes('placeholder') 
              ? rawImageUrl 
              : ONLINE_FALLBACK_IMAGES[index % ONLINE_FALLBACK_IMAGES.length];

            return (
              <div 
                key={item.id || index}
                className="group relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/60 cursor-pointer"
              >
                <img 
                  src={validImageUrl} 
                  alt={displayTitle}
                  className="w-full h-28 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = ONLINE_FALLBACK_IMAGES[index % ONLINE_FALLBACK_IMAGES.length];
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent rounded-xl pointer-events-none" />
                <p className="absolute bottom-3 left-3 text-white font-semibold text-sm drop-shadow-sm">
                  {displayTitle}
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">No highlights available.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectHighlights;