import React, { useState, useEffect } from 'react';
import { PortfolioPage } from './pages/PortfolioPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { Project } from './types/portfolio.types';
import { Sun, Moon, Wrench } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<'portfolio' | 'details' | 'create'>('portfolio');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Global Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            onClick={() => setCurrentView('portfolio')} 
            className="flex items-center gap-2 cursor-pointer font-bold text-xl tracking-tight text-amber-600 dark:text-amber-500"
          >
            <Wrench className="w-6 h-6" />
            <span>MasterCraft & Co.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Dynamic View Routing */}
      <main>
        {currentView === 'portfolio' && (
          <PortfolioPage 
            onSelectProject={(project) => {
              setSelectedProject(project);
              setCurrentView('details');
            }} 
            onNavigateCreate={() => setCurrentView('create')}
          />
        )}

        {currentView === 'details' && selectedProject && (
          <ProjectDetailsPage 
            project={selectedProject} 
            onBack={() => setCurrentView('portfolio')} 
          />
        )}

        {currentView === 'create' && (
          <CreateProjectPage 
            onSuccess={() => setCurrentView('portfolio')} 
            onCancel={() => setCurrentView('portfolio')} 
          />
        )}
      </main>
    </div>
  );
}