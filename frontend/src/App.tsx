// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Landing from '../src/features/home/Landing';
import JobPage from './features/jobs/pages/jobPage';
import Portfolio from './features/portfolio/pages/portfolio';

// ============================================================
// 👇 UNCOMMENT THESE WHEN NEEDED
// ============================================================
// import { MessagesPage } from './features/messages';
// import { ProfilePage } from './features/profile';
// import LoginPage from './features/auth/pages/LoginPage';
// import RegisterPage from './features/auth/pages/RegisterPage';
// import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
// import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
// import VerifyEmailPage from './features/auth/pages/VerifyEmailPage';

// ============================================================
// ✅ YOUR JOB AND PROJECT PAGES
// ============================================================
import CreateJob from './features/jobs/pages/CreateJob';
import CreateProject from './features/portfolio/pages/CreateProject';

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
        {/* ============================================================
            ✅ PROJECT PAGE RENDERS FIRST (DEFAULT)
            ============================================================ */}
        <Route path="/" element={<Navigate to="/create-project" replace />} />
        <Route path="/create-project" element={<CreateProject />} />
        <Route path="/create-job" element={<CreateJob />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/jobs" element={<JobPage />} />
        <Route path="/portfolio" element={<Portfolio />} />

        {/* ============================================================
            ❌ OTHER ROUTES (COMMENTED OUT)
            ============================================================ */}
        {/* 
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/messages" element={<MessagesPage />} />
        */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;