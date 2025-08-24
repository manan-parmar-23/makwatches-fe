"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroContent from "./hero-content";

const Hero = () => {
  const [hasWatchedIntro, setHasWatchedIntro] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [showHeroContent, setShowHeroContent] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false); // default: sound on
  const [lastFramePosterUrl] = useState<string | null>("/hero-image.png");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Using a static hero image from /public/hero-image.png by default

  // Function to handle video play with sound
  const handleVideoPlay = () => {
    if (videoRef.current) {
      // Try to play with sound first
      videoRef.current.muted = false;
      setIsVideoMuted(false);
      videoRef.current.volume = 0.7; // Set to 70% volume

      videoRef.current.play().catch((err) => {
        console.log("Auto-play with sound failed, trying muted:", err);
        // If autoplay with sound fails (common in some browsers), try muted
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsVideoMuted(true);
          videoRef.current.play();
        }
      });
    }
  };

  useEffect(() => {
    // On home page, always show intro video on refresh
    // We'll use sessionStorage instead of localStorage to make it play on each page refresh
    const hasWatchedThisSession = sessionStorage.getItem(
      "pehnaw-intro-watched"
    );

    if (hasWatchedThisSession) {
      setHasWatchedIntro(true);
      setShowHeroContent(true);
    } else {
      // Reset for new session
      setHasWatchedIntro(false);
      setVideoEnded(false);
      setShowHeroContent(false);
    }
  }, []);

  const handleVideoEnded = () => {
    // Mark that the user has seen the intro in this session
    sessionStorage.setItem("pehnaw-intro-watched", "true");

    // Show the hero content with animation
    setVideoEnded(true);
    setTimeout(() => {
      setShowHeroContent(true);
    }, 500);
  };

  // If user manually skips the video
  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    sessionStorage.setItem("pehnaw-intro-watched", "true");
    setVideoEnded(true);
    setShowHeroContent(true);
  };

  // Handle video playback with sound
  useEffect(() => {
    if (!hasWatchedIntro && !videoEnded && videoRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        handleVideoPlay();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [hasWatchedIntro, videoEnded]);

  return (
    <section className="w-full max-w-6xl mx-auto px-2 md:px-4 pt-4 pb-0 relative">
      {/* Using static hero image from public folder instead of extracting from video */}

      {/* Intro Video */}
      <AnimatePresence mode="wait">
        {!hasWatchedIntro && !videoEnded && (
          <motion.div
            className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            {/* Responsive video container */}
            <div className="relative w-full h-full max-h-screen">
              <video
                ref={videoRef}
                src="/pehnaw-intro.mp4"
                className="absolute inset-0 w-full h-full object-cover md:object-contain lg:object-cover"
                autoPlay
                playsInline
                controls={false}
                onEnded={handleVideoEnded}
                poster="/hero-main.png"
              />
            </div>
            <div className="absolute bottom-8 right-8 flex items-center gap-4 z-10">
              {/* Mute/Unmute button */}
              <button
                onClick={() => {
                  if (videoRef.current) {
                    const newMutedState = !videoRef.current.muted;
                    videoRef.current.muted = newMutedState;
                    setIsVideoMuted(newMutedState);

                    if (!newMutedState) {
                      videoRef.current.volume = 1;
                    }
                  }
                }}
                className="bg-white/20 backdrop-blur-sm text-white w-10 h-10 rounded-full hover:bg-white/30 transition-all flex items-center justify-center"
                aria-label={isVideoMuted ? "Unmute" : "Mute"}
              >
                {isVideoMuted ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                )}
              </button>

              {/* Skip button */}
              <button
                onClick={handleSkip}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full hover:bg-white/30 transition-all"
              >
                Skip
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Video Poster Hero Section */}
      {showHeroContent && (
        <motion.div
          className="w-full mb-8 md:mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div
            className="relative w-full overflow-hidden rounded-[20px] md:rounded-[30px] shadow-xl"
            style={{
              paddingBottom: "56.25%", // 16:9 aspect ratio for larger screens
              maxHeight: "600px",
            }}
          >
            {lastFramePosterUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                style={{ backgroundImage: `url(${lastFramePosterUrl})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#531A1A]/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 lg:bottom-12 lg:left-12 z-10 p-2">
                  <motion.button
                    className="bg-white text-[#531A1A] font-semibold rounded-full px-4 py-2 md:py-3 shadow-md border-none flex items-center gap-2 text-base md:text-lg transition hover:bg-[#531A1A] hover:text-white transform hover:scale-105"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    Explore Now
                    <span className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#531A1A] flex items-center justify-center ml-2">
                      <svg
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 16 16"
                      >
                        <path
                          d="M5 8h6M9 6l2 2-2 2"
                          stroke="#fff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </motion.button>
                </div>
              </div>
            ) : (
              // Fallback if poster extraction fails
              <div className="absolute inset-0 bg-gradient-to-r from-[#531A1A] to-[#7d2828] flex items-center justify-center">
                <motion.div
                  className="text-white text-center p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-2xl md:text-4xl font-bold mb-4">
                    PEHNAW COLLECTION
                  </h3>
                  <p className="mb-4 text-white/80">
                    Discover our latest styles
                  </p>
                  <button className="bg-white text-[#531A1A] font-semibold rounded-full px-6 py-2 shadow-md border-none inline-flex items-center gap-2">
                    Explore Now
                    <span className="w-6 h-6 rounded-full bg-[#531A1A] flex items-center justify-center ml-2">
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        viewBox="0 0 16 16"
                      >
                        <path
                          d="M5 8h6M9 6l2 2-2 2"
                          stroke="#fff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Hero Content with Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showHeroContent ? 1 : 0 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        {/* Top grid */}
        <HeroContent />

        {/* Bottom text section */}
        <div className="mt-8 md:mt-12 w-full flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0">
          <h2 className="text-[#531A1A] font-bold text-2xl md:text-3xl lg:text-[2.75rem] md:leading-[1.1] leading-tight text-left tracking-tighter m-0 flex-1">
            Our limit edition kit bundles all your rhode summer essentials in a
            baby rhode bubble.
          </h2>
          <button className="mt-4 md:mt-10 md:-ml-10 border-2 border-[#531A1A] rounded-full px-6 md:px-8 py-1.5 text-[#531A1A] font-normal text-lg md:text-xl transition hover:bg-[#531A1A] hover:text-white tracking-tight flex items-center justify-center h-[40px] md:h-[44px]">
            know us
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
