"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

// Mak Watches brand palette (black/gold/off-white)
const COLORS = {
  primary: "#1A1A1A", // Deep black
  primaryDark: "#000000", // Pure black
  primaryLight: "#232323", // Near-black
  accent: "#C6A664", // Gold accent
  secondary: "#F5F5F5", // Off white (surfaces)
  background: "#FFFFFF", // Page background
  surface: "#F5F5F5", // Cards/surfaces
  surfaceLight: "#E5E5E5",
  text: "#262626", // Gray-800-ish for readability
  textMuted: "#737373", // Gray-500
  error: "#EF4444",
  success: "#22C55E",
  inputBg: "#FAFAFA",
  inputBorder: "#E5E5E5",
  inputFocus: "#C6A664", // Focus ring in gold
};

export default function CustomerAuthPage() {
  const { login, register, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(""); // Clear error on input change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(form.email, form.password, "customer");
      } else {
        await register?.(
          { email: form.email, password: form.password, name: form.name },
          "customer"
        );
      }
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "message" in err) {
        setError(
          (err as { message?: string }).message || "Authentication failed"
        );
      } else {
        setError("Authentication failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute top-0 -left-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-blob"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
          }}
        />
        <div
          className="absolute top-0 -right-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primaryLight}, ${COLORS.secondary})`,
          }}
        />
        <div
          className="absolute -bottom-8 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"
          style={{
            background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.primary})`,
          }}
        />
      </div>

      <div className="w-full max-w-md p-1 relative z-10">
        {/* Gradient border effect */}
        <div
          className="rounded-2xl p-[1px] shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight}, ${COLORS.secondary})`,
          }}
        >
          <div
            className="p-8 rounded-2xl backdrop-blur-lg"
            style={{ backgroundColor: COLORS.surface }}
          >
            {/* Logo/Icon placeholder */}
            <div className="flex justify-center mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
                }}
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>

            <h2
              className="text-3xl font-bold mb-2 text-center bg-gradient-to-r bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.primaryLight})`,
              }}
            >
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-center mb-8" style={{ color: COLORS.textMuted }}>
              {isLogin ? "Sign in to your account" : "Join us today"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    placeholder=" "
                    value={form.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-4 py-3 rounded-lg transition-all duration-300 peer"
                    style={{
                      backgroundColor: COLORS.inputBg,
                      borderWidth: "2px",
                      borderColor:
                        focusedField === "name"
                          ? COLORS.inputFocus
                          : COLORS.inputBorder,
                      color: COLORS.text,
                    }}
                    required
                  />
                  <label
                    className="absolute left-4 top-3 transition-all duration-300 pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-6 peer-focus:text-sm peer-focus:left-0 peer-valid:-top-6 peer-valid:text-sm peer-valid:left-0"
                    style={{
                      color:
                        focusedField === "name"
                          ? COLORS.primary
                          : COLORS.textMuted,
                    }}
                  >
                    Name
                  </label>
                </div>
              )}

              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder=" "
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-4 py-3 rounded-lg transition-all duration-300 peer"
                  style={{
                    backgroundColor: COLORS.inputBg,
                    borderWidth: "2px",
                    borderColor:
                      focusedField === "email"
                        ? COLORS.inputFocus
                        : COLORS.inputBorder,
                    color: COLORS.text,
                  }}
                  required
                />
                <label
                  className="absolute left-4 top-3 transition-all duration-300 pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-6 peer-focus:text-sm peer-focus:left-0 peer-valid:-top-6 peer-valid:text-sm peer-valid:left-0"
                  style={{
                    color:
                      focusedField === "email"
                        ? COLORS.primary
                        : COLORS.textMuted,
                  }}
                >
                  Email
                </label>
              </div>

              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder=" "
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-4 py-3 rounded-lg transition-all duration-300 peer"
                  style={{
                    backgroundColor: COLORS.inputBg,
                    borderWidth: "2px",
                    borderColor:
                      focusedField === "password"
                        ? COLORS.inputFocus
                        : COLORS.inputBorder,
                    color: COLORS.text,
                  }}
                  required
                />
                <label
                  className="absolute left-4 top-3 transition-all duration-300 pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-6 peer-focus:text-sm peer-focus:left-0 peer-valid:-top-6 peer-valid:text-sm peer-valid:left-0"
                  style={{
                    color:
                      focusedField === "password"
                        ? COLORS.primary
                        : COLORS.textMuted,
                  }}
                >
                  Password
                </label>
              </div>

              {error && (
                <div
                  className="text-sm text-center p-3 rounded-lg animate-shake"
                  style={{
                    backgroundColor: COLORS.error + "20",
                    color: COLORS.error,
                    border: `1px solid ${COLORS.error}40`,
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full py-3 font-semibold rounded-lg text-white transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background:
                    submitting || loading
                      ? COLORS.surfaceLight
                      : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
                  color: submitting || loading ? COLORS.textMuted : "#fff",
                  boxShadow:
                    submitting || loading
                      ? "none"
                      : `0 4px 20px ${COLORS.primary}40`,
                }}
              >
                {submitting || loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Google Sign In button (keeps existing UI intact) */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  // Redirect to backend Google OAuth start endpoint
                  const base =
                    process.env.NEXT_PUBLIC_API_BASE_URL ||
                    "http://127.0.0.1:8080/";
                  // Ensure trailing slash handling
                  const url = base.endsWith("/")
                    ? `${base}auth/google`
                    : `${base}/auth/google`;
                  window.location.href = url;
                }}
                className="w-full py-3 font-semibold rounded-lg flex items-center justify-center space-x-3 border transition-all duration-200 hover:shadow-lg"
                style={{
                  background: "#fff",
                  color: COLORS.text,
                  borderColor: COLORS.inputBorder,
                }}
              >
                {/* Proper Google "G" icon */}
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 533.5 544.3"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.2H272v95h147.1c-6.4 34.6-25.7 63.9-54.8 83.6l88.6 68.9c51.7-47.7 81.6-117.8 81.6-197.3z"
                  />
                  <path
                    fill="#34A853"
                    d="M272 544.3c73.6 0 135.4-24.4 180.6-66.2l-88.6-68.9c-24.6 16.5-56.2 26.3-92 26.3-70.7 0-130.6-47.7-152-111.9l-90.6 70.1C65.9 483.6 161 544.3 272 544.3z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M120 330.6c-10.6-31.2-10.6-64.9 0-96.1L29.4 164.5C10.7 203.3 0 244.7 0 278.4s10.7 75.1 29.4 113.9L120 330.6z"
                  />
                  <path
                    fill="#EA4335"
                    d="M272 109.6c39.9 0 75.9 13.7 104.3 40.9l78.1-78.1C405.9 24.6 345.5 0 272 0 161 0 65.9 60.7 29.4 164.5L120 235.1C141.4 171 201.3 109.6 272 109.6z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="mt-8 text-center">
              <span style={{ color: COLORS.textMuted }}>
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
              </span>
              <button
                type="button"
                className="font-semibold transition-all duration-300 hover:underline"
                style={{ color: COLORS.primary }}
                onClick={() => {
                  setIsLogin((v) => !v);
                  setError("");
                  setForm({ email: "", password: "", name: "" });
                }}
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </div>

            {/* Additional features */}
            <div
              className="mt-6 pt-6 border-t"
              style={{ borderColor: COLORS.surfaceLight }}
            >
              <p
                className="text-center text-sm"
                style={{ color: COLORS.textMuted }}
              >
                By continuing, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-2px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(2px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}
