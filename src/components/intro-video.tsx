import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const IntroVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasWatchedIntro, setHasWatchedIntro] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the intro
    const hasWatched = localStorage.getItem("pehnaw-intro-watched");

    if (hasWatched) {
      setHasWatchedIntro(true);
    } else {
      // If on mobile, consider the video watched immediately to avoid autoplay issues
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        localStorage.setItem("pehnaw-intro-watched", "true");
        setHasWatchedIntro(true);
      }
    }
  }, []);

  const handleVideoEnded = () => {
    // Mark that the user has seen the intro
    localStorage.setItem("pehnaw-intro-watched", "true");

    // Start fade out animation
    setFadeOut(true);

    // After fade out animation completes, set video as ended
    setTimeout(() => {
      setVideoEnded(true);
    }, 1000);
  };

  // If user manually skips the video
  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    localStorage.setItem("pehnaw-intro-watched", "true");
    setFadeOut(true);
    setTimeout(() => {
      setVideoEnded(true);
    }, 1000);
  };

  // If the video has already been watched or has ended, don't render it
  if (hasWatchedIntro || videoEnded) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {!videoEnded && (
        <motion.div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: fadeOut ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <video
            ref={videoRef}
            src="/pehnaw-intro.mp4"
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
            onEnded={handleVideoEnded}
          />
          <button
            onClick={handleSkip}
            className="absolute bottom-8 right-8 bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full hover:bg-white/30 transition-all z-10"
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroVideo;
