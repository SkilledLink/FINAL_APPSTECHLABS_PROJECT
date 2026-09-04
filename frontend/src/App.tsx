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
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout/AppLayout";
import { VerificationPage } from "./verification/pages/VerificationPage";
// // import { BrowserRouter, Routes, Route } from "react-router-dom";
// // import AppLayout from "./components/layout/AppLayout/AppLayout";
// // import { VerificationPage } from "./verification/pages/VerificationPage";


// // const PlaceholderPage = ({ title }: { title: string }) => (
// //   <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex items-center justify-center h-96">
// //     <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
// //   </div>
// // );

// // function App() {
// //   return (
// //     <BrowserRouter>
// //      <AppLayout />
// //       <Routes>
// //           <Route index element={<PlaceholderPage title="Home Feed" />} />
// //           <Route
// //             path="discover"
// //             element={<PlaceholderPage title="Discover & Search" />}
// //           />
// //           <Route path="/verification" element={<VerificationPage />} />
// //           <Route path="jobs" element={<PlaceholderPage title="Job Board" />} />
// //           <Route
// //             path="portfolio"
// //             element={<PlaceholderPage title="Portfolio Grid" />}
// //           />
// //           <Route
// //             path="professionals"
// //             element={<PlaceholderPage title="Professional Network" />}
// //           />
// //           <Route
// //             path="profile"
// //             element={<PlaceholderPage title="User Profile" />}
// //           />
// //           <Route
// //             path="settings"
// //             element={<PlaceholderPage title="Settings" />}
// //           />
// //           <Route
// //             path="create"
// //             element={<PlaceholderPage title="Create Post" />}
// //           />
// //           <Route
// //             path="*"
// //             element={<PlaceholderPage title="404 - Not Found" />}
// //           />
// //             {/* Other application routes can go here */}
// //             <Route path="/verification" element={<VerificationPage />} />
// //             <Route
// //               path="/"
// //               element={<div className="p-8">Dashboard Home</div>}
// //             />
// //           </Routes>
// //     </BrowserRouter>
// //   );
// // }

// // export default App;


// // src/App.tsx
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// import { MessagesPage } from './features/messages';
// import { ProfilePage } from './features/profile';
// import LoginPage from './features/auth/pages/LoginPage';
// import RegisterPage from './features/auth/pages/RegisterPage';
// import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
// import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
// import VerifyEmailPage from './features/auth/pages/VerifyEmailPage'; // <-- added

// function App() {
//   return (
//     <BrowserRouter>
//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="light"
//       />
//       <Routes>
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/register" element={<RegisterPage />} />
//         <Route path="/verify-email" element={<VerifyEmailPage />} /> {/* new */}
//         <Route path="/reset-password" element={<ResetPasswordPage />} />
//         <Route path="/forgot-password" element={<ForgotPasswordPage />} />

//         {/* Redirect root to profile */}
//         <Route path="/" element={<Navigate to="/profile" replace />} />

//         {/* Profile Routes */}
//         <Route path="/profile" element={<ProfilePage />} />
//         <Route path="/profile/:id" element={<ProfilePage />} />

//         {/* Messages Route */}
//         <Route path="/messages" element={<MessagesPage />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;




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
     <AppLayout />
      <Routes>
          <Route index element={<PlaceholderPage title="Home Feed" />} />
          <Route
            path="discover"
            element={<PlaceholderPage title="Discover & Search" />}
          />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="jobs" element={<PlaceholderPage title="Job Board" />} />
          <Route
            path="portfolio"
            element={<PlaceholderPage title="Portfolio Grid" />}
          />
          <Route
            path="professionals"
            element={<PlaceholderPage title="Professional Network" />}
          />
          <Route
            path="profile"
            element={<PlaceholderPage title="User Profile" />}
          />
          <Route
            path="settings"
            element={<PlaceholderPage title="Settings" />}
          />
          <Route
            path="create"
            element={<PlaceholderPage title="Create Post" />}
          />
          
          <Route
            path="marketplace"
            element={
              <MarketplacePage
                onViewProfile={() => undefined}
                onContact={() => undefined}
              />
            }
          />
          <Route
            path="marketplace/service/:professionalId"
            element={
              <ServiceDetailsPage
                professionalId="1"
                onBack={() => undefined}
                onContact={() => undefined}
              />
            }
          />
          <Route
            path="marketplace/request"
            element={
              <RequestServicePage professionalId="1" onBack={() => undefined} />
            }
          />
          <Route
            path="*"
            element={<PlaceholderPage title="404 - Not Found" />}
          />
            {/* Other application routes can go here */}
            <Route path="/verification" element={<VerificationPage />} />
            <Route
              path="/"
              element={<div className="p-8">Dashboard Home</div>}
            />
          </Routes>
    </BrowserRouter>
  );
}

export default App;
