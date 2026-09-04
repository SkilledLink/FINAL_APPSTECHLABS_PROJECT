import React from 'react';
import { MessageCircle, Tag } from 'lucide-react';
import type { Question } from '../../types/home';

interface CommunityQuestionProps {
  question: Question;
}

const CommunityQuestion: React.FC<CommunityQuestionProps> = ({ question }) => {
  // Safe fallbacks to handle variations between type definitions and mock data
  const authorName = typeof question.author === 'string' ? question.author : question.author?.name || 'Anonymous';
  const authorAvatar = typeof question.author === 'object' ? question.author?.avatarUrl : question.avatar;
  const timeDisplay = question.timeAgo || question.createdAt || 'Recently';
  const answersCount = question.answersCount ?? question.answers ?? 0;
  const categories = question.categories || [];

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 p-5 transition-colors duration-300">
      <div className="flex items-start gap-3">
        {/* Avatar with initial fallback */}
        {authorAvatar ? (
          <img 
            src={authorAvatar} 
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-sm border border-blue-500/20">
            {authorName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 dark:text-white text-sm">{authorName}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{timeDisplay}</span>
          </div>

          <p className="text-sm text-slate-800 dark:text-slate-200 mt-1 font-medium leading-relaxed">
            {question.question}
          </p>

          {/* Safe category mapping check */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2.5">
              {categories.map((category, index) => (
                <span 
                  key={index}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-slate-200/60 dark:border-slate-700/60"
                >
                  <Tag className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  {category}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-3.5 pt-2 border-t border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
              <MessageCircle className="w-4 h-4" />
              <span>{answersCount} {answersCount === 1 ? 'answer' : 'answers'}</span>
            </div>
            <button className="text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
              Answer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityQuestion;