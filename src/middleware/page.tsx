import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes for customers and admins
const customerProtectedRoutes = [
  "/account",
  "/cart",
  "/checkout",
  "/orders",
  "/favourite",
];

const adminProtectedRoutes = [
  "/admin",
  "/admin/dashboard",
  "/admin/overview",
  "/admin/manage-categories",
  "/admin/manage-products",
  "/admin/orders",
  "/admin/customers",
  "/admin/payment",
  "/admin/settings",
];

// Public pages where logged-in users should NOT go again
const customerAuthPages = ["/login", "/register"];
const adminAuthPages = ["/admin/login", "/admin/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read cookies (tokens)
  const customerToken = req.cookies.get("customerToken")?.value;
  const adminToken = req.cookies.get("adminToken")?.value;

  // Customer protected routes
  if (customerProtectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!customerToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Prevent logged-in customer from visiting login/register again
  if (customerAuthPages.includes(pathname) && customerToken) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Admin protected routes
  if (adminProtectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // Prevent logged-in admin from visiting admin login/register again
  if (adminAuthPages.includes(pathname) && adminToken) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

// Define routes where middleware should run
export const config = {
  matcher: [
    // Customer
    "/account",
    "/cart",
    "/checkout",
    "/orders",
    "/favourite",
    "/login",
    "/register",
    // Admin
    "/admin/:path*",
  ],
};
