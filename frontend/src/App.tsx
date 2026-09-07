import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
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
import Feed from './features/posts/components/Feed';// Make sure you create this page
import ContactPage from './api/auth/AuthCheck'; // Make sure you create this page

// Import your auth hook to check if the user is logged in
import { useAuth } from './features/auth/hooks/useAuth';

// 1. Protects the app: If not logged in, redirect to /login
function AuthCheck() { 
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

// 2. Public only: If logged in, redirect to /home (prevents seeing login/register while logged in)
function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated()) {
    return <Navigate to="/home" replace />;
  }
  return <Outlet />;
}

// Dashboard
import DashboardPage from './features/dashboard/components/pages/DashboardPage';

// Profile
import { ProfilePage } from './features/profile';

// Messages
import { MessagesPage } from './features/messages';

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
        {/* ==================== AUTH ==================== */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* ==================== MAIN APPLICATION ==================== */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />

          <Route path="dashboard" element={<DashboardPage />} />

          <Route path="feed" element={<Feed />} />

          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:id" element={<ProfilePage />} />

          <Route path="messages" element={<MessagesPage />} />
        </Route>

        {/* ==================== DEFAULT ==================== */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;