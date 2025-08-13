"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

// Professional maroon palette
const COLORS = {
  primary: "#531A1A", // Deep maroon
  primaryDark: "#3B1212", // Darker shade
  primaryLight: "#A45A5A", // Lighter shade
  secondary: "#BFA5A5", // Soft accent
  background: "#FFFFFF", // Clean white
  surface: "#F5F5F5", // Soft gray
  surfaceLight: "#E5E5E5",
  text: "#2D1B1B", // Deep brown for text
  textMuted: "#7C5C5C",
  error: "#B3261E",
  success: "#388E3C",
  inputBg: "#F9F6F6",
  inputBorder: "#BFA5A5",
  inputFocus: "#531A1A",
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
