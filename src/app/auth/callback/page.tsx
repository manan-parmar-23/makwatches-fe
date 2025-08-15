"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

type JwtClaims = { userId?: string; role?: string };

function decodeJwtPayload(token: string): JwtClaims | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Finishing sign-in…");

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    const error = url.searchParams.get("error");

    if (error) {
      setMessage("Sign-in failed. Redirecting to login…");
      setTimeout(() => (window.location.href = "/login"), 1200);
      return;
    }

    if (!token) {
      setMessage("No token provided. Redirecting to login…");
      setTimeout(() => (window.location.href = "/login"), 1200);
      return;
    }

    const claims = decodeJwtPayload(token) || {};
    const role = String(claims.role || "user").toLowerCase();
    const userId = String(claims.userId || "");

    const isAdmin = role === "admin" || role === "administrator";
    const tokenKey = isAdmin ? "adminToken" : "customerToken";
    try {
      Cookies.set(tokenKey, token, { expires: 7 });
      localStorage.setItem(tokenKey, token);
      if (isAdmin) sessionStorage.setItem("adminAuthToken", token);
      if (userId) localStorage.setItem("userId", userId);
    } catch {
      // ignore persistence errors
    }

    const dest = isAdmin ? "/admin/dashboard" : "/";
    setMessage("Signed in! Redirecting…");
    window.location.replace(dest);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center text-gray-800">
        <div className="text-xl font-semibold">{message}</div>
      </div>
    </div>
  );
}
