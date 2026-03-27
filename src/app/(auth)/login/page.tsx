"use client";

import { useState } from "react";
import { GlassCard, GlassInput, GlassButton } from "@/components/glass";
import { BullLogo } from "@/components/icons/BullLogo";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { login as apiLogin, isAuthenticated as apiIsAuthenticated } from "@/lib/api-client";
import { useApiDataStore } from "@/stores/api-data";

export default function LoginPage() {
  const router = useRouter();
  const authLogin = useAuthStore((s) => s.login);
  const loadFromApi = useApiDataStore((s) => s.loadFromApi);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "beef", password: "demo" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const isDemo = form.email === "beef" && form.password === "demo";

    if (isDemo) {
      // Demo login — use existing Supabase/demo auth flow
      const { error: authError } = await authLogin(form.email, form.password);

      if (authError) {
        setError(authError);
        setLoading(false);
        return;
      }

      router.push("/");
      return;
    }

    // Real API login — try livestockpro.app API first
    try {
      await apiLogin(form.email, form.password);

      // API login succeeded — set up a demo-like session so middleware allows access
      document.cookie = "demo_session=true; path=/; max-age=86400; SameSite=Lax";

      // Also set the auth store so the app knows we're logged in
      // We create a synthetic Supabase-like user from the API user data
      const { error: authError } = await authLogin("beef", "demo");
      if (authError) {
        // Even if Supabase demo login fails, we're authenticated via API
        // Just set the cookie and proceed
      }

      // Load API data immediately
      await loadFromApi();

      router.push("/");
    } catch (apiErr) {
      // API login failed — try Supabase auth as fallback
      const { error: authError } = await authLogin(form.email, form.password);

      if (authError) {
        // Translate common error messages
        if (
          authError.toLowerCase().includes("invalid login credentials") ||
          authError.toLowerCase().includes("invalid credentials")
        ) {
          setError("Incorrect username or password. Please try again.");
        } else if (authError.toLowerCase().includes("email not confirmed")) {
          setError("Please confirm your email address before signing in.");
        } else if (authError.toLowerCase().includes("too many requests")) {
          setError("Too many attempts. Please wait a moment and try again.");
        } else if (apiErr instanceof Error && apiErr.message.includes("API Error")) {
          setError("Incorrect username or password. Please try again.");
        } else {
          setError(authError);
        }
        setLoading(false);
        return;
      }

      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <BullLogo size={72} className="text-white" />
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
              label="Username / Email"
              type="text"
              name="email"
              placeholder="username or email"
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

            <p className="text-xs text-center text-white/30 mt-2">
              Demo: beef / demo &middot; Or use your LivestockPro account
            </p>
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
