// components/SuggestedProfessionals.tsx
import React from 'react';
import { Users, UserPlus } from 'lucide-react';
import type { Professional } from '../../types/home';

interface SuggestedProfessionalsProps {
  professionals: Professional[];
}

const SuggestedProfessionals: React.FC<SuggestedProfessionalsProps> = ({ professionals }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <Users className="w-4 h-4 text-blue-600" />
        Suggested Professionals Nearby
      </h3>
      
      <div className="space-y-4">
        {professionals.map((pro) => (
          <div key={pro.id} className="flex items-center gap-3">
            <img 
              src={pro.avatar} 
              alt={pro.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{pro.name}</p>
              <p className="text-xs text-gray-500">{pro.profession}</p>
            </div>
            <button className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700 transition-colors">
              <UserPlus className="w-3 h-3" />
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedProfessionals;