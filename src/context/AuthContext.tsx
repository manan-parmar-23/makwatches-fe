"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Cookies from "js-cookie";

type UserRole = "customer" | "admin" | null;

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  // Add other user fields as needed
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
  // Add other fields as needed
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register?: (data: RegisterData, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Backend user type for normalization
interface BackendUser {
  ID?: string;
  id?: string;
  Name?: string;
  name?: string;
  Email?: string;
  email?: string;
  Role?: string;
  role?: string;
  // Add other backend fields as needed
}

// Utility to convert backend user shape to frontend User
const normalizeUser = (backendUser: BackendUser): User => ({
  id: backendUser.ID || backendUser.id || "",
  name: backendUser.Name || backendUser.name || "",
  email: backendUser.Email || backendUser.email || "",
  role: backendUser.Role || backendUser.role || "",
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const normalizeRole = (value: unknown): UserRole => {
    if (!value) return null;
    const r = String(value)
      .trim()
      .toLowerCase()
      .replace(/^role_/, "");
    if (["admin", "administrator"].includes(r)) return "admin";
    if (["customer", "user", "client"].includes(r)) return "customer";
    return null;
  };

  // Map frontend role to backend expected value (adjust if backend differs)
  const mapRoleForBackend = (r: UserRole): string | undefined => {
    if (!r) return undefined;
    // Common backend variants: admin / customer
    if (r === "admin") return "admin";
    if (r === "customer") return "customer";
    return (r as string).toLowerCase();
  };

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/me");
      const backendUser = res.data.data;
      const frontendUser = normalizeUser(backendUser);
      setUser(frontendUser);
      setRole(normalizeRole(frontendUser.role));
    } catch (error) {
      console.error("Error fetching profile:", error);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const customerToken = Cookies.get("customerToken");
    const adminToken = Cookies.get("adminToken");
    const token = customerToken || adminToken;
    if (token) {
      fetchProfile();
    } else {
      setRole(null);
      setUser(null);
      setLoading(false);
    }
  }, [fetchProfile]);

  const login = async (
    email: string,
    password: string,
    expectedRole: UserRole
  ) => {
    try {
      if (!expectedRole) throw new Error("Role not specified for login");
      const res = await api.post("/auth/login", {
        email,
        password,
        role: mapRoleForBackend(expectedRole),
      });
      const payload = res.data?.data; // { user, token }
      if (!payload || !payload.user || !payload.token) {
        throw new Error("Login response missing user or token");
      }
      const loggedInUser = normalizeUser(payload.user);
      const token = payload.token as string;
      const userRole = normalizeRole(loggedInUser.role);
      if (!userRole) throw new Error("Login response missing user role");
      const expectedNorm = normalizeRole(expectedRole);
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "Login debug => backend role:",
          loggedInUser.role,
          "normalized:",
          userRole,
          "expected:",
          expectedNorm
        );
      }
      if (userRole !== expectedNorm) {
        throw new Error(`Invalid credentials for ${expectedNorm} login`);
      }
      const tokenKey = userRole === "admin" ? "adminToken" : "customerToken";
      Cookies.set(tokenKey, token, { expires: 7 });
      localStorage.setItem(tokenKey, token);
      setRole(userRole);
      setUser(loggedInUser);
      if (userRole === "customer") {
        router.replace("/");
      } else {
        router.replace("/admin/dashboard");
      }
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `Redirected to ${userRole === "customer" ? "/" : "/admin/dashboard"}`
        );
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "message" in error) {
        alert(
          (error as { message?: string }).message || "Authentication failed"
        );
      }
      if (typeof error === "object" && error !== null && "response" in error) {
        const errObj = error as {
          response?: { data?: unknown };
          message?: string;
        };
        console.error("Login failed:", errObj.response?.data || errObj.message);
      } else {
        console.error("Login failed:", error);
      }
    }
  };

  const register = async (data: RegisterData, regRole: UserRole) => {
    try {
      if (!regRole) throw new Error("Role not specified for registration");
      const backendRole = mapRoleForBackend(regRole);
      const payload = { ...data, role: backendRole };
      if (process.env.NODE_ENV !== "production") {
        console.log("Register request payload:", payload);
      }
      const res = await api.post("/auth/register", payload);
      if (process.env.NODE_ENV !== "production") {
        console.log("Register response:", res.data);
      }
      await login(data.email, data.password, regRole); // auto login with explicit role
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        console.error(
          "Register failed: ",
          (error.response as { data?: unknown })?.data ||
            (error instanceof Error ? error.message : String(error))
        );
      } else {
        console.error("Register failed:", error);
      }
    }
  };

  const logout = () => {
    if (role) {
      const tokenKey = role === "customer" ? "customerToken" : "adminToken";
      Cookies.remove(tokenKey);
      localStorage.removeItem(tokenKey);
    }
    setUser(null);
    setRole(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
