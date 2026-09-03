// components/ProjectHighlight.tsx
import React from "react";
import type { Highlight } from "../../types/home";

interface ProjectHighlightsProps {
  highlights: Highlight[];
}

const ProjectHighlights: React.FC<ProjectHighlightsProps> = ({
  highlights,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Project Highlights
      </h2>
      <div className="space-y-3">
        {highlights.map((item) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-xl"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-32 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent rounded-xl" />
            <p className="absolute bottom-3 left-3 text-white font-medium text-sm">
              {item.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectHighlights;
