// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { MessagesPage } from './features/messages';
import { ProfilePage } from './features/profile';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage'; // <-- added
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout/AppLayout";
import {
  MarketplacePage,
  RequestServicePage,
  ServiceDetailsPage,
} from "./components/index";
// import { VerificationPage } from "./verification";
// import Header from "./components/Header";
// import Sidebar from "./components/Sidebar";
// import MobileNavigation from "./components/MobileNavigation";

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex h-96 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
    <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
  </div>
);

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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} /> {/* new */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Redirect root to profile */}
        <Route path="/" element={<Navigate to="/profile" replace />} />

        {/* Profile Routes */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />

        {/* Messages Route */}
        <Route path="/messages" element={<MessagesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
