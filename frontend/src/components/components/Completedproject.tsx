import React, { useState } from 'react';
import { Heart, MessageCircle, MapPin, Briefcase, Sparkles, Layers } from 'lucide-react';
import type { Project } from '../../types/home';

interface CompletedProjectProps {
  project: Project;
}

const DEFAULT_PROJECT_IMAGE = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80';

// Helper to safely extract string values from strings or nested objects
const extractString = (val: any, fallback = ''): string => {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val.name || val.title || val.label || fallback;
  }
  return String(val);
};

const CompletedProject: React.FC<CompletedProjectProps> = ({ project }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showBefore, setShowBefore] = useState(false);

  // Safe Property Mapping & String Extraction
  const title = extractString(project.title || (project as any).name, 'Renovation Project');
  const client = extractString(project.client || (project as any).clientName || (project as any).author, 'Private Client');
  const location = extractString(project.location || (project as any).city, 'Location N/A');
  const trade = extractString(project.trade || (project as any).category || (project as any).service, 'General Trade');
  
  const initialLikes = project.likes ?? (project as any).likesCount ?? 0;
  const commentsCount = project.comments ?? (project as any).commentsCount ?? 0;
  const likesCount = isLiked ? initialLikes + 1 : initialLikes;

  const afterImg = project.afterImage || (project as any).image || (project as any).imageUrl || DEFAULT_PROJECT_IMAGE;
  const beforeImg = (project as any).beforeImage || null;

  const currentDisplayImg = showBefore && beforeImg ? beforeImg : afterImg;

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Completed Project
        </h3>
        <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-500/20">
          {trade}
        </span>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-3 line-clamp-2">
        {title}
      </p>
      
      {/* Project Image Section */}
      <div className="relative rounded-xl overflow-hidden mb-4 group border border-slate-200/60 dark:border-slate-800/60">
        <img 
          src={currentDisplayImg} 
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_PROJECT_IMAGE;
          }}
        />

        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          {beforeImg && (
            <button
              onClick={() => setShowBefore(!showBefore)}
              className="bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 border border-white/20"
            >
              <Layers className="w-3 h-3" />
              {showBefore ? 'Showing Before' : 'Showing After'}
            </button>
          )}
          <span className="bg-slate-950/70 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-medium border border-white/10">
            Before & After
          </span>
        </div>
      </div>
      
      {/* Details */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Briefcase className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span>Client: <span className="font-semibold text-slate-800 dark:text-slate-200">{client}</span></span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span>{location}</span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
        <button 
          onClick={() => setIsLiked(!isLiked)}
          className={`flex items-center gap-1.5 text-xs font-semibold transition-all ${
            isLiked ? 'text-rose-500 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400 hover:text-rose-500'
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span>{likesCount}</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <MessageCircle className="w-4 h-4" />
          <span>{commentsCount}</span>
        </div>
      </div>
    </div>
  );
};

export default CompletedProject;