import React from 'react';
import { ProjectCard } from './ProjectCard';
import type { Project, Category } from '../types/portfolio.types';

interface PortfolioGridProps {
  projects: Project[];
  selectedCategory: Category | 'All';
  onSelectCategory: (cat: Category | 'All') => void;
  onSelectProject: (project: Project) => void;
}

const CATEGORIES: (Category | 'All')[] = ['All', 'Carpentry', 'Plumbing', 'Construction', 'Home Decor', 'Remodeling', 'Design'];

export const PortfolioGrid: React.FC<PortfolioGridProps> = ({
  projects,
  selectedCategory,
  onSelectCategory,
  onSelectProject
}) => {
  return (
    <div>
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid of Projects */}
      {projects.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">No projects found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} onSelect={onSelectProject} />
          ))}
        </div>
      )}
    </div>
  );
};