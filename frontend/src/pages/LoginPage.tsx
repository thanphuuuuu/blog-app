import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      // Error is handled by useAuth hook and exposed via `error` state
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl min-h-[560px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Form Section */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2.5 mb-3"
            >
              <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-extrabold text-[16px] shadow-sm">
                B
              </span>
              <span className="text-[24px] font-extrabold text-slate-900 tracking-tight">
                BlogApp
              </span>
            </Link>
            <h1 className="text-[20px] font-semibold text-slate-800">
              Welcome back
            </h1>
            <p className="text-[14px] text-slate-500 mt-1">
              Please sign in to your account
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                className="block text-[13px] font-medium text-slate-700 mb-1.5"
                htmlFor="email"
              >
                Email address
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                className="block text-[13px] font-medium text-slate-700 mb-1.5"
                htmlFor="password"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={loading}
            >
              Sign in
            </Button>
          </form>

          <div className="mt-8 text-center text-[14px] text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Get started
            </Link>
          </div>
        </div>

        {/* Right Side: Image Banner Container */}
        <div className="hidden md:flex p-6 bg-slate-50 items-center justify-center border-l border-slate-100">
          <div className="relative w-full h-full max-h-[480px] rounded-xl overflow-hidden border border-slate-200/80 shadow-sm">
            <img
              src="/placeholder-login.png"
              alt="Welcome to BlogApp"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
