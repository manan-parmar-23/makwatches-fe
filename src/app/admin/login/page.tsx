"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

const COLORS = {
  primary: "#1A1A1A", // Deep black
  primaryDark: "#000000", // Pure black
  primaryLight: "#232323", // Near-black
  accent: "#C6A664", // Gold
  secondary: "#F5F5F5", // Off white
  background: "#FFFFFF",
  surface: "#F5F5F5",
  surfaceLight: "#E5E5E5",
  text: "#262626",
  textMuted: "#737373",
  error: "#EF4444",
  success: "#22C55E",
  inputBg: "#FAFAFA",
  inputBorder: "#E5E5E5",
  inputFocus: "#C6A664",
};

export default function AdminAuthPage() {
  const { login, loading } = useAuth(); // register removed, login-only
  //const isLogin = true; // locked to login-only
  const [form, setForm] = useState({ email: "", password: "" }); // name removed
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // Always use admin login flow (login-only page)
      await login(form.email, form.password, "admin");
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
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-5 animate-pulse"
          style={{ backgroundColor: COLORS.primary }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-3"
          style={{ backgroundColor: COLORS.primaryLight }}
        />
      </div>

      {/* Main container */}
      <div className="relative w-full max-w-md mx-4">
        {/* Card */}
        <div
          className="backdrop-blur-sm border border-opacity-20 rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl"
          style={{
            backgroundColor: COLORS.background,
            borderColor: COLORS.secondary,
            boxShadow: `0 25px 50px -12px ${COLORS.primary}20, 0 0 0 1px ${COLORS.secondary}30`,
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            {/* Logo/Icon */}
            <div
              className="w-16 h-16 mx-auto rounded-2xl mb-6 flex items-center justify-center transform transition-transform duration-300 hover:rotate-6 overflow-hidden"
              style={{ backgroundColor: `${COLORS.primary}10` }}
            >
              <Image
                src="/mak-logo.svg"
                alt="MAK Logo"
                width={64}
                height={64}
                className="object-fill"
                priority
              />
            </div>

            <h1
              className="text-3xl font-bold mb-2 transition-colors duration-300"
              style={{ color: COLORS.text }}
            >
              Admin Login
            </h1>

            <p
              className="text-sm transition-colors duration-300"
              style={{ color: COLORS.textMuted }}
            >
              Welcome back! Please sign in to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:scale-[1.02] placeholder-opacity-70"
                style={{
                  backgroundColor: COLORS.inputBg,
                  borderColor: COLORS.inputBorder,
                  color: COLORS.text,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = COLORS.inputFocus;
                  e.target.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = COLORS.inputBorder;
                  e.target.style.boxShadow = "none";
                }}
                required
              />
            </div>

            {/* Password field */}
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:scale-[1.02] placeholder-opacity-70"
                style={{
                  backgroundColor: COLORS.inputBg,
                  borderColor: COLORS.inputBorder,
                  color: COLORS.text,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = COLORS.inputFocus;
                  e.target.style.boxShadow = `0 0 0 3px ${COLORS.inputFocus}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = COLORS.inputBorder;
                  e.target.style.boxShadow = "none";
                }}
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <div
                className="p-3 rounded-lg text-sm text-center animate-shake border-l-4 transition-all duration-300"
                style={{
                  backgroundColor: `${COLORS.error}10`,
                  color: COLORS.error,
                  borderLeftColor: COLORS.error,
                }}
              >
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full py-4 font-semibold rounded-xl text-white transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
              style={{
                backgroundColor:
                  submitting || loading ? COLORS.textMuted : COLORS.primary,
              }}
              onMouseEnter={(e) => {
                if (!submitting && !loading) {
                  e.currentTarget.style.backgroundColor = COLORS.primaryDark;
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting && !loading) {
                  e.currentTarget.style.backgroundColor = COLORS.primary;
                }
              }}
            >
              <span className="relative z-10">
                {submitting || loading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Please wait...
                  </span>
                ) : (
                  <span>Sign In</span>
                )}
              </span>
              {!submitting && !loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 transition-all duration-700 group-hover:translate-x-full" />
              )}
            </button>
          </form>

          {/* Toggle authentication mode */}
          {/* <div className="mt-8 text-center">
            <button
              type="button"
              className="text-sm transition-all duration-300 hover:underline focus:outline-none focus:underline relative group"
              style={{ color: COLORS.primary }}
              onClick={() => setIsLogin((v) => !v)}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = COLORS.primaryDark;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = COLORS.primary;
              }}
            >
              <span className="relative">
                {isLogin
                  ? "Don't have an account? Create one"
                  : "Already have an account? Sign in"}
                <span
                  className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                  style={{ backgroundColor: COLORS.primary }}
                />
              </span>
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
}
