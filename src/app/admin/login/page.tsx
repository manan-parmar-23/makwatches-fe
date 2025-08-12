"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const PRIMARY = "#531A1A";

export default function AdminAuthPage() {
  const { login, register, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
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
      if (isLogin) {
        await login(form.email, form.password, "admin");
      } else {
        await register?.(
          { email: form.email, password: form.password, name: form.name },
          "admin"
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h2
          className="text-3xl font-bold mb-6 text-center"
          style={{ color: PRIMARY }}
        >
          {isLogin ? "Admin Login" : "Admin Register"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none"
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded focus:outline-none"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded focus:outline-none"
            required
          />
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full py-2 font-bold rounded text-white"
            style={{ background: PRIMARY }}
          >
            {submitting || loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Register"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-sm underline"
            style={{ color: PRIMARY }}
            onClick={() => setIsLogin((v) => !v)}
          >
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
