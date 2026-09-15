import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { ReactNode } from "react";

interface AuthCheckProps {
  children?: ReactNode;
}

export default function AuthCheck({ children }: AuthCheckProps) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show a loading spinner while authentication status is being checked
  if (loading) {import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { ReactNode } from "react";

interface AuthCheckProps {
  children?: ReactNode;
}

export default function AuthCheck({ children }: AuthCheckProps) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show a loading spinner while authentication status is being checked
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login, preserving the intended destination
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render either the children (if provided) or the Outlet (for nested routes)
  return <>{children || <Outlet />}</>;
}
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login, preserving the intended destination
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render either the children (if provided) or the Outlet (for nested routes)
  return <>{children || <Outlet />}</>;
}