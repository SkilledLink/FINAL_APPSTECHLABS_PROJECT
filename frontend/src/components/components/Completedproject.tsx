// components/CompletedProject.tsx
import React from 'react';
import { Heart, MessageCircle, MapPin, Briefcase } from 'lucide-react';
import type { Project } from '../../types/home';

interface CompletedProjectProps {
  project: Project;
}

const CompletedProject: React.FC<CompletedProjectProps> = ({ project }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Completed Project
      </h3>
      <p className="text-sm text-gray-500 mb-4">{project.title}</p>
      
      <div className="relative rounded-xl overflow-hidden mb-4">
        <img 
          src={project.afterImage} 
          alt={project.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1 rounded-full text-xs">
          Before & After
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Briefcase className="w-4 h-4" />
          <span>Client: <span className="font-medium text-gray-900">{project.client}</span></span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{project.location}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span className="font-medium">Trade:</span>
          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">
            {project.trade}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1 text-gray-600">
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          <span className="text-sm font-medium">{project.likes}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{project.comments}</span>
        </div>
      </div>
    </div>
  );
};

export default CompletedProject;