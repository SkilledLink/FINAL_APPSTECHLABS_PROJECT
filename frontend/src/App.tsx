import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useParams,
} from "react-router-dom";
} from 'react-router-dom';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Providers
import { AuthProvider } from "./providers/AuthProvider";

// Layouts
import { AuthLayout } from "./features/auth/components/AuthLayout";
import AppLayout from "./components/layout/AppLayout/AppLayout";

// Landing
import LandingPage from './features/landing/pages/LandingPage';

// Auth pages
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import VerifyEmailPage from "./features/auth/pages/VerifyEmailPage";

// Main pages
import HomePage from "./features/home/pages/HomePage";
import Feed from "./features/posts/components/Feed";

// Auth hook
import { useAuth } from "./features/auth/hooks/useAuth";

// AI assistant
import { AIFloatingWidget } from "./features/ai/components/AIFloatingWidget";

// Dashboard
import DashboardPage from "./features/dashboard/components/pages/DashboardPage";
import { ProfilePage } from "./features/profile";
import { MessagesPage } from "./features/messages";
import { DiscoverPage } from "./features/discover";

// ─── Professional Portfolio ────────────────────────────────
import PortfolioDashboard from './features/portfolio/pages/PortfolioDashboard';
import UsersPage from './features/users/pages/UsersPage';

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

// Verification
import { VerificationPage } from "./verification/pages/VerificationPage";

// Marketplace
import Marketplace from "./features/Market/pages/Marketplace/Marketplace";
import UserProfilePage from "./features/user_profile/pages/UserProfilePage";


// ============================================================
// PUBLIC ONLY ROUTE
// ============================================================
import DashboardPage from './features/dashboard/components/pages/DashboardPage';

// Profile
import { ProfilePage } from './features/profile';

// Messages
import { MessagesPage } from './features/messages';

// Discover
import { DiscoverPage } from './features/discover';
import { JobsPage   } from './features/jobs';

// Professional Portfolio
import PortfolioDashboard from './features/portfolio/pages/PortfolioDashboard';

// Users
import UsersPage from './features/users/pages/UsersPage';

// TODO: Replace these with your actual Jobs and Professionals pages if they exist
const JobsPage = DiscoverPage; 
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
// PROFILE ROUTE
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
// PROFILE ROUTE
// ============================================================
function ProfileRoute() {
  const { id } = useParams<{ id: string }>();

  return <ProfilePage userId={id ?? ""} />;
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

        {/* AI Widget must be OUTSIDE Routes */}
        <AIFloatingWidget />

        <Routes>

          {/* ==================================================
              AUTH ROUTES
          ================================================== */}

          {/* ==================================================
              PUBLIC ROUTES
              ================================================== */}
          
          {/* Landing Page is the root URL */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth pages are public but redirect to /home if already logged in */}
          <Route element={<PublicOnlyRoute />}>
            <Route element={<AuthLayout />}>

              <Route
                path="/login"
                element={<LoginPage />}
              />

              <Route
                path="/register"
                element={<RegisterPage />}
              />

              <Route
                path="/verify-email"
                element={<VerifyEmailPage />}
              />

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
              MAIN APPLICATION
          ================================================== */}

          <Route path="/" element={<AppLayout />}>

            <Route
              index
              element={<HomePage />}
            />

            <Route
              path="dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="feed"
              element={<Feed />}
            />
            <Route index element={<HomePage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="feed" element={<Feed />} />
            <Route path="jobs" element={<JobsPage />} />

            {/* Profile */}
            <Route path="profile" element={<ProfileRoute />} />
            <Route path="profile/:id" element={<ProfileRoute />} />

            {/* Messages */}
            <Route
              path="messages"
              element={<MessagesPage />}
            />

            {/* Discover */}
            <Route
              path="discover"
              element={<DiscoverPage />}
            />

            {/* Portfolio */}
            <Route
              path="portfolio"
              element={<PortfolioDashboard />}
            />

            {/* Users */}
            <Route
              path="users"
              element={<UsersPage />}
            />

            {/* Verification */}
            <Route
              path="verification"
              element={<VerificationPage />}
            />

            <Route 
            path="user-profile/:id"
            element={<UserProfilePage />}
            />

            {/* Marketplace */}
            <Route
              path="marketplace"
              element={<Marketplace />}
            />

              AUTHENTICATED APPLICATION
              ================================================== */}
          
          <Route element={<ProtectedRoute />}>
            {/* All authenticated routes live under /home */}
            <Route path="/home" element={<AppLayout />}>
              
              <Route index element={<HomePage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="feed" element={<Feed />} />
              <Route path="discover" element={<DiscoverPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="portfolio" element={<PortfolioDashboard />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="professionals" element={<ProfessionalsPage />} />
              <Route path="users" element={<UsersPage />} />

              <Route path="profile" element={<ProfileRoute />} />
              <Route path="profile/:id" element={<ProfileRoute />} />
            </Route>
            <Route path="messages" element={<MessagesPage />} />
            <Route path="discover" element={<DiscoverPage />} />
            
            {/* ─── Professional Portfolio ─── */}
            <Route path="portfolio" element={<PortfolioDashboard />} />
          </Route>


          {/* ==================================================
              ADMIN LOGIN
          ================================================== */}

          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />


          {/* ==================================================
              PROTECTED ADMIN AREA
          ================================================== */}

          <Route element={<ProtectedAdminRoute />}>

            <Route
              path="/admin"
              element={<AdminDashboard />}
            >

              <Route
                index
                element={<Overview />}
              />

              <Route
                path="overview"
                element={<Overview />}
              />

              <Route
                path="jobs"
                element={<Jobs />}
              />

              <Route
                path="workers"
                element={<Workers />}
              />

              <Route
                path="users"
                element={<Users />}
              />

              <Route
                path="posts"
                element={<Posts />}
              />

              <Route
                path="verification"
                element={<Verification />}
              />

              <Route
                path="reports"
                element={<Reports />}
              />

              <Route
                path="settings"
                element={<Settings />}
              />

              <Route
                path="system-center"
                element={<SystemCenter />}
              />

            </Route>

          </Route>


          {/* ==================================================
              CATCH ALL
          ================================================== */}

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
              CATCH-ALL
              ================================================== */}
          
          {/* Redirect any unknown URL back to the Landing Page */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;