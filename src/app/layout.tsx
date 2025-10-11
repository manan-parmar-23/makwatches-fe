import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ShoppingLayout from "./ShoppingLayout";
import NavGuard from "@/components/NavGuard";
import FooterGuard from "@/components/FooterGuard";
import PageTransition from "@/components/page-transition";
import LenisProvider from "@/components/lenis-provider";

export const metadata: Metadata = {
  title: "MAK Watches",
  description: "MAK — Premium watch e-commerce",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <LenisProvider>
          <AuthProvider>
            <ShoppingLayout>
              {/* NavGuard will hide Navbar on /login */}
              <NavGuard />

              {/* Page transition wrapper */}
              <main className="flex-grow pt-0 md:pt-0">
                <PageTransition>{children}</PageTransition>
              </main>

              {/* FooterGuard will hide Footer on /login */}
              <FooterGuard />
            </ShoppingLayout>
          </AuthProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
