"use client";

import { ReactNode, useEffect } from "react";
import { initLenis, destroyLenis } from "@/hooks/useLenis";

interface LenisProviderProps {
  children: ReactNode;
}

export default function LenisProvider({ children }: LenisProviderProps) {
  useEffect(() => {
    // Initialize Lenis
    initLenis();

    // Cleanup
    return () => {
      destroyLenis();
    };
  }, []);

  return <>{children}</>;
}
