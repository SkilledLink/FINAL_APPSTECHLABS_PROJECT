import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { Project } from '../types/portfolio.types';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  return (
    <motion.div 
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(project)}
      className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800 cursor-pointer flex flex-col group"
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={project.mainImage} 
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-4 left-4 bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
          {project.category}
        </span>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {project.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
          {project.summary}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><MapPin size={14} /> {project.location}</span>
            <span className="flex items-center gap-1"><Calendar size={14} /> {project.completionDate}</span>
          </div>
          <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            View <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </motion.div>
  );
};