import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

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
          {/* Dynamic navigation with client components will handle admin route check */}
          <Navbar />
          <main className="flex-grow pt-16 md:pt-20">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
