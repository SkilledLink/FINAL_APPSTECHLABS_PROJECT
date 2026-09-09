import { BrowserRouter, Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Providers
import { AuthProvider } from './providers/AuthProvider';

// Layouts
import { AuthLayout } from './features/auth/components/AuthLayout';
import AppLayout from './components/layout/AppLayout/AppLayout';

// Auth pages
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage';

// Main pages
import HomePage from './features/home/pages/HomePage';
import Feed from './features/posts/components/Feed';

// Auth hook
import { useAuth } from './features/auth/hooks/useAuth';

// ai assistant
import { AIFloatingWidget } from './features/ai/components/AIFloatingWidget';

// Dashboard
import DashboardPage from './features/dashboard/components/pages/DashboardPage';
import { ProfilePage } from './features/profile';
import { MessagesPage } from './features/messages';
import { DiscoverPage } from './features/discover';

// ─── Professional Portfolio ────────────────────────────────
import PortfolioDashboard from './features/portfolio/pages/PortfolioDashboard';

// ============================================================
// Route guards
// ============================================================

function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated()) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

// ============================================================
// Profile route
// ============================================================

function ProfileRoute() {
  const { id } = useParams<{ id: string }>();

  return <ProfilePage userId={id ?? ''} />;
}

// ============================================================
// Main App
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

        <Routes>
          {/* ==================================================
              AUTH ROUTES
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
              MAIN APPLICATION (protected)
              ================================================== */}

          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="feed" element={<Feed />} />

            {/* Profile */}
            <Route path="profile" element={<ProfileRoute />} />
            <Route path="profile/:id" element={<ProfileRoute />} />

            {/* Messages */}
            <Route path="messages" element={<MessagesPage />} />
            <Route path="discover" element={<DiscoverPage />} />

            {/* ─── Professional Portfolio ─── */}
            <Route path="portfolio" element={<PortfolioDashboard />} />
          </Route>

          {/* ==================================================
              CATCH-ALL
              ================================================== */}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AIFloatingWidget />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;