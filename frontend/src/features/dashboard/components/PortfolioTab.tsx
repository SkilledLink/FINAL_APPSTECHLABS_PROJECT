import React from 'react';
import { Plus, Star, Calendar, User, MessageCircle } from 'lucide-react';
import type { PortfolioItem } from '../types/dashboard.types';

interface PortfolioTabProps {
  portfolio: PortfolioItem[];
}

const PortfolioTab: React.FC<PortfolioTabProps> = ({ portfolio }) => {
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Portfolio</h2>
          <p className="text-gray-500 mt-1">Showcase your completed projects</p>
        </div>
        <button className="mt-4 md:mt-0 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
          <Plus size={20} />
          Add Project
        </button>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {portfolio.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Images */}
            <div className="grid grid-cols-2 gap-1">
              {item.images.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className="aspect-video bg-gray-100 overflow-hidden"
                >
                  <img
                    src={image}
                    alt={`${item.title} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium text-gray-900">{item.rating}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>

              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <User size={14} />
                  {item.clientName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(item.date).toLocaleDateString()}
                </span>
              </div>

              {item.clientFeedback && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageCircle size={16} className="text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600 italic">"{item.clientFeedback}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioTab;