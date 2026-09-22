// src/App.tsx

import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useParams,
  useNavigate,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Providers
import { AuthProvider } from "./providers/AuthProvider";
import { SocketProvider } from "./contexts/SocketContext";

// Layouts
import { AuthLayout } from "./features/auth/components/AuthLayout";
import AppLayout from "./components/layout/AppLayout/AppLayout";

// Landing
import LandingPage from "./features/landing/pages/LandingPage";

// Auth pages
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import VerifyEmailPage from "./features/auth/pages/VerifyEmailPage";

// Onboarding pages
import ChooseAccountTypePage from "./features/onboarding/pages/ChooseAccountTypePage";
import ProfessionalWizardPage from "./features/onboarding/pages/ProfessionalWizardPage";

// Auth hook
import { useAuth } from "./features/auth/hooks/useAuth";

// AI assistant
import { AIFloatingWidget } from "./features/ai/components/AIFloatingWidget";

// Main pages
import HomePage from "./features/home/pages/HomePage";
import Feed from "./features/posts/components/Feed";
import { ProfilePage } from "./features/profile";
import { MessagesPage } from "./features/messages";

// notification
import { NotificationsPage } from "./features/notifications";

// Location-powered Discover
import NearbyProfessionalsPage from "./features/location/pages/NearbyProfessionalsPage";

// Jobs
import JobsPage from "./features/jobs/pages/JobsPage";
import JobDetailsPage from "./features/jobs/pages/JobDetailsPage";
import CreateJobPage from "./features/jobs/pages/CreateJobPage";

// Portfolio — single component, auto-switches owner vs public
import PortfolioDashboard from "./features/portfolio/pages/PortfolioDashboard";

// Users
import UsersPage from "./features/users/pages/UsersPage";
import MarketplacePage from "./features/Market/pages/Marketplace/Marketplace";

// Verification
import { VerificationPage } from "./verification/pages/VerificationPage";

// Admin
import AdminDashboard from "./features/admin_dashboard/pages/AdminDashboard";
import AdminCheck from "./features/admin_dashboard/components/AdminCheck";
import ModeratorDashboard from "./features/moderator_dashboard/pages/ModeratorDashboard";
import NotFound from "./features/not_found_page/Not_Found_Page";

// ============================================================
const ProfessionalsPage = UsersPage;

// ============================================================
// SOCKET AUTH BRIDGE
// ============================================================
function AuthedSocketProvider({ children }: { children: React.ReactNode }) {
  const readToken = () =>
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    null;

  const [token, setToken] = useState<string | null>(() => readToken());

  useEffect(() => {
    const sync = () => setToken(readToken());
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  return <SocketProvider token={token}>{children}</SocketProvider>;
}

// ============================================================
// PUBLIC-ONLY ROUTE
// ============================================================
function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated()) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

// ============================================================
// PROTECTED ROUTE
// ============================================================
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// ============================================================
// DYNAMIC ROUTE WRAPPERS & ALIAS REDIRECTS
// ============================================================
function ProfileRoute() {
  const { id } = useParams<{ id: string }>();
  return <ProfilePage userId={id ?? ""} />;
}

function JobDetailsRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <JobDetailsPage
      jobId={id ?? ""}
      onBack={() => navigate(-1)}
    />
  );
}

function JobDetailsRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/home/jobs/${id}`} replace />;
}

// ============================================================
// MAIN APP
// ============================================================
function App() {
  return (
    <AuthProvider>
      <AuthedSocketProvider>
        <BrowserRouter>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />

          <AIFloatingWidget />

          <Routes>
            {/* LANDING (PUBLIC) */}
            <Route path="/" element={<LandingPage />} />

            {/* AUTH ROUTES (PUBLIC-ONLY) */}
            <Route element={<PublicOnlyRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
              </Route>
            </Route>

            {/* AUTHENTICATED (PROTECTED) */}
            <Route element={<ProtectedRoute />}>
              {/* Onboarding */}
              <Route path="/onboarding" element={<ChooseAccountTypePage />} />
              <Route
                path="/onboarding/professional"
                element={<ProfessionalWizardPage />}
              />

              {/* Home */}
              <Route path="/home" element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="feed" element={<Feed />} />
                <Route path="jobs" element={<JobsPage />} />
                <Route path="jobs/create" element={<CreateJobPage />} />
                <Route path="jobs/:id" element={<JobDetailsRoute />} />
                <Route path="discover" element={<NearbyProfessionalsPage />} />

                {/* Portfolio — owner studio when no id / own id,
                    public read-only view when someone else's id */}
                <Route path="portfolio" element={<PortfolioDashboard />} />
                <Route
                  path="portfolio/:userId"
                  element={<PortfolioDashboard />}
                />

                <Route path="notifications" element={<NotificationsPage />} />

                {/* Messages — both routes already exist; no change needed */}
                <Route path="messages" element={<MessagesPage />} />
                <Route
                  path="messages/:conversationId"
                  element={<MessagesPage />}
                />

                <Route path="professionals" element={<ProfessionalsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="verification" element={<VerificationPage />} />
                <Route path="marketplace" element={<MarketplacePage />} />
                <Route path="profile" element={<ProfileRoute />} />
                <Route path="profile/:id" element={<ProfileRoute />} />
              </Route>

              {/* Aliases */}
              <Route path="/jobs" element={<Navigate to="/home/jobs" replace />} />
              <Route
                path="/jobs/create"
                element={<Navigate to="/home/jobs/create" replace />}
              />
              <Route path="/jobs/:id" element={<JobDetailsRedirect />} />
            </Route>

            {/* PUBLIC PORTFOLIO (standalone, no auth required) */}
            <Route
              path="/portfolio/:userId"
              element={<PortfolioDashboard />}
            />

            {/* ADMIN */}
            <Route path="/admin_dashboard" element={<AdminDashboard />} />

            {/* MODERATOR DASHBOARD */}
            <Route path="/moderator_dashboard" element={<ModeratorDashboard />} />

            {/* CATCH-ALL */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthedSocketProvider>
    </AuthProvider>
  );
}

export default App;