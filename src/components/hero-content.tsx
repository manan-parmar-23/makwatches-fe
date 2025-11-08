import Image from "next/image";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { HeroSlide } from "@/types/home-content";
import {
  fetchPublicProducts,
  type ProductQueryParams,
  type Product,
} from "@/utils/api";

interface HeroContentProps {
  slides?: HeroSlide[];
}

function HeroContent({ slides }: HeroContentProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  // autoplay always runs; removed pause-on-hover behavior and its state setter
  const [direction, setDirection] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Pre-fetched catalog products from shop (public products)
  const [catalogProducts, setCatalogProducts] = useState<Partial<Product>[]>(
    []
  );
  const [catalogLoaded, setCatalogLoaded] = useState(false);

  // Map dynamic slides to the local view model used by this component
  const products =
    slides && slides.length
      ? slides.map((s) => ({
          id: s.id,
          name: s.title || "MAK Watches",
          subtitle: s.subtitle || "",
          price: s.price || "",
          description: s.description || "",
          image: s.image || "/black-image.png",
          features:
            s.features && s.features.length
              ? s.features
              : ["Water Resistant", "Swiss Movement", "2 Year Warranty"],
          gradient: s.gradient || "from-amber-600 to-transparent",
          glowColor: s.glowColor || "from-amber-500/20",
        }))
      : [];

  // Enhanced slide functions with faster timing
  const nextSlide = useCallback(() => {
    if (products.length === 0) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % products.length);
  }, [products.length]);

  const prevSlide = useCallback(() => {
    if (products.length === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  }, [products.length]);

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
    if (products.length === 0) return;
    const interval = setInterval(nextSlide, 6000); // 6000ms (slower)
    return () => clearInterval(interval);
  }, [nextSlide, products.length]);

  // Note: Removed pause-on-hover behavior to keep autoplay running on hover
  // (Handlers removed intentionally)

  // Fetch a chunk of catalog products once so we can match against them
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Fetch generous page size to improve matching coverage
        const { data } = await fetchPublicProducts({ page: 1, limit: 200 });
        if (!cancelled && data?.success && Array.isArray(data.data)) {
          setCatalogProducts(data.data as Partial<Product>[]);
        }
      } catch {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Failed to prefetch catalog for hero matching");
        }
      } finally {
        if (!cancelled) setCatalogLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Return early if no products available (after all hooks)
  if (products.length === 0) {
    return null;
  }

  const currentProduct = products[currentIndex];
  const nextIndex = (currentIndex + 1) % products.length;
  const nextProduct = products[nextIndex];

  // --- Matching helpers ---
  const normalize = (s?: string) =>
    (s || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

  const getBasename = (p?: string) => {
    if (!p) return "";
    try {
      const noQuery = p.split("?")[0];
      const parts = noQuery.split("/");
      const file = parts[parts.length - 1] || "";
      return file.replace(/\.(png|jpg|jpeg|webp|gif|svg)$/i, "").toLowerCase();
    } catch {
      return "";
    }
  };

  const parsePrice = (s?: string) => {
    if (!s) return undefined;
    const m = s.replace(/[,\s₹$]/g, "").match(/\d+(?:\.\d+)?/);
    return m ? Number(m[0]) : undefined;
  };

  const tokenOverlap = (a: string, b: string) => {
    if (!a || !b) return 0;
    const as = new Set(a.split(" ").filter(Boolean));
    const bs = new Set(b.split(" ").filter(Boolean));
    if (as.size === 0 || bs.size === 0) return 0;
    let inter = 0;
    as.forEach((t) => {
      if (bs.has(t)) inter++;
    });
    const union = as.size + bs.size - inter;
    return inter / union;
  };

  const scoreMatch = (
    hero: {
      name: string;
      subtitle: string;
      description: string;
      image: string;
      price: string;
    },
    p: Partial<Product>
  ) => {
    // Normalize fields
    const heroName = normalize(hero.name);
    const heroSub = normalize(hero.subtitle);
    const heroDesc = normalize(hero.description);
    const heroImg = getBasename(hero.image);
    const heroPrice = parsePrice(hero.price);

    const prodName = normalize(p.name as string);
    const prodBrand = normalize(p.brand as string);
    const prodDesc = normalize(p.description as string);
    const prodImgCandidates = [
      getBasename(p.imageUrl as string),
      ...(Array.isArray(p.images) ? p.images.map((x) => getBasename(x)) : []),
    ].filter(Boolean);

    // Individual component scores
    const nameScore = Math.max(
      tokenOverlap(heroName, prodName),
      tokenOverlap(heroSub, prodName)
    );

    const brandScore = prodBrand && heroName.includes(prodBrand) ? 0.2 : 0; // small boost

    const descScore =
      heroDesc && prodDesc ? tokenOverlap(heroDesc, prodDesc) : 0;

    const imageScore = prodImgCandidates.some(
      (b) =>
        b &&
        heroImg &&
        (b === heroImg || b.includes(heroImg) || heroImg.includes(b))
    )
      ? 0.4
      : 0;

    let priceScore = 0;
    if (heroPrice != null && typeof p.price === "number" && p.price > 0) {
      const diff = Math.abs(p.price - heroPrice);
      const rel = diff / Math.max(1, heroPrice);
      // 0 diff => 0.4, 10% diff => ~0.25, 20% diff => ~0.1
      priceScore = Math.max(0, 0.4 - rel * 1.5);
    }

    // Weighted sum (weights tuned for reliability)
    const total =
      nameScore * 0.5 +
      brandScore * 1 +
      descScore * 0.2 +
      imageScore * 1 +
      priceScore * 1;
    return {
      score: total,
      parts: { nameScore, brandScore, descScore, imageScore, priceScore },
    };
  };

  const findBestCatalogMatch = async () => {
    const hero = {
      name: currentProduct.name,
      subtitle: currentProduct.subtitle,
      description: currentProduct.description,
      image: currentProduct.image,
      price: currentProduct.price,
    };

    let pool = catalogProducts;

    // If catalog isn't loaded yet, fetch a small batch on-demand
    if (!catalogLoaded || pool.length === 0) {
      try {
        const { data } = await fetchPublicProducts({ page: 1, limit: 200 });
        if (data?.success && Array.isArray(data.data)) {
          pool = data.data as Partial<Product>[];
          setCatalogProducts(pool);
          setCatalogLoaded(true);
        }
      } catch {
        // ignore, we'll try with empty pool
      }
    }

    if (!pool || pool.length === 0) return null;

    let best: { item: Partial<Product>; score: number } | null = null;
    for (const p of pool) {
      const { score } = scoreMatch(hero, p);
      if (!best || score > best.score) {
        best = { item: p, score };
      }
    }

    // Require a reasonable threshold to avoid wrong product
    if (best && best.score >= 0.45 && best.item.id) {
      if (process.env.NODE_ENV !== "production") {
        console.log("Hero match score:", best.score, "=>", best.item.name);
      }
      return best.item as Partial<Product>;
    }
    return null;
  };

  const handleShopNow = async () => {
    if (isNavigating) return;
    setIsNavigating(true);
    try {
      const match = await findBestCatalogMatch();
      if (match?.id) {
        router.push(`/product_details?id=${encodeURIComponent(match.id)}`);
        return;
      }

      // Last attempt: try querying backend by name to reduce the pool, then match again
      const searchQuery = (
        currentProduct.subtitle ||
        currentProduct.name ||
        ""
      ).trim();
      if (searchQuery) {
        const q: ProductQueryParams = {
          page: 1,
          limit: 100,
          name: searchQuery,
        } as ProductQueryParams;
        try {
          const { data } = await fetchPublicProducts(q);
          if (data?.success && Array.isArray(data.data) && data.data.length) {
            const pool = data.data as Partial<Product>[];
            let best: { item: Partial<Product>; score: number } | null = null;
            const hero = {
              name: currentProduct.name,
              subtitle: currentProduct.subtitle,
              description: currentProduct.description,
              image: currentProduct.image,
              price: currentProduct.price,
            };
            for (const p of pool) {
              const { score } = scoreMatch(hero, p);
              if (!best || score > best.score) best = { item: p, score };
            }
            if (best && best.item.id) {
              router.push(
                `/product_details?id=${encodeURIComponent(
                  best.item.id as string
                )}`
              );
              return;
            }
          }
        } catch {
          // ignore and continue to final fallback
        }
      }

      // Final fallback: stay on page but do not route to shop to avoid wrong product
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "No reliable product match found for hero slide",
          currentProduct
        );
      }
    } catch (error) {
      console.error("Error searching for product:", error);
    } finally {
      setIsNavigating(false);
    }
  };

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

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-8rem)] ${
            isMobile ? "gap-4" : ""
          }`}
        >
          {/* Left Content */}
          <div className="flex flex-col justify-center space-y-6 md:space-y-4 text-white order-2 lg:order-1 md:ml-30">
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
                className="absolute bottom-44 right-0 md:bottom-70 md:right-0 w-16 h-16 md:w-36 md:h-36 overflow-hidden cursor-pointer group"
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
                className="absolute bottom-44 left-0 md:bottom-70 md:left-0 w-16 h-16 md:w-36 md:h-36 overflow-hidden cursor-pointer group"
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
                      products[
                        (currentIndex - 1 + products.length) % products.length
                      ].image
                    }
                    alt={`Prev: ${
                      products[
                        (currentIndex - 1 + products.length) % products.length
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
    </motion.div>
  );
}
export default HeroContent;
