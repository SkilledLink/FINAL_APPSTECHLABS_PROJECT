// src/features/user_profile/components/UserLink.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

interface UserLinkProps {
  userId: string;
  children: React.ReactNode;
  className?: string;
}

export const UserLink: React.FC<UserLinkProps> = ({
  userId,
  children,
  className,
}) => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation(); // prevent parent click handlers from firing
        navigate(`/user-profile/${userId}`);
      }}
      className={className ?? 'hover:underline text-left'}
    >
      {children}
    </button>
  );
};