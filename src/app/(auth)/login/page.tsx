"use client";

import { useState } from "react";
import { GlassCard, GlassInput, GlassButton } from "@/components/glass";
import { Beef, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await login(form.email, form.password);

    if (authError) {
      // Translate common Supabase error messages into user-friendly text
      if (
        authError.toLowerCase().includes("invalid login credentials") ||
        authError.toLowerCase().includes("invalid credentials")
      ) {
        setError("Incorrect email or password. Please try again.");
      } else if (authError.toLowerCase().includes("email not confirmed")) {
        setError("Please confirm your email address before signing in.");
      } else if (authError.toLowerCase().includes("too many requests")) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError(authError);
      }
      setLoading(false);
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-lg flex items-center justify-center mb-4 border border-white/20">
            <Beef className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-white/50 mt-1">Sign in to your account</p>
        </div>

        <GlassCard padding="lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/15 border border-red-400/20 rounded-xl px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <GlassInput
              label="Email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
              required
            />

            <div className="relative">
              <GlassInput
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-white/40 hover:text-white/70 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-white/60">
                <input
                  type="checkbox"
                  className="rounded border-white/20 bg-white/10"
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Sign In
            </GlassButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/50">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-white/80 hover:text-white font-medium transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
