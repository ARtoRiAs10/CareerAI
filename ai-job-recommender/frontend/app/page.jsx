"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../lib/api";
import { Briefcase, Sparkles, CheckCircle, ArrowRight } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data =
        mode === "login"
          ? await authApi.login({ email: form.email, password: form.password })
          : await authApi.register(form);
      login(data);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "AI-powered job recommendations tailored to your skills",
    "Instant cover letter generation with one click",
    "Semantic skill matching with NLP technology",
    "Track applications and save cover letters",
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xl font-bold">CareerAI</span>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Your AI Career <br />
              <span className="text-yellow-300">Companion</span>
            </h1>
            <p className="text-indigo-200 mt-4 text-lg">
              Land your dream job faster with AI-powered recommendations and personalized cover letters.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-indigo-100 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 rounded-xl p-4">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span className="text-white text-sm">
            Powered by Claude AI for intelligent matching
          </span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CareerAI</span>
          </div>

          <div className="card">
            {/* Tab switcher */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              {["login", "register"].map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    mode === m
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {m === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {mode === "login" ? "Welcome back" : "Get started free"}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {mode === "login"
                ? "Sign in to access your AI job recommendations"
                : "Create an account to start your AI-powered job search"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              )}

              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder={mode === "register" ? "At least 6 characters" : "Your password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={mode === "register" ? 6 : undefined}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                className="text-indigo-600 font-medium hover:underline"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
