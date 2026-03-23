"use client";

import { useState } from "react";
import { GlassCard, GlassInput, GlassButton } from "@/components/glass";
import { BullLogo } from "@/components/icons/BullLogo";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";

export default function RegisterPage() {
  const register = useAuthStore((s) => s.register);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.password_confirmation) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const { error: authError, needsConfirmation } = await register(
      form.email,
      form.password,
      form.first_name,
      form.last_name
    );

    setLoading(false);

    if (authError) {
      if (authError.toLowerCase().includes("already registered")) {
        setError(
          "An account with this email already exists. Try signing in instead."
        );
      } else if (authError.toLowerCase().includes("password")) {
        setError(
          "Password is too weak. Use at least 8 characters with letters and numbers."
        );
      } else {
        setError(authError);
      }
      return;
    }

    if (needsConfirmation) {
      setSuccess(true);
    }
    // If auto-confirmed, the onAuthStateChange listener in AuthProvider will
    // update the session and the middleware will redirect to /.
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <GlassCard padding="lg">
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-16 h-16 rounded-2xl bg-green-500/20 backdrop-blur-lg flex items-center justify-center border border-green-400/20">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Check your email</h2>
              <p className="text-white/60 text-sm leading-relaxed">
                We&apos;ve sent a confirmation link to{" "}
                <span className="text-white font-medium">{form.email}</span>.
                Click the link to activate your account and sign in.
              </p>
              <Link
                href="/login"
                className="text-sm text-white/80 hover:text-white font-medium transition-colors mt-2"
              >
                Back to sign in
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <BullLogo size={64} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-white/50 mt-1">Get started with LiveStock</p>
        </div>

        <GlassCard padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/15 border border-red-400/20 rounded-xl px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <GlassInput
                label="First Name"
                name="first_name"
                placeholder="John"
                value={form.first_name}
                onChange={(e) =>
                  setForm({ ...form, first_name: e.target.value })
                }
                required
              />
              <GlassInput
                label="Last Name"
                name="last_name"
                placeholder="Smith"
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
                required
              />
            </div>

            <GlassInput
              label="Email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <GlassInput
              label="Password"
              type="password"
              name="password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={8}
              required
            />

            <GlassInput
              label="Confirm Password"
              type="password"
              name="password_confirmation"
              placeholder="Repeat your password"
              value={form.password_confirmation}
              onChange={(e) =>
                setForm({ ...form, password_confirmation: e.target.value })
              }
              required
            />

            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Create Account
            </GlassButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/50">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-white/80 hover:text-white font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
