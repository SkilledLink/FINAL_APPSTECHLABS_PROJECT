import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useParams,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Providers
import { AuthProvider } from "./providers/AuthProvider";

// Layouts
import { AuthLayout } from "./features/auth/components/AuthLayout";
import AppLayout from "./components/layout/AppLayout/AppLayout";

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

// Portfolio
import PortfolioDashboard from "./features/portfolio/pages/PortfolioDashboard";
import { PortfolioPage } from "./features/Portfo/pages/PortfolioPage";

// Users
import UsersPage from "./features/users/pages/UsersPage";

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


// ============================================================
// PUBLIC ONLY ROUTE
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
// ============================================================

function ProfileRoute() {
  const { id } = useParams<{ id: string }>();

  return <ProfilePage userId={id ?? ""} />;
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
              PUBLIC PORTFOLIO
              Accessible regardless of authentication
          ================================================== */}

          <Route
            path="/portfolio"
            element={<PublicPortfolioRoute />}
          />


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

            {/* Profile */}
            <Route
              path="profile"
              element={<ProfileRoute />}
            />

            <Route
              path="profile/:id"
              element={<ProfileRoute />}
            />

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

            {/* Portfolio Dashboard */}
            <Route
              path="portfolio-dashboard"
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

            {/* Marketplace */}
            <Route
              path="marketplace"
              element={<Marketplace />}
            />

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

        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
// ```

// ### Public portfolio URL

// The portfolio is now accessible at:

// ```text
// /portfolio/:id
// ```

// For example:

// ```text
// http://localhost:5173/portfolio/15
// ```

// This route is **outside `AppLayout` and `PublicOnlyRoute`**, so authentication does not affect access to it.

// **Important:** I assumed your `PortfolioPage` accepts a `userId` prop, like:

// ```tsx
// <PortfolioPage userId={id ?? ""} />
// ```

// If your actual `PortfolioPage` does **not** accept `userId` and instead gets the user ID another way, show me that component and I'll adjust the route exactly to it.
