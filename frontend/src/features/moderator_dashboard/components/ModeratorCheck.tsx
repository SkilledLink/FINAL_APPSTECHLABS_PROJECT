import React, { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

interface ModeratorCheckProps {
  children?: ReactNode;
}

const ModeratorCheck: React.FC<ModeratorCheckProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const u = currentUser as any;
  const isAdmin = !!(u?.is_admin ?? u?.isAdmin);
  const isModerator = !!(u?.is_moderator ?? u?.isModerator);

  if (!isAdmin && !isModerator) {
    return <Navigate to="/home" state={{ from: location }} replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default ModeratorCheck;