<<<<<<< Updated upstream
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
=======
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MessagesPage } from './features/messages';
import { ProfilePage } from './features/profile';
import Landing from './features/home/Landing'
import CreateJob from './features/jobs/pages/CreateJob'
import CreateProject from './features/portfolio/pages/CreateProject'

function App() {
  return (
    <BrowserRouter> 
      <Routes>
        {/* Redirect root to home for testing */}
        <Route path="/" element={<Landing />} />
        
>>>>>>> Stashed changes

        {/* Profile Routes */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />

        {/* Messages Route */}
        <Route path="/messages" element={<MessagesPage />} />
        {/* Create Job Route */}
        <Route path="/create-job" element={<CreateJob />} />
        {/* Create Project Route */}
        <Route path="/create-project" element={<CreateProject />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;