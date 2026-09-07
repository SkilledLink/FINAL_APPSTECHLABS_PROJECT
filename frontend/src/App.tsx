import { BrowserRouter, Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import { AuthLayout } from './features/auth/components/AuthLayout';
import AppLayout from './components/layout/AppLayout/AppLayout';

// Auth
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage';

// Home
import HomePage from './features/home/pages/HomePage';
import Feed from './features/posts/components/Feed'; // make sure this exists

// Auth hook
import { useAuth } from './features/auth/hooks/useAuth';

// Dashboard
import DashboardPage from './features/dashboard/components/pages/DashboardPage';

// Profile (our feature)
import { ProfilePage } from './features/profile';

// Messages
import { MessagesPage } from './features/messages';

// ============================================================
// Route guards (optional – you can enable them as needed)
// ============================================================
function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated()) {
    return <Navigate to="/home" replace />;
  }
  return <Outlet />;
}

function ProfileRoute() {
  const { id } = useParams<{ id: string }>();

  return <ProfilePage userId={id ?? ''} />;
}

// ============================================================
// Main App
// ============================================================
function App() {
  return (
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
        {/* ========== AUTH ROUTES (no layout) ========== */}
        <Route element={<PublicOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Route>

        {/* ========== MAIN APPLICATION (with AppLayout) ========== */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="feed" element={<Feed />} />

          {/* Profile routes – with or without an ID */}
          <Route path="profile" element={<ProfileRoute />} />
          <Route path="profile/:id" element={<ProfileRoute />} />

          <Route path="messages" element={<MessagesPage />} />
        </Route>

        {/* ========== CATCH‑ALL ========== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;