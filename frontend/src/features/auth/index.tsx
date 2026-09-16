// src/features/auth/index.ts

// Pages
export { default as LoginPage } from "./pages/LoginPage";
export { default as RegisterPage } from "./pages/RegisterPage";
export { default as ForgotPasswordPage } from "./pages/ForgotPasswordPage";
export { default as ResetPasswordPage } from "./pages/ResetPasswordPage";
export { default as VerifyEmailPage } from "./pages/VerifyEmailPage";

// Layouts
export { AuthLayout } from "./components/AuthLayout";

// Components
export { OTPInput } from "./components/OTPInput";

// Hooks
export { useAuth } from "./hooks/useAuth";

// Types
export * from "./types/auth.types";