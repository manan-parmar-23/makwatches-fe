import Image from "next/image";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useScrollTo } from "@/hooks/useLenis";
import { useState, useEffect, useCallback, useRef } from "react";

// Product data structure
const watchProducts = [
  {
    id: 1,
    name: "MAK Watches",
    subtitle: "Supernova",
    price: "₹450",
    description:
      "Circular perfection, a quest essentials, harmonious proportions. Patrimony epitomises stylistic purity, inspired by Vacheron Constantin models from the 1950s.",
    image: "/black-image.png", // You can replace with different watch images
    features: ["Water Resistant", "Swiss Movement", "2 Year Warranty"],
    gradient: "from-amber-600 to-transparent",
    glowColor: "from-amber-500/20",
  },
  {
    id: 2,
    name: "MAK Watches",
    subtitle: "Moonphase",
    price: "₹650",
    description:
      "Elegant sophistication meets lunar precision. This masterpiece captures the eternal dance of celestial bodies, bringing astronomical complexity to your wrist.",
    image: "/women-watch.png", // You can replace with different watch images
    features: ["Moonphase Display", "Sapphire Crystal", "3 Year Warranty"],
    gradient: "from-blue-600 to-transparent",
    glowColor: "from-blue-500/20",
  },
  {
    id: 3,
    name: "MAK Watches",
    subtitle: "Chronograph",
    price: "₹850",
    description:
      "Racing-inspired precision timing. Born from the racetrack, engineered for excellence. Every second counts when you're chasing perfection.",
    image: "/categories/casual.png", // You can replace with different watch images
    features: ["Chronograph Function", "Tachymeter Scale", "5 Year Warranty"],
    gradient: "from-red-600 to-transparent",
    glowColor: "from-red-500/20",
  },
  {
    id: 4,
    name: "MAK Watches",
    subtitle: "Classic",
    price: "₹350",
    description:
      "Timeless elegance in its purest form. A tribute to traditional watchmaking craftsmanship, where simplicity meets sophistication in perfect harmony.",
    image: "/categories/sports.png", // You can replace with different watch images
    features: ["Classic Design", "Leather Strap", "1 Year Warranty"],
    gradient: "from-green-600 to-transparent",
    glowColor: "from-green-500/20",
  },
];

function HeroContent() {
  const { scrollTo } = useScrollTo();
  const [currentIndex, setCurrentIndex] = useState(0);
  // autoplay always runs; removed pause-on-hover behavior and its state setter
  const [direction, setDirection] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentProduct = watchProducts[currentIndex];
  const nextIndex = (currentIndex + 1) % watchProducts.length;
  const nextProduct = watchProducts[nextIndex];

  const handleShopNow = () => {
    scrollTo("#products", { duration: 1.5 });
  };

  // Enhanced slide functions with faster timing
  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % watchProducts.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + watchProducts.length) % watchProducts.length
    );
  }, []);

  // const goToSlide = useCallback(
  //   (index: number) => {
  //     setDirection(index > currentIndex ? 1 : -1);
  //     setCurrentIndex(index);
  //   },
  //   [currentIndex]
  // );

  // Touch/Swipe handlers
  const handlePanEnd = useCallback(
    (event: PointerEvent, info: PanInfo) => {
      const swipeThreshold = 50;
      const swipeVelocityThreshold = 300;

      if (
        Math.abs(info.offset.x) > swipeThreshold ||
        Math.abs(info.velocity.x) > swipeVelocityThreshold
      ) {
        if (info.offset.x > 0) {
          prevSlide();
        } else {
          nextSlide();
        }
      }
    },
    [nextSlide, prevSlide]
  );

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-play functionality — slowed down for a smoother effect
  useEffect(() => {
    const interval = setInterval(nextSlide, 6000); // 6000ms (slower)
    return () => clearInterval(interval);
  }, [nextSlide]);

  // Note: Removed pause-on-hover behavior to keep autoplay running on hover
  // (Handlers removed intentionally)

  return (
    <motion.div
      ref={containerRef}
      className="min-h-screen bg-secondary relative overflow-hidden"
      drag={isMobile ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onPanEnd={handlePanEnd}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full border border-white/20"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full border border-white/20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/15"></div>
      </div>

      {/* Navigation Arrows (show on all screen sizes for consistent appearance) */}
      {/* <>
        <motion.button
          onClick={prevSlide}
          className="absolute left-3 md:left-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 md:p-3 transition-all duration-200 group"
          aria-label="Previous watch"
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            className="text-white group-hover:text-amber-400 transition-colors duration-200"
          >
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>

        <motion.button
          onClick={nextSlide}
          className="absolute right-3 md:right-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 md:p-3 transition-all duration-200 group"
          aria-label="Next watch"
          whileHover={{ scale: 1.05, x: 2 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            className="text-white group-hover:text-amber-400 transition-colors duration-200"
          >
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      </> */}

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center min-h-[calc(100vh-8rem)] ${
            isMobile ? "gap-4" : ""
          }`}
        >
          {/* Left Content */}
          <div className="flex flex-col justify-center space-y-6 md:space-y-4 text-white order-2 lg:order-1 md:ml-40">
            {/* Brand Tag */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`brand-${currentIndex}`}
                className="inline-flex items-center gap-3 text-accent text-md md:text-base font-semibold tracking-wider uppercase"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div
                  className={`w-14 h-[1.5px] bg-gradient-to-r ${currentProduct.gradient}`}
                ></div>
                Premium Collection
              </motion.div>
            </AnimatePresence>

            {/* Main Title */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`title-${currentIndex}`}
                className="space-y-2 md:space-y-4"
                initial={{ opacity: 0, x: direction * 25, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: direction * -25, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <h1 className="text-4xl text-gray-700 md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                  {currentProduct.name.split(" ")[0]}{" "}
                  <span className="text-accent">
                    {currentProduct.name.split(" ")[1]}
                  </span>
                </h1>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-light text-gray-700 leading-tight">
                  {currentProduct.subtitle}
                </h2>
              </motion.div>
            </AnimatePresence>

            {/* Description */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`desc-${currentIndex}`}
                className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-md"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{
                  duration: 0.25,
                  delay: 0.05,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                {currentProduct.description}
              </motion.p>
            </AnimatePresence>

            {/* Price and CTA */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`price-${currentIndex}`}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4"
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{
                  duration: 0.25,
                  delay: 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                <motion.div
                  className="text-4xl md:text-5xl font-bold text-accent"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.15, ease: "backOut" }}
                >
                  {currentProduct.price}
                </motion.div>

                <motion.button
                  onClick={handleShopNow}
                  className="group relative bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-400 text-gray-700 font-semibold px-8 py-4 rounded-none transition-all duration-200 uppercase tracking-wide text-sm md:text-base shadow-2xl hover:shadow-amber-500/25"
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    BUY NOW
                    <motion.svg
                      width="20"
                      height="20"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    >
                      <path
                        d="M5 12h14M12 5l7 7-7 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></div>
                </motion.button>
              </motion.div>
            </AnimatePresence>

            {/* Features */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`features-${currentIndex}`}
                className="flex flex-wrap gap-6 pt-6 text-sm text-gray-500"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{
                  duration: 0.25,
                  delay: 0.15,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                {currentProduct.features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -8, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{
                      delay: 0.2 + index * 0.05,
                      duration: 0.2,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    {feature}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Content - Watch Image */}
          <div className="relative flex items-center justify-center order-1 lg:order-2 mt-10">
            {/* Dynamic Glow Effect */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`glow-${currentIndex}`}
                className={`absolute inset-0 bg-gradient-radial ${currentProduct.glowColor} via-transparent to-transparent rounded-full blur-3xl scale-150`}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1.5 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </AnimatePresence>

            {/* Watch Container */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`watch-${currentIndex}`}
                className="relative w-full max-w-lg h-[400px] md:h-[600px] lg:h-[700px]"
                initial={{
                  opacity: 0,
                  scale: 0.88,
                  rotateY: direction * 10,
                  x: direction * 40,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotateY: 0,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.92,
                  rotateY: direction * -10,
                  x: direction * -40,
                }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{
                  scale: 1.02,
                  rotateY: 2,
                  transition: { duration: 0.35 },
                }}
              >
                <Image
                  src={currentProduct.image}
                  alt={`${currentProduct.name} ${currentProduct.subtitle}`}
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Next Watch Preview */}
            <AnimatePresence>
              <motion.div
                key={`preview-${nextIndex}`}
                // Symmetric positioning and consistent sizing across breakpoints
                className="absolute bottom-44 right-0 md:bottom-70 md:right-6 w-16 h-16 md:w-36 md:h-36 overflow-hidden cursor-pointer group"
                initial={{ opacity: 0, scale: 0.85, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 16 }}
                transition={{
                  duration: 0.45,
                  delay: 0.25,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                whileHover={{
                  scale: 1.08,
                  borderColor: "rgba(251, 191, 36, 0.6)",
                  transition: { duration: 0.22 },
                }}
                onClick={nextSlide}
              >
                <div className="relative w-full h-full p-1 md:p-2">
                  <Image
                    src={nextProduct.image}
                    alt={`Next: ${nextProduct.subtitle}`}
                    fill
                    className="object-contain opacity-85 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Previous Watch Preview (left side) */}
            <AnimatePresence>
              <motion.div
                key={`preview-prev-${currentIndex}`}
                className="absolute bottom-44 left-0 md:bottom-70 md:left-6 w-16 h-16 md:w-36 md:h-36 overflow-hidden cursor-pointer group"
                initial={{ opacity: 0, scale: 0.85, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 16 }}
                transition={{
                  duration: 0.45,
                  delay: 0.25,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                whileHover={{
                  scale: 1.08,
                  borderColor: "rgba(251, 191, 36, 0.6)",
                  transition: { duration: 0.22 },
                }}
                onClick={prevSlide}
              >
                <div className="relative w-full h-full p-1 md:p-2">
                  <Image
                    src={
                      watchProducts[
                        (currentIndex - 1 + watchProducts.length) %
                          watchProducts.length
                      ].image
                    }
                    alt={`Prev: ${
                      watchProducts[
                        (currentIndex - 1 + watchProducts.length) %
                          watchProducts.length
                      ].subtitle
                    }`}
                    fill
                    className="object-contain opacity-85 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Mobile-specific touch indicator */}
            {isMobile && (
              <motion.div
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60 text-xs text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M15 18l-6-6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Swipe to browse</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M9 18l6-6-6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Carousel Indicators
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-3">
          {watchProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative w-12 h-1 transition-all duration-200 ${
                index === currentIndex
                  ? "bg-amber-400"
                  : "bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === currentIndex && (
                <motion.div
                  className="absolute inset-0 bg-amber-400"
                  layoutId="activeIndicator"
                  initial={false}
                  transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
              )}
            </button>
          ))}
        </div>
      </div> */}

      {/* Progress Bar
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
          initial={{ width: "0%" }}
          animate={{
            width: isPlaying
              ? "100%"
              : `${((currentIndex + 1) / watchProducts.length) * 100}%`,
          }}
          transition={{
            duration: isPlaying ? 4 : 0,
            ease: "linear",
            repeat: isPlaying ? Infinity : 0,
          }}
        />
      </div> */}
    </motion.div>
  );
}

export default HeroContent;
