"use client";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { fetchPublicProductById } from "@/utils/api";
import { wishlistApi } from "@/services/api";
import DiscountBadge, {
  PriceWithDiscount,
  SavingsBadge,
} from "@/components/shared/DiscountBadge";
import { calculateDiscount } from "@/utils/discount";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

interface DisplayProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  description?: string;
  brand?: string;
  category?: string;
  stock?: number;
  discountPercentage?: number | null;
  discountAmount?: number | null;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  dialColor?: string;
  dialShape?: string;
  dialType?: string;
  strapColor?: string;
  strapMaterial?: string;
  style?: string;
  dialThickness?: string;
  movement?: string;
  caseMaterial?: string;
  waterResistance?: string;
  warranty?: string;
  // Home content specific fields
  features?: string[];
  source?: string; // "hero_slide" or "collection_feature"
}

// Professional loading state instead of fallback data
const FALLBACK: DisplayProduct = {
  id: "placeholder",
  name: "Luxury Chronograph Watch",
  price: 12999,
  images: ["/watches/watch1.png", "/watches/watch2.png", "/watches/watch3.png"],
  description:
    "Precision crafted luxury timepiece with Swiss movement.\n• Premium stainless steel case\n• Sapphire crystal glass\n• Water resistant to 100m\n• 1-year international warranty",
  brand: "MAK",
  category: "Men/Luxury",
  stock: 10,
};

function ProductDetailsInner() {
  const params = useSearchParams();
  const id = params.get("id");
  const [product, setProduct] = useState<DisplayProduct>(FALLBACK);
  const [error, setError] = useState<string | null>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<DisplayProduct[]>([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Fetch product by id (public)
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        // First try to fetch from regular products
        let response;

        try {
          response = await fetchPublicProductById(id);
        } catch (productError) {
          // If not found in regular products, try home content
          try {
            response = await fetch(
              `${
                process.env.NEXT_PUBLIC_API_URL ||
                "https://api.makwatches.in/api"
              }/home-content/product/${id}`
            );
            const data = await response.json();
            if (data.success) {
              response = { data };
            } else {
              throw productError;
            }
          } catch {
            throw productError;
          }
        }

        // Debug: Check the exact API response structure
        console.log("=== DEBUG: Full Axios Response ===");
        console.log("response.data:", response.data);
        console.log("response.data.data (product):", response.data.data);
        console.log(
          "Product keys:",
          response.data.data ? Object.keys(response.data.data) : "N/A"
        );

        // Check each specification field individually
        const productData = response.data.data;
        console.log("Checking specification fields:");
        console.log("  dialColor:", productData?.dialColor);
        console.log("  dialShape:", productData?.dialShape);
        console.log("  dialType:", productData?.dialType);
        console.log("  strapColor:", productData?.strapColor);
        console.log("  strapMaterial:", productData?.strapMaterial);
        console.log("  style:", productData?.style);
        console.log("  dialThickness:", productData?.dialThickness);
        console.log("=== END DEBUG ===");

        type PublicPartial = {
          id?: string;
          name?: string;
          price?: number | string; // Can be string from home content
          images?: string[];
          description?: string;
          brand?: string;
          category?: string;
          stock?: number;
          discountPercentage?: number | null;
          discountAmount?: number | null;
          discountStartDate?: string | null;
          discountEndDate?: string | null;
          dialColor?: string;
          dialShape?: string;
          dialType?: string;
          strapColor?: string;
          strapMaterial?: string;
          style?: string;
          dialThickness?: string;
          movement?: string;
          caseMaterial?: string;
          waterResistance?: string;
          warranty?: string;
          gender?: string;
          // Home content specific fields
          features?: string[];
          source?: string;
        };

        // Axios wraps the API response, so actual product data is at response.data.data
        const p: PublicPartial = response.data.data as PublicPartial;

        if (!cancelled && p) {
          // Helper function to clean and validate string values
          const cleanString = (value: string | undefined | null) => {
            if (!value) return undefined;
            const trimmed = value.trim();
            return trimmed.length > 0 ? trimmed : undefined;
          };

          // Parse price if it's a string (from home content)
          let priceValue = FALLBACK.price;
          if (typeof p.price === "number") {
            priceValue = p.price;
          } else if (p.price && typeof p.price === "string") {
            const parsed = parseFloat(
              (p.price as string).replace(/[^0-9.]/g, "")
            );
            if (!isNaN(parsed)) {
              priceValue = parsed;
            }
          }

          const productData = {
            id: p.id || id,
            name: p.name || FALLBACK.name,
            price: priceValue,
            images:
              Array.isArray(p.images) && p.images.length > 0
                ? p.images
                : FALLBACK.images,
            description: p.description || FALLBACK.description,
            brand: p.brand || FALLBACK.brand,
            category: p.category || FALLBACK.category,
            stock: typeof p.stock === "number" ? p.stock : FALLBACK.stock,
            discountPercentage:
              typeof p.discountPercentage === "number"
                ? p.discountPercentage
                : null,
            discountAmount:
              typeof p.discountAmount === "number" ? p.discountAmount : null,
            discountStartDate: p.discountStartDate || null,
            discountEndDate: p.discountEndDate || null,
            dialColor: cleanString(p.dialColor),
            dialShape: cleanString(p.dialShape),
            dialType: cleanString(p.dialType),
            strapColor: cleanString(p.strapColor),
            strapMaterial: cleanString(p.strapMaterial),
            style: cleanString(p.style),
            dialThickness: cleanString(p.dialThickness),
            movement: cleanString(p.movement),
            caseMaterial: cleanString(p.caseMaterial),
            waterResistance: cleanString(p.waterResistance),
            warranty: cleanString(p.warranty),
            // Home content specific fields
            features: Array.isArray(p.features) ? p.features : undefined,
            source: p.source,
          };

          // Debug: Log to verify data
          console.log("Product data being set:", {
            dialColor: productData.dialColor,
            dialShape: productData.dialShape,
            dialType: productData.dialType,
            strapColor: productData.strapColor,
            strapMaterial: productData.strapMaterial,
            style: productData.style,
            dialThickness: productData.dialThickness,
          });

          setProduct(productData);
        }
      } catch {
        if (!cancelled) setError("Failed to load product details");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Fetch related/random products
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE || "https://api.makwatches.in"
          }/catalog/products`
        );
        const json = await response.json();
        if (!cancelled && json.success && Array.isArray(json.data)) {
          // Filter out current product and get random 6 products
          const otherProducts = json.data.filter(
            (p: { id: string }) => p.id !== id
          );
          // Shuffle and take 6 random products
          const shuffled = otherProducts.sort(() => 0.5 - Math.random());
          const randomSix = shuffled
            .slice(0, 6)
            .map(
              (p: {
                id: string;
                name: string;
                price: number;
                images?: string[];
                imageUrl?: string;
                brand?: string;
                category?: string;
                discountPercentage?: number | null;
                discountAmount?: number | null;
                discountStartDate?: string | null;
                discountEndDate?: string | null;
              }) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                images: Array.isArray(p.images)
                  ? p.images
                  : [p.imageUrl || "/watches/watch1.png"],
                brand: p.brand,
                category: p.category,
                discountPercentage: p.discountPercentage,
                discountAmount: p.discountAmount,
                discountStartDate: p.discountStartDate,
                discountEndDate: p.discountEndDate,
              })
            );
          setRelatedProducts(randomSix);
        }
      } catch (err) {
        console.error("Failed to fetch related products:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Check if product is in wishlist on load
  useEffect(() => {
    if (!product.id) return;
    let cancelled = false;
    (async () => {
      try {
        // Retrieve customer token
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("customerToken") ||
              localStorage.getItem("adminToken") ||
              sessionStorage.getItem("adminAuthToken") ||
              localStorage.getItem("auth_token") ||
              localStorage.getItem("authToken")
            : null;
        if (!token) return; // User not logged in, skip check

        const wishlist = await wishlistApi.getWishlist();
        if (!cancelled && wishlist && Array.isArray(wishlist)) {
          const found = wishlist.some(
            (item: { productId?: string; product?: { id?: string } }) =>
              item.productId === product.id || item.product?.id === product.id
          );
          setIsInWishlist(found);
        }
      } catch (err) {
        console.error("Failed to check wishlist status:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  async function addToCart() {
    setAdding(true);
    setAddMsg(null);
    try {
      // Retrieve customer/admin token (multiple legacy keys supported)
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("customerToken") ||
            localStorage.getItem("adminToken") ||
            sessionStorage.getItem("adminAuthToken") || // older admin key
            localStorage.getItem("auth_token") || // generic apiService key
            localStorage.getItem("authToken") // legacy
          : null;
      if (!token) {
        setAddMsg("Please login to add to cart.");
        return;
      }
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE || "https://api.makwatches.in"
        }/cart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          // Remove size parameter as not needed for watches
          body: JSON.stringify({
            productID: product.id,
            quantity: qty,
          }),
        }
      );
      const json = await res.json();
      if (res.status === 401) {
        setAddMsg("Session expired. Please login again.");
        return;
      }
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Add to cart failed");
      }
      setAddMsg("Added to cart");
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message || "Failed to add to cart";
      setAddMsg(message);
    } finally {
      setAdding(false);
    }
  }

  async function handleWishlist() {
    if (wishlistLoading) return;
    setWishlistLoading(true);
    setAddMsg(null);
    try {
      // Retrieve customer/admin token
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("customerToken") ||
            localStorage.getItem("adminToken") ||
            sessionStorage.getItem("adminAuthToken") ||
            localStorage.getItem("auth_token") ||
            localStorage.getItem("authToken")
          : null;
      if (!token) {
        setAddMsg("Please login to add to wishlist.");
        return;
      }

      if (isInWishlist) {
        // Remove from wishlist
        await wishlistApi.removeFromWishlist(product.id);
        setIsInWishlist(false);
        setAddMsg("Removed from wishlist");
      } else {
        // Add to wishlist
        await wishlistApi.addToWishlist(product.id);
        setIsInWishlist(true);
        setAddMsg("Added to wishlist!");
      }
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ||
        "Failed to update wishlist. Please login.";
      setAddMsg(message);
    } finally {
      setWishlistLoading(false);
    }
  }

  const isOutOfStock = (product.stock || 0) < 1;
  const discountInfo = calculateDiscount(
    product.price,
    product.discountPercentage,
    product.discountAmount,
    product.discountStartDate,
    product.discountEndDate
  );

  return (
    <main className="container mx-auto px-4 md:px-8 py-12 max-w-7xl text-gray-800 mt-10 md:mt-20 font-inter">
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4"></div>
          <p className="text-amber-800 font-medium">
            Loading luxury timepiece details...
          </p>
        </div>
      ) : error ? (
        <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm animate-fadeIn">
          <span className="font-medium">Error:</span> {error}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6 md:gap-10">
            {/* Left: Images */}
            <div className="space-y-4">
              {/* Main scrollable image carousel */}
              <div className="relative">
                <div
                  className="flex gap-0 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch",
                  }}
                  onScroll={(e) => {
                    const scrollLeft = e.currentTarget.scrollLeft;
                    const width = e.currentTarget.clientWidth;
                    const newIndex = Math.round(scrollLeft / width);
                    if (newIndex !== imgIndex) {
                      setImgIndex(newIndex);
                    }
                  }}
                >
                  {product.images.map((img, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-full aspect-square bg-gradient-to-b from-amber-50 to-white flex items-center justify-center border border-amber-200 rounded-xl overflow-hidden shadow-md snap-center relative"
                    >
                      {/* Discount badge over image - only on first image */}
                      {i === 0 &&
                        discountInfo.isActive &&
                        discountInfo.discountPercentage && (
                          <DiscountBadge
                            discountPercentage={discountInfo.discountPercentage}
                            position="top-left"
                            variant="premium"
                            size="sm"
                          />
                        )}
                      <Image
                        src={img}
                        alt={`${product.name} - Image ${i + 1}`}
                        width={700}
                        height={700}
                        className="object-contain w-full h-full"
                        priority={i === 0}
                      />
                    </div>
                  ))}
                </div>
                {/* Image indicator dots */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/30 px-3 py-2 rounded-full backdrop-blur-sm">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setImgIndex(i);
                        const container = document.querySelector(".snap-x");
                        if (container) {
                          container.scrollTo({
                            left: i * container.clientWidth,
                            behavior: "smooth",
                          });
                        }
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        imgIndex === i
                          ? "bg-white w-6"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
              {/* Thumbnails - Grid layout with max 2 rows */}
              <div className="relative">
                <div className="grid grid-cols-5 gap-2 md:gap-3">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setImgIndex(i);
                        const container = document.querySelector(".snap-x");
                        if (container) {
                          container.scrollTo({
                            left: i * container.clientWidth,
                            behavior: "smooth",
                          });
                        }
                      }}
                      className={`w-full aspect-square border rounded-lg overflow-hidden transition-all duration-200 ${
                        imgIndex === i
                          ? "ring-2 ring-amber-600 ring-offset-1 shadow-md scale-105 border-amber-400"
                          : "hover:ring-1 hover:ring-amber-400 hover:scale-[1.02] border-amber-200"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`thumbnail-${i + 1}`}
                        width={150}
                        height={150}
                        className="object-contain w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Info */}
            <div className="flex flex-col">
              <div className="pb-6 border-b border-amber-200">
                <h2 className="text-sm font-medium mb-2 tracking-wide uppercase text-amber-700">
                  {product.brand} • {product.category || "Luxury Timepieces"}
                </h2>
                <h1 className="text-2xl md:text-3xl font-semibold leading-snug mb-3 text-amber-900">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3">
                  <PriceWithDiscount
                    originalPrice={discountInfo.originalPrice}
                    finalPrice={discountInfo.finalPrice}
                    isActive={discountInfo.isActive}
                    size="lg"
                    className="text-amber-900"
                  />
                  {discountInfo.isActive && discountInfo.savingsText && (
                    <SavingsBadge savingsText={discountInfo.savingsText} />
                  )}
                  {isOutOfStock ? (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-md border border-red-200">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-md border border-amber-200">
                      In Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Watch specifications or features */}
              <div className="my-6">
                <div className="flex items-center mb-3">
                  <span className="text-sm font-medium text-amber-900">
                    {product.source ? "Features" : "Specifications"}
                  </span>
                </div>
                {/* Home content products show features */}
                {product.source &&
                product.features &&
                product.features.length > 0 ? (
                  <div className="space-y-2">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5"></div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Regular products show specifications */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {product.dialColor && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-gray-600">
                          Dial Color:{" "}
                          <span className="font-medium text-gray-800">
                            {product.dialColor}
                          </span>
                        </span>
                      </div>
                    )}
                    {product.dialShape && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-gray-600">
                          Dial Shape:{" "}
                          <span className="font-medium text-gray-800">
                            {product.dialShape}
                          </span>
                        </span>
                      </div>
                    )}
                    {product.dialType && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-gray-600">
                          Dial Type:{" "}
                          <span className="font-medium text-gray-800">
                            {product.dialType}
                          </span>
                        </span>
                      </div>
                    )}
                    {product.dialThickness && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-gray-600">
                          Thickness:{" "}
                          <span className="font-medium text-gray-800">
                            {product.dialThickness}mm
                          </span>
                        </span>
                      </div>
                    )}
                    {product.strapMaterial && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-gray-600">
                          Strap Material:{" "}
                          <span className="font-medium text-gray-800">
                            {product.strapMaterial}
                          </span>
                        </span>
                      </div>
                    )}
                    {product.strapColor && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-gray-600">
                          Strap Color:{" "}
                          <span className="font-medium text-gray-800">
                            {product.strapColor}
                          </span>
                        </span>
                      </div>
                    )}
                    {product.movement && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-gray-600">
                          Movement:{" "}
                          <span className="font-medium text-gray-800">
                            {product.movement}
                          </span>
                        </span>
                      </div>
                    )}
                    {product.caseMaterial && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-gray-600">
                          Case Material:{" "}
                          <span className="font-medium text-gray-800">
                            {product.caseMaterial}
                          </span>
                        </span>
                      </div>
                    )}
                    {product.waterResistance && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-gray-600">
                          Water Resistance:{" "}
                          <span className="font-medium text-gray-800">
                            {product.waterResistance}
                          </span>
                        </span>
                      </div>
                    )}
                    {product.style && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-gray-600">
                          Style:{" "}
                          <span className="font-medium text-gray-800">
                            {product.style}
                          </span>
                        </span>
                      </div>
                    )}
                    {product.warranty && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-gray-600">
                          Warranty:{" "}
                          <span className="font-medium text-gray-800">
                            {product.warranty}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Qty + Add to cart */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center border border-amber-300 rounded-md overflow-hidden shadow-sm bg-white">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-lg hover:bg-amber-50 transition text-amber-800"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 select-none font-medium text-amber-900">
                    {qty}
                  </span>
                  <button
                    onClick={() =>
                      setQty((q) => Math.min(product.stock || 10, q + 1))
                    }
                    className="px-3 py-2 text-lg hover:bg-amber-50 transition text-amber-800"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={addToCart}
                  disabled={adding || isOutOfStock}
                  className="flex-1 px-6 py-3 rounded-md font-semibold text-white bg-amber-700 hover:bg-amber-800 active:bg-amber-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  {adding ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    "Add to cart"
                  )}
                </button>
                <button
                  onClick={handleWishlist}
                  disabled={wishlistLoading}
                  className="w-12 h-12 rounded-full border border-amber-300 flex items-center justify-center hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={
                    isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  {isInWishlist ? (
                    <HeartSolid className="w-5 h-5 text-amber-700" />
                  ) : (
                    <HeartOutline className="w-5 h-5 text-amber-700" />
                  )}
                </button>
              </div>

              {addMsg && (
                <div
                  className={`p-3 mb-6 text-sm rounded-lg transition-all duration-300 ${
                    addMsg.includes("select") ||
                    addMsg.includes("login") ||
                    addMsg.includes("Failed") ||
                    addMsg.includes("expired")
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-green-50 text-green-700 border border-green-200"
                  }`}
                >
                  {addMsg.includes("Added") && <span className="mr-1">✓</span>}
                  {addMsg}
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="p-5 bg-gradient-to-r from-amber-50 to-white rounded-lg border border-amber-200 shadow-sm">
                  <h3 className="font-semibold mb-3 text-amber-800">
                    Product Description
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700 max-h-60 overflow-auto pr-2 scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-amber-100">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16 pt-8 border-t border-amber-200">
              <h3 className="text-xl font-semibold mb-6 text-amber-800">
                Complete Your Collection
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {relatedProducts.map((relatedProduct) => {
                  const relatedDiscountInfo = calculateDiscount(
                    relatedProduct.price || 0,
                    relatedProduct.discountPercentage,
                    relatedProduct.discountAmount,
                    relatedProduct.discountStartDate,
                    relatedProduct.discountEndDate
                  );
                  return (
                    <a
                      key={relatedProduct.id}
                      href={`/product_details?id=${relatedProduct.id}`}
                      className="flex flex-col group cursor-pointer"
                    >
                      <div className="aspect-square w-full border border-amber-200 rounded-lg flex items-center justify-center overflow-hidden mb-2 transition-all duration-300 group-hover:shadow-md bg-gradient-to-b from-amber-50 to-white relative">
                        <Image
                          src={
                            relatedProduct.images[0] || "/watches/watch1.png"
                          }
                          alt={relatedProduct.name}
                          width={220}
                          height={220}
                          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="text-center text-xs sm:text-sm font-medium truncate w-full group-hover:text-amber-800 transition-colors px-1">
                        {relatedProduct.name}
                      </div>
                      <div className="text-center text-xs text-amber-700 flex items-center justify-center gap-1 mt-1">
                        <PriceWithDiscount
                          originalPrice={relatedDiscountInfo.originalPrice}
                          finalPrice={relatedDiscountInfo.finalPrice}
                          isActive={relatedDiscountInfo.isActive}
                          size="sm"
                        />
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {/* FAQs / How to use accordions */}
          <section className="mt-16 space-y-4">
            {[
              {
                title: "Care for Your Luxury Timepiece",
                body: "To maintain your watch's appearance and performance, avoid exposing it to extreme temperatures, magnetic fields, and chemicals. Clean with a soft cloth and store in the provided case when not in use.",
              },
              {
                title: "Shipping & Returns",
                body: "We offer complimentary standard shipping on all orders. If you're not satisfied, returns are accepted within 7 days of delivery in original condition. For expedited shipping or international options, please contact our support team.",
              },
            ].map((acc, i) => (
              <details
                key={i}
                className="group border border-amber-200 rounded-lg px-5 py-4 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-r from-amber-50 to-white"
              >
                <summary className="cursor-pointer list-none flex justify-between items-center font-medium text-amber-800">
                  <span>{acc.title}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="transition-transform duration-300 group-open:rotate-180"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="mt-3 text-sm text-gray-700 pt-2 border-t border-amber-100">
                  {acc.body}
                </div>
              </details>
            ))}
          </section>
        </>
      )}

      {/* Custom scrollbar styles */}
      <style jsx>{`
        /* Webkit browsers (Chrome, Safari, Edge) */
        :global(.scrollbar-thin::-webkit-scrollbar) {
          height: 6px;
          width: 6px;
        }
        :global(.scrollbar-thin::-webkit-scrollbar-track) {
          background: #fef3c7;
          border-radius: 10px;
        }
        :global(.scrollbar-thin::-webkit-scrollbar-thumb) {
          background: #fbbf24;
          border-radius: 10px;
        }
        :global(.scrollbar-thin::-webkit-scrollbar-thumb:hover) {
          background: #f59e0b;
        }

        /* Firefox */
        :global(.scrollbar-thin) {
          scrollbar-width: thin;
          scrollbar-color: #fbbf24 #fef3c7;
        }

        /* Hide scrollbar for main image carousel */
        :global(.scrollbar-hide::-webkit-scrollbar) {
          display: none;
        }
        :global(.scrollbar-hide) {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}

export default function ProductDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="container mx-auto px-4 md:px-8 py-12 max-w-7xl text-gray-800 mt-10 md:mt-20 font-inter">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4"></div>
            <p className="text-amber-800 font-medium">
              Loading product details...
            </p>
          </div>
        </main>
      }
    >
      <ProductDetailsInner />
    </Suspense>
  );
}
