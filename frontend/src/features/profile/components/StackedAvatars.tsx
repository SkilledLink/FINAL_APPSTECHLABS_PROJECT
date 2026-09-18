import React from 'react';
import { User as UserIcon } from 'lucide-react';

interface StackedAvatarsProps {
  users: {
    id: string;
    profileImageUrl?: string | null;
    firstName: string;
    lastName: string;
  }[];
  maxVisible?: number;
}

export const StackedAvatars: React.FC<StackedAvatarsProps> = ({
  users,
  maxVisible = 3,
}) => {
  if (!users || users.length === 0) return null;

  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visibleUsers.map((user, idx) => (
          <div
            key={user.id || idx}
            className="relative inline-block transition-transform hover:scale-110 hover:z-20"
            title={`${user.firstName} ${user.lastName}`}
            style={{ zIndex: maxVisible - idx }}
          >
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="h-7 w-7 rounded-full border-2 border-white dark:border-slate-900 object-cover bg-slate-100"
              />
            ) : (
              <div className="h-7 w-7 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <UserIcon className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-300" />
              </div>
            )}
          </div>
        ))}
      </div>

      {remainingCount > 0 && (
        <div
          className="flex h-7 w-7 -ml-2 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 select-none cursor-default"
          aria-label={`${remainingCount} more followers`}
          title={`${remainingCount} more followers`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};