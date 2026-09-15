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

// Auth hook
import { useAuth } from "./features/auth/hooks/useAuth";

// AI assistant
import { AIFloatingWidget } from "./features/ai/components/AIFloatingWidget";

// Main pages
import HomePage from "./features/home/pages/HomePage";
import Feed from "./features/posts/components/Feed";
import { ProfilePage } from "./features/profile";
import { MessagesPage } from "./features/messages";

// Location-powered Discover
import NearbyProfessionalsPage from "./features/location/pages/NearbyProfessionalsPage";

// Jobs
import JobsPage from "./features/jobs/pages/JobsPage";
import JobDetailsPage from "./features/jobs/pages/JobDetailsPage";
import CreateJobPage from "./features/jobs/pages/CreateJobPage";
import PortfolioDashboard from "./features/portfolio/pages/PortfolioDashboard";
import { PortfolioPage } from "./features/Portfo/pages/PortfolioPage";

// Users
import UsersPage from "./features/users/pages/UsersPage";
import MarketplacePage from "./features/Market/pages/Marketplace/Marketplace";

// Verification
import { VerificationPage } from "./verification/pages/VerificationPage";


 
// Admin
import AdminDashboard from "./features/admin_dashboard/pages/AdminDashboard";
import AdminCheck from "./features/admin_dashboard/components/AdminCheck";
import ModeratorDashboard from "./features/moderator_dashboard/pages/ModeratorDashboard";


// ============================================================
// TODO: replace with a real Professionals page if it exists
// ============================================================
const ProfessionalsPage = UsersPage;

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

// ============================================================
// PUBLIC PORTFOLIO ROUTE
// ============================================================
function PublicPortfolioRoute() {
  const handleSelectProject = () => {
    // Portfolio page is public and does not require project selection handling here.
  };

  const handleNavigateCreate = () => {
    // Portfolio page is public and does not require creation handling here.
  };

  return (
    <PortfolioPage
      onSelectProject={handleSelectProject}
      onNavigateCreate={handleNavigateCreate}
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

        {/* AI Widget */}
        <AIFloatingWidget />

        <Routes>
          {/* ==================================================
              LANDING PAGE (PUBLIC)
              ================================================== */}
          <Route path="/" element={<LandingPage />} />

          {/* ==================================================
              AUTH ROUTES (PUBLIC-ONLY)
              ================================================== */}
          <Route element={<PublicOnlyRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route
                path="/forgot-password"
                element={<ForgotPasswordPage />}
              />
              <Route
                path="/reset-password"
                element={<ResetPasswordPage />}
              />
            </Route>
          </Route>

          {/* ==================================================
              AUTHENTICATED APPLICATION (PROTECTED)
              ================================================== */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="feed" element={<Feed />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="jobs/create" element={<CreateJobPage />} />
              <Route path="jobs/:id" element={<JobDetailsRoute />} />
              <Route
                path="discover"
                element={<NearbyProfessionalsPage />}
              />
              <Route
                path="portfolio"
                element={<PortfolioDashboard />}
              />
              <Route path="messages" element={<MessagesPage />} />
              <Route
                path="professionals"
                element={<ProfessionalsPage />}
              />
              <Route path="users" element={<UsersPage />} />
              <Route
                path="verification"
                element={<VerificationPage />}
              />
              <Route
                path="marketplace"
                element={<MarketplacePage />}
              />
              <Route path="profile" element={<ProfileRoute />} />
              <Route
                path="profile/:id"
                element={<ProfileRoute />}
              />
            </Route>

            {/* Direct URL Aliases / Fallbacks */}
            <Route
              path="/jobs"
              element={<Navigate to="/home/jobs" replace />}
            />

            <Route
              path="/jobs/create"
              element={<Navigate to="/home/jobs/create" replace />}
            />

            <Route
              path="/jobs/:id"
              element={<JobDetailsRedirect />}
            />
          </Route>

          {/* ==================================================
              PUBLIC PORTFOLIO
              Accessible regardless of authentication
              ================================================== */}
          <Route
            path="/portfolio"
            element={<PublicPortfolioRoute />}
          />

          {/* ==================================================
              ADMIN DASHBOARD
              ================================================== */}
          <Route
            path="/admin_dashbourd"
            element={<AdminDashboard />}
          />

          {/* ==================================================
              MODERATOR DASHBOARD (PUBLIC ROUTE)
          ================================================== */}
          <Route path="/moderator_dashbourd" element={<ModeratorDashboard />} />

          {/* ==================================================
              CATCH-ALL
              ================================================== */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;