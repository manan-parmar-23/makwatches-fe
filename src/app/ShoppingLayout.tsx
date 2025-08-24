"use client";

import React from "react";
import { ShoppingProvider } from "@/context/ShoppingContext";
import { Toaster } from "react-hot-toast";

export default function ShoppingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShoppingProvider>
      {children}
      <Toaster position="top-center" />
    </ShoppingProvider>
  );
}
