"use client";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { fetchPublicProductById } from "@/utils/api";

interface DisplayProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  description?: string;
  brand?: string;
  category?: string;
  stock?: number;
}

// Professional loading state instead of fallback data
const FALLBACK: DisplayProduct = {
  id: "placeholder",
  name: "Luxury Chronograph Watch",
  price: 12999,
  images: ["/watches/watch1.png", "/watches/watch2.png", "/watches/watch3.png"],
  description:
    "Precision crafted luxury timepiece with Swiss movement.\n• Premium stainless steel case\n• Sapphire crystal glass\n• Water resistant to 100m\n• 2-year international warranty",
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

  // Fetch product by id (public)
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { data } = await fetchPublicProductById(id);
        type PublicPartial = {
          id?: string;
          name?: string;
          price?: number;
          images?: string[];
          description?: string;
          brand?: string;
          category?: string;
          stock?: number;
        };
        const p: PublicPartial = data.data as PublicPartial;
        if (!cancelled && p) {
          setProduct({
            id: p.id || id,
            name: p.name || FALLBACK.name,
            price: typeof p.price === "number" ? p.price : FALLBACK.price,
            images:
              Array.isArray(p.images) && p.images.length > 0
                ? p.images
                : FALLBACK.images,
            description: p.description || FALLBACK.description,
            brand: p.brand || FALLBACK.brand,
            category: p.category || FALLBACK.category,
            stock: typeof p.stock === "number" ? p.stock : FALLBACK.stock,
          });
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
        `${process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8080"}/cart`,
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

  const priceTag = `₹${Math.round(product.price)}`;
  const isOutOfStock = (product.stock || 0) < 1;

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
          <div className="grid md:grid-cols-2 gap-10">
            {/* Left: Images */}
            <div className="space-y-4">
              <div className="aspect-square w-full bg-gradient-to-b from-amber-50 to-white flex items-center justify-center border border-amber-200 rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
                <Image
                  src={product.images[imgIndex]}
                  alt={product.name}
                  width={700}
                  height={700}
                  className="object-contain w-full h-full transition-opacity duration-300"
                  priority
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(0, 4).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`aspect-square border rounded-lg overflow-hidden transition-all duration-200 ${
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
                  <span className="text-xl md:text-2xl font-semibold text-amber-800">
                    {priceTag}
                  </span>
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

              {/* Watch specifications */}
              <div className="my-6">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-amber-900">
                    Specifications
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-gray-600">
                      Movement: Swiss Automatic
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-gray-600">Case: Stainless Steel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-gray-600">
                      Water Resistance: 100m
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-gray-600">Warranty: 2 Years</span>
                  </div>
                </div>
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
                  className="w-12 h-12 rounded-full border border-amber-300 flex items-center justify-center hover:bg-amber-50 transition-colors"
                  aria-label="Add to wishlist"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#b45309"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
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
              <div className="p-5 bg-gradient-to-r from-amber-50 to-white rounded-lg border border-amber-200 shadow-sm">
                <h3 className="font-semibold mb-3 text-amber-800">
                  Timepiece Details
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700 max-h-60 overflow-auto pr-2">
                  {product.description}
                </p>
              </div>
            </div>
          </div>

          {/* Related products */}
          <section className="mt-16 pt-8 border-t border-amber-200">
            <h3 className="text-xl font-semibold mb-6 text-amber-800">
              Complete Your Collection
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {product.images.slice(0, 5).map((img, i) => (
                <div key={i} className="flex flex-col group cursor-pointer">
                  <div className="aspect-square w-full border border-amber-200 rounded-lg flex items-center justify-center overflow-hidden mb-2 transition-all duration-300 group-hover:shadow-md bg-gradient-to-b from-amber-50 to-white">
                    <Image
                      src={img}
                      alt={`related-${i + 1}`}
                      width={220}
                      height={220}
                      className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="text-center text-sm font-medium truncate w-full group-hover:text-amber-800 transition-colors">
                    {product.name}
                  </div>
                  <div className="text-center text-xs text-amber-700">
                    {priceTag}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQs / How to use accordions */}
          <section className="mt-16 space-y-4">
            {[
              {
                title: "Care for Your Luxury Timepiece",
                body: "To maintain your watch's appearance and performance, avoid exposing it to extreme temperatures, magnetic fields, and chemicals. Clean with a soft cloth and store in the provided case when not in use.",
              },
              {
                title: "Warranty & Service Information",
                body: "Each MAK timepiece includes a 2-year international warranty. We recommend servicing your mechanical watch every 3-5 years to ensure optimal performance.",
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
