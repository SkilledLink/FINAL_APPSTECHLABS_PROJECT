// components/CommunityQuestion.tsx
import React from 'react';
import { MessageCircle, Tag, Users } from 'lucide-react';
import type { Question } from '../../types/home';

interface CommunityQuestionProps {
  question: Question;
}

const CommunityQuestion: React.FC<CommunityQuestionProps> = ({ question }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-start gap-3">
        <img 
          src={question.avatar} 
          alt={question.author}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{question.author}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400">{question.createdAt}</span>
          </div>
          <p className="text-sm text-gray-800 mt-1 font-medium">
            {question.question}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {question.categories.map((category, index) => (
              <span 
                key={index}
                className="bg-gray-100 text-gray-700 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1"
              >
                <Tag className="w-3 h-3" />
                {category}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <MessageCircle className="w-4 h-4" />
              <span>{question.answers} answers</span>
            </div>
            <button className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
              Answer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityQuestion;