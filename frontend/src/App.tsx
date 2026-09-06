import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthLayout } from './features/auth/components/AuthLayout';
import { MessagesPage } from './features/messages';
import { ProfilePage } from './features/profile';
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage';
import AppLayout from './components/layout/AppLayout/AppLayout';
import HomePage from './features/home/pages/HomePage';
import Feed  from './features/posts/components/Feed';

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
        {/* Auth Layout Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Main Application Layout Routes (Includes Dynamic Sidebar) */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:id" element={<ProfilePage />} />
          <Route path="messages" element={<MessagesPage />} />
        </Route>

        {/* ==================== AUTH ==================== */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />


        {/* ==================== DASHBOARD ==================== */}
        <Route path="/dashboard" element={<DashboardPage />} />


        {/* ==================== PROFILE ==================== */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/feed" element={<Feed />} />


        {/* ==================== MESSAGES ==================== */}
        <Route path="/messages" element={<MessagesPage />} />


        {/* ==================== DEFAULT ==================== */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* ==================== 404 ==================== */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;