import React, { useState } from 'react';
import { Users, UserPlus, Check, MapPin } from 'lucide-react';
import type { Professional } from '../../types/home';

interface SuggestedProfessionalsProps {
  professionals: Professional[];
}

const ONLINE_AVATAR_FALLBACKS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
];

const SuggestedProfessionals: React.FC<SuggestedProfessionalsProps> = ({ professionals }) => {
  const [connectedState, setConnectedState] = useState<Record<string, boolean>>({});

  const handleConnectToggle = (id: string) => {
    setConnectedState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm transition-colors duration-300">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        Suggested Professionals Nearby
      </h3>

      <div className="space-y-3.5">
        {professionals && professionals.length > 0 ? (
          professionals.map((pro, index) => {
            const id = pro.id || `pro-${index}`;
            const name = pro.name || 'Trade Professional';
            const profession = pro.profession || (pro as any).trade || (pro as any).title || 'Specialist';
            const location = (pro as any).location || (pro as any).distance || null;
            const rawAvatar = pro.avatar || (pro as any).avatarUrl || (pro as any).image;
            const isConnected = !!connectedState[id];

            const fallbackAvatar = ONLINE_AVATAR_FALLBACKS[index % ONLINE_AVATAR_FALLBACKS.length];
            const avatarSrc = rawAvatar && !rawAvatar.includes('placeholder') ? rawAvatar : fallbackAvatar;

            return (
              <div 
                key={id} 
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Avatar with image or initials fallback */}
                <div className="relative shrink-0">
                  <img 
                    src={avatarSrc} 
                    alt={name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackAvatar;
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {profession}
                  </p>
                  {location && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5 mt-0.5 truncate">
                      <MapPin className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                      {location}
                    </p>
                  )}
                </div>

                {/* Connect Action Button */}
                <button 
                  onClick={() => handleConnectToggle(id)}
                  className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200 shrink-0 ${
                    isConnected
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-sm shadow-blue-500/20 active:scale-95'
                  }`}
                >
                  {isConnected ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>Connected</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      <span>Connect</span>
                    </>
                  )}
                </button>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">No suggested professionals available.</p>
        )}
      </div>
    </div>
  );
};

export default SuggestedProfessionals;