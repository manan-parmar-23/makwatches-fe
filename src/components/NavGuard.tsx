"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";

export default function NavGuard() {
  const pathname = usePathname() || "";
  // hide navbar on login page and any nested login routes
  if (pathname.startsWith("/login")) return null;
  return <Navbar />;
}
