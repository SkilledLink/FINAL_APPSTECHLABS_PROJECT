import React from 'react';

interface ProjectGalleryProps {
  images: string[];
}

export const ProjectGallery: React.FC<ProjectGalleryProps> = ({ images }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="my-8">
      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Project Gallery</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {images.map((img, index) => (
          <div key={index} className="h-64 rounded-xl overflow-hidden shadow-md">
            <img src={img} alt={`Gallery item ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </div>
        ))}
      </div>
    </div>
  );
};