"use client";

import { usePathname } from "next/navigation";
import Footer from "./footer";

export default function FooterGuard() {
  const pathname = usePathname() || "";
  // hide footer on login page and any nested login routes
  if (pathname.startsWith("/login")) return null;
  return (
    <>
      <Footer />
    </>
  );
}
