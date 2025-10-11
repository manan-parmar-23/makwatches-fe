"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function LoadingSpinner() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // This spinner is shown externally, so just initialize as loading
    setIsLoading(true);
    setProgress(0);

    // Start progress animation immediately
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // Accelerate progress as we go to simulate real loading behavior
        const increment = Math.random() * (prev < 70 ? 10 : prev < 90 ? 3 : 1);
        const newProgress = prev + increment;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 100);

    // Cleanup function
    return () => {
      clearInterval(progressInterval);
    };
  }, []);

  // Complete the progress and hide spinner when external signal arrives
  useEffect(() => {
    const completeProgress = () => {
      setProgress(100);
      setTimeout(() => setIsLoading(false), 300);
    };

    // Set up a listener for when the parent component wants to hide the spinner
    const handleHideSpinner = () => {
      completeProgress();
    };

    window.addEventListener("hideSpinner", handleHideSpinner);

    // Finish progress animation when component is about to unmount
    return () => {
      window.removeEventListener("hideSpinner", handleHideSpinner);
      completeProgress();
    };
  }, []); // Dynamic palette colors
  const colors = ["#531A1A", "#5D2323", "#6A2C2C", "#783535"];

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="relative flex flex-col items-center">
            {/* Brand logo with pulsing animation */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.9, 1, 0.9],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 2,
                ease: "easeInOut",
              }}
              className="flex justify-center mb-8"
            >
              <Image
                src="/logo.png"
                alt="Makwatches Logo"
                width={160}
                height={80}
                className="w-40 h-auto"
                priority
              />
            </motion.div>

            {/* Multi-dot loader animation */}
            <div className="flex justify-center items-center space-x-3 mb-6">
              {colors.map((color, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                  animate={{
                    y: ["0%", "-100%", "0%"],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Spinner */}
            <div className="flex justify-center">
              <motion.div
                className="h-14 w-14 border-4 border-[#531A1A]/20 border-t-[#531A1A] rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  ease: "linear",
                }}
              />
            </div>

            {/* Progress bar */}
            <div className="w-64 h-1 bg-[#531A1A]/10 mt-8 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#531A1A]"
                style={{ width: `${progress}%` }}
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>

            {/* Loading text */}
            <motion.p
              className="mt-4 text-[#531A1A] font-medium tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {progress < 100 ? "Loading Experience..." : "Ready!"}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
