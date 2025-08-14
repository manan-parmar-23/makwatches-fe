"use client";
import React, { useCallback } from "react";
import ProductFormModal from "@/components/admin/ProductFormModal";
import { useRouter } from "next/navigation";

// Enhanced Color constants - matching dashboard theme
const COLORS = {
  primary: "#531A1A",
  primaryDark: "#3B1212",
  primaryLight: "#A45A5A",
  secondary: "#BFA5A5",
  background: "#FFFFFF",
  surface: "#F5F5F5",
  surfaceLight: "#E5E5E5",
  text: "#2D1B1B",
  textMuted: "#7C5C5C",
  error: "#B3261E",
  success: "#388E3C",
  inputBg: "#F9F6F6",
  inputBorder: "#BFA5A5",
  inputFocus: "#531A1A",
};

export default function AddProductPage() {
  const router = useRouter();
  const handleClose = useCallback(() => {
    router.push("/admin/dashboard/products");
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Header */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight mb-1"
          style={{ color: COLORS.primary }}
        >
          Add New Product
        </h1>
        <p className="text-xs sm:text-sm" style={{ color: COLORS.textMuted }}>
          Fill in the details to create a new product listing
        </p>
        <div
          className="w-24 h-1 rounded-full mx-auto mt-2"
          style={{
            background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
          }}
        />
      </div>
      {/* Modal */}
      <ProductFormModal open={true} onClose={handleClose} editing={null} />
      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
