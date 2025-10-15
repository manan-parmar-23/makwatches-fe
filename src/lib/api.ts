// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080/", // Change to your backend URL
  withCredentials: true, // Allow sending cookies
});

// Interceptor to add Authorization headers if needed
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const customerToken = localStorage.getItem("customerToken");
    const adminToken = localStorage.getItem("adminToken");
    const token = customerToken || adminToken;

    // Do not add Authorization header for registration requests
    const isRegister = config.url?.includes("/auth/register");
    if (isRegister) {
      delete config.headers.Authorization;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
  }
  return config;
});

export default api;
