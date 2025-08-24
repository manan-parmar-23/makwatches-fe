"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import LoadingSpinner from "./loading-spinner";

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [showInitialSpinner, setShowInitialSpinner] = useState(false);
  const [pageLoadTimes, setPageLoadTimes] = useState<Record<string, boolean>>(
    {}
  );

  // Detect if the page is taking time to load on initial load
  useEffect(() => {
    const startTime = performance.now();

    // Only show spinner if loading takes more than 300ms
    const timeoutId = setTimeout(() => {
      setShowInitialSpinner(true);
    }, 300);

    // When content is loaded, hide spinner
    const hideSpinner = () => {
      clearTimeout(timeoutId);
      if (performance.now() - startTime < 300) {
        // If load was fast, don't show spinner at all
        setShowInitialSpinner(false);
      } else {
        // Give a small grace period to complete animations
        setTimeout(() => setShowInitialSpinner(false), 500);
      }
    };

    // Listen for page load completion
    window.addEventListener("load", hideSpinner);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("load", hideSpinner);
    };
  }, []);

  // Show spinner when navigating between pages, but only the first time for each path
  useEffect(() => {
    const currentPath = pathname + searchParams.toString();

    // If we haven't navigated to this page before in this session
    if (!pageLoadTimes[currentPath]) {
      setIsNavigating(true);

      // Mark that we've been to this page
      setPageLoadTimes((prev) => ({
        ...prev,
        [currentPath]: true,
      }));

      // Start a timer to detect slow navigation
      const navigationTimer = setTimeout(() => {
        setIsNavigating(false);
      }, 500);

      return () => {
        clearTimeout(navigationTimer);
      };
    } else {
      // We've been to this page before, don't show spinner
      setIsNavigating(false);
    }
  }, [pathname, searchParams, pageLoadTimes]);

  return isNavigating || showInitialSpinner ? <LoadingSpinner /> : null;
}
