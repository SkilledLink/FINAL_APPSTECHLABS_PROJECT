import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedAdminRoute() {
  const authenticated =
    localStorage.getItem("adminAuthenticated") === "true";

  if (!authenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}