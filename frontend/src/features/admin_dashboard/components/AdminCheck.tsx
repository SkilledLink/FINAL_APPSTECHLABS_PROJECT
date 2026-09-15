import React, { type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

interface AdminCheckProps {
  children?: ReactNode;
}

const AdminCheck: React.FC<AdminCheckProps> = ({ children }) => {
  const { user: currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // currentUser comes from /users/me as snake_case (UserResponse), but is typed
  // as camelCase UserProfile. Read both defensively.
  const u = currentUser as (typeof currentUser & {
    is_admin?: boolean;
    is_moderator?: boolean;
  }) | null;
  const isAdmin = !!(u?.is_admin ?? u?.isAdmin);
  const isModerator = !!(u?.is_moderator ?? u?.isModerator);

  if (!isAdmin && !isModerator) {
    return <Navigate to="/home" state={{ from: location }} replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default AdminCheck;