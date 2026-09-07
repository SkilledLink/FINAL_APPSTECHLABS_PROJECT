// src/components/auth/AuthCheck.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth'; 
import { ReactNode } from 'react';

interface AuthCheckProps {
  children?: ReactNode;
}

export default function AuthCheck({ children }: AuthCheckProps) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Optional: Show loading state to prevent flickering if checking tokens
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login page (preserving the intended destination)
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the children (the protected page or layout)
  return <>{children}</>;
}