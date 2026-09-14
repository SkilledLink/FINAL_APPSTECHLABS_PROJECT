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
import DashboardPage from "./features/dashboard/pages/DashboardPage";
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
import AdminLogin from "./features/dash_board/AdminDahboard/AdminLogin";
import AdminDashboard from "./features/dash_board/AdminDahboard/AdminDashboard";
import ProtectedAdminRoute from "./features/dash_board/AdminDahboard/ProtectedAdminRoute";

import Jobs from "./features/dash_board/Outlet/Jobs";
import Workers from "./features/dash_board/Outlet/Workers";
import Users from "./features/dash_board/Outlet/Users";
import Posts from "./features/dash_board/Outlet/Posts";
import Verification from "./features/dash_board/Outlet/Verification";
import Reports from "./features/dash_board/Outlet/Reports";
import Settings from "./features/dash_board/Outlet/Settings";
import SystemCenter from "./features/dash_board/Outlet/SystemCenter";
import Overview from "./features/dash_board/Outlet/Overview";

// TODO: replace with a real Professionals page if it exists
const ProfessionalsPage = UsersPage;

// Marketplace
import Marketplace from "./features/Market/pages/Marketplace/Marketplace";

// ============================================================
// PUBLIC-ONLY ROUTE
// ============================================================
function PublicOnlyRoute() {
const { isAuthenticated } = useAuth();
if (isAuthenticated()) return <Navigate to="/home" replace />;
return <Outlet />;
}

// ============================================================
// PROTECTED ROUTE
// ============================================================
function ProtectedRoute() {
const { isAuthenticated } = useAuth();
if (!isAuthenticated()) return <Navigate to="/login" replace />;
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
return <JobDetailsPage jobId={id ?? ""} onBack={() => navigate(-1)} />;
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

return ( <PortfolioPage
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
return ( <AuthProvider> <BrowserRouter> <ToastContainer
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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      {/* ==================================================
          AUTHENTICATED APPLICATION (PROTECTED)
          ================================================== */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="feed" element={<Feed />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/:id" element={<JobDetailsRoute />} />
          <Route path="discover" element={<NearbyProfessionalsPage />} />
          <Route path="portfolio" element={<PortfolioDashboard />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="professionals" element={<ProfessionalsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="verification" element={<VerificationPage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="profile" element={<ProfileRoute />} />
          <Route path="profile/:id" element={<ProfileRoute />} />
        </Route>
      </Route>
          {/* ==================================================
              AUTHENTICATED APPLICATION (PROTECTED)
              ================================================== */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="feed" element={<Feed />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="jobs/create" element={<CreateJobPage />} />
              <Route path="jobs/:id" element={<JobDetailsRoute />} />
              <Route path="discover" element={<NearbyProfessionalsPage />} />
              <Route path="portfolio" element={<PortfolioDashboard />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="professionals" element={<ProfessionalsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="verification" element={<VerificationPage />} />
              <Route path="marketplace" element={<MarketplacePage />} />
              <Route path="profile" element={<ProfileRoute />} />
              <Route path="profile/:id" element={<ProfileRoute />} />
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
          ADMIN LOGIN
          ================================================== */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ==================================================
          PROTECTED ADMIN AREA
          ================================================== */}
      <Route element={<ProtectedAdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<Overview />} />
          <Route path="overview" element={<Overview />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="workers" element={<Workers />} />
          <Route path="users" element={<Users />} />
          <Route path="posts" element={<Posts />} />
          <Route path="verification" element={<Verification />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="system-center" element={<SystemCenter />} />
        </Route>
      </Route>

      {/* ==================================================
          CATCH-ALL
          ================================================== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
</AuthProvider>

);
}

export default App;
