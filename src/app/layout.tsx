import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import NavGuard from "@/components/NavGuard";
import FooterGuard from "@/components/FooterGuard";

export const metadata: Metadata = {
  title: "Pehnaw",
  description: "Modern Fashion E-commerce Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          {/* NavGuard will hide Navbar on /login */}
          <NavGuard />
          <main className="flex-grow pt-0 md:pt-0">{children}</main>
          {/* FooterGuard will hide Footer on /login */}
          <FooterGuard />
        </AuthProvider>
      </body>
    </html>
  );
}
