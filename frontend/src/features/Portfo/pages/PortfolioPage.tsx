import React from 'react';
import { PortfolioGrid } from '../components/PortfolioGrid';
import { usePortfolio } from '../hooks/usePortfolio';
import { Project } from '../types/portfolio.types';

interface PortfolioPageProps {
  onSelectProject: (project: Project) => void;
  onNavigateCreate: () => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ onSelectProject, onNavigateCreate }) => {
  const { filteredProjects, selectedCategory, setSelectedCategory, loading } = usePortfolio();

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading portfolio works...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Our Works & Projects</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Explore specialized craftsmanship across trades and design sectors.</p>
        </div>
        <button 
          onClick={onNavigateCreate}
          className="self-start md:self-auto bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md transition-colors"
        >
          + Add Project
        </button>
      </div>

      <PortfolioGrid 
        projects={filteredProjects}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onSelectProject={onSelectProject}
      />
    </div>
  );
};