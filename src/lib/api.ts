// src/lib/api.ts
import axios from "axios";

function resolveBaseURL(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv;

  if (typeof window !== "undefined") {
    const host = window.location.hostname || "";
    const isLocal = host === "localhost" || host === "127.0.0.1";

    if (isLocal) return "http://127.0.0.1:8080";

    // Any makwatches domain or hosted previews default to prod API
    if (host.endsWith("makwatches.in") || host.includes("mak-watches")) {
      return "https://api.makwatches.in";
    }

    // If served over https, prefer prod API; otherwise local
    return window.location.protocol === "https:"
      ? "https://api.makwatches.in"
      : "http://127.0.0.1:8080";
  }

  // SSR fallback
  return process.env.NODE_ENV === "production"
    ? "https://api.makwatches.in"
    : "http://127.0.0.1:8080";
}

export const API_BASE_URL = resolveBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Allow sending cookies
});

// Interceptor to add Authorization headers if needed
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const customerToken = localStorage.getItem("customerToken");
    const adminToken = localStorage.getItem("adminToken");
    const token = customerToken || adminToken;

    // Debug logging
    console.log("[API Request]", config.method?.toUpperCase(), config.url);
    console.log("[API Token] customerToken:", customerToken ? "exists" : "missing");
    console.log("[API Token] adminToken:", adminToken ? "exists" : "missing");

    // Do not add Authorization header for registration requests
    const isRegister = config.url?.includes("/auth/register");
    if (isRegister) {
      delete config.headers.Authorization;
      console.log("[API Auth] Skipping auth header for registration");
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[API Auth] Added Bearer token to headers");
    } else {
      delete config.headers.Authorization;
      console.log("[API Auth] No token found, skipping auth header");
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("[API Error] 401 Unauthorized:", error.config?.url);
      console.error("[API Error] Token was sent:", error.config?.headers?.Authorization ? "yes" : "no");
    }
    return Promise.reject(error);
  }
);

export default api;
