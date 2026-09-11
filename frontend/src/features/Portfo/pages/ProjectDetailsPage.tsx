import React from 'react';
import { ArrowLeft, MapPin, Calendar, User, CheckCircle } from 'lucide-react';
import { Project } from '../types/portfolio.types';
import { BeforeAfter } from '../components/BeforeAfter';
import { ProjectGallery } from '../components/ProjectGallery';

interface ProjectDetailsPageProps {
  project: Project;
  onBack: () => void;
}

export const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({ project, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 mb-6 font-medium transition-colors"
      >
        <ArrowLeft size={18} /> Back to Projects
      </button>

      {/* Hero Header */}
      <div className="mb-8">
        <span className="bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full inline-block mb-4">
          {project.category}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
          {project.title}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-sm">
          <div>
            <span className="block text-slate-400 text-xs mb-1">Location</span>
            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5"><MapPin size={15} className="text-amber-500" /> {project.location}</span>
          </div>
          <div>
            <span className="block text-slate-400 text-xs mb-1">Client</span>
            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5"><User size={15} className="text-amber-500" /> {project.client}</span>
          </div>
          <div>
            <span className="block text-slate-400 text-xs mb-1">Completion Date</span>
            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5"><Calendar size={15} className="text-amber-500" /> {project.completionDate}</span>
          </div>
        </div>
      </div>

      {/* Main Image */}
      <div className="h-96 sm:h-[450px] rounded-2xl overflow-hidden shadow-lg mb-8">
        <img src={project.mainImage} alt={project.title} className="w-full h-full object-cover" />
      </div>

      {/* Overview & Goals */}
      <div className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Project Overview</h3>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{project.overview}</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Project Goals & Execution</h3>
          <ul className="space-y-3">
            {project.goals.map((goal, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                <CheckCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Before / After Interactive Slider */}
      <BeforeAfter beforeImage={project.beforeImage} afterImage={project.afterImage} />

      {/* Gallery */}
      <ProjectGallery images={project.galleryImages} />
    </div>
  );
};