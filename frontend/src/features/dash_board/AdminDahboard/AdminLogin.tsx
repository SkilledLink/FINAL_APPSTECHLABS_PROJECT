import { FormEvent, useState } from "react";
import { Lock, Mail, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();

    setError("");

    // Temporary frontend authentication.
    // Replace this with your FastAPI login endpoint later.
    if (
      email === "admin@appstechlabs.com" &&
      password === "admin123"
    ) {
      localStorage.setItem("adminAuthenticated", "true");

      navigate("/admin");
    } else {
      setError("Invalid administrator email or password.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-xl shadow-blue-600/20">
            A
          </div>

          <h1 className="mt-4 text-2xl font-bold text-white">
            APPSTECHLABS
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Administrator Portal
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-white p-7 shadow-2xl">
          <div className="mb-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck size={20} />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Welcome back
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Sign in to access the administration dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Administrator email
              </label>

              <div className="flex items-center rounded-xl border border-slate-200 px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
                <Mail size={17} className="text-slate-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@appstechlabs.com"
                  className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <div className="flex items-center rounded-xl border border-slate-200 px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
                <Lock size={17} className="text-slate-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99]"
            >
              Sign in to Admin
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Authorized administrators only
          </p>
        </div>
      </div>
    </div>
  );
}