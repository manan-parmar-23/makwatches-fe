"use client";
import { useEffect, useState } from "react";
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

// Fallback product (mirrors style from provided screenshot)
const FALLBACK: DisplayProduct = {
  id: "placeholder",
  name: "Black-blue T-shirt for men",
  price: 1799,
  images: ["/tshirt1.png", "/tshirt2.png", "/tshirt3.png"],
  description:
    "Classic cotton tee with breathable fabric & printed graphic.\n• 100% Cotton\n• Machine washable\n• Regular fit\n• Durable stitching",
  brand: "Pehnaw",
  category: "Men/T-Shirts",
  stock: 25,
};

export default function ProductDetailsPage() {
  const params = useSearchParams();
  const id = params.get("id");
  const [product, setProduct] = useState<DisplayProduct>(FALLBACK);
  const [error, setError] = useState<string | null>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Fetch product by id (public)
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
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
        if (!cancelled) setError("Failed to load product (showing fallback)");
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
      if (!selectedSize) {
        setAddMsg("Please select a size first.");
        return;
      }
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
        `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080"}/cart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          // Include size for forward compatibility (backend may ignore if unsupported)
          body: JSON.stringify({
            productID: product.id,
            quantity: qty,
            size: selectedSize,
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
    <main className="container mx-auto px-4 md:px-8 py-8 max-w-7xl text-gray-800 mt-10 md:mt-0">
      {error && (
        <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm animate-fadeIn">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-10">
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="aspect-square w-full bg-white flex items-center justify-center border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
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
                    ? "ring-2 ring-[#531A1A] ring-offset-1 shadow-md scale-105"
                    : "hover:ring-1 hover:ring-[#531A1A] hover:scale-[1.02]"
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
          <div className="pb-6 border-b border-gray-200">
            <h2 className="text-sm font-medium mb-2 tracking-wide uppercase text-[#531A1A]/80">
              {product.brand} • {product.category || "Category"}
            </h2>
            <h1 className="text-2xl md:text-3xl font-semibold leading-snug mb-3 text-[#531A1A]">
              {product.name}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl font-semibold">
                {priceTag}
              </span>
              {isOutOfStock ? (
                <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                  Out of Stock
                </span>
              ) : (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  In Stock
                </span>
              )}
            </div>
          </div>

          {/* Size selector */}
          <div className="my-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Select Size</span>
              {!selectedSize && (
                <span className="text-xs text-red-500">
                  Please select a size
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {["S", "M", "L", "XL"].map((s) => {
                const active = selectedSize === s;
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-10 h-10 flex items-center justify-center border rounded-md text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-[#531A1A] text-white border-[#531A1A] shadow-sm"
                        : "hover:border-[#531A1A] hover:text-[#531A1A]"
                    }`}
                    aria-pressed={active}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Qty + Add to cart */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center border rounded-md overflow-hidden shadow-sm bg-white">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-lg hover:bg-gray-100 transition"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="px-4 py-2 select-none font-medium">{qty}</span>
              <button
                onClick={() =>
                  setQty((q) => Math.min(product.stock || 10, q + 1))
                }
                className="px-3 py-2 text-lg hover:bg-gray-100 transition"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              onClick={addToCart}
              disabled={adding || isOutOfStock || !selectedSize}
              className="flex-1 px-6 py-3 rounded-md font-semibold text-white bg-[#531A1A] hover:bg-[#632A2A] active:bg-[#431A1A] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
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
              className="w-12 h-12 rounded-full border flex items-center justify-center hover:bg-[#531A1A]/10 transition-colors"
              aria-label="Add to wishlist"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#531A1A"
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
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-3 text-[#531A1A]">
              Product Details
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700 max-h-60 overflow-auto pr-2">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Related products */}
      <section className="mt-16 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-semibold mb-6 text-[#531A1A]">
          You may also like
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {product.images.slice(0, 5).map((img, i) => (
            <div key={i} className="flex flex-col group cursor-pointer">
              <div className="aspect-square w-full border rounded-lg flex items-center justify-center overflow-hidden mb-2 transition-all duration-300 group-hover:shadow-md">
                <Image
                  src={img}
                  alt={`related-${i + 1}`}
                  width={220}
                  height={220}
                  className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-center text-sm font-medium truncate w-full group-hover:text-[#531A1A] transition-colors">
                {product.name}
              </div>
              <div className="text-center text-xs opacity-70">{priceTag}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs / How to use accordions */}
      <section className="mt-16 space-y-4">
        {[
          {
            title: "How to use our Products",
            body: "Care: Machine wash cold, tumble dry low. Do not iron print.",
          },
          {
            title: "FAQs on our products",
            body: "Q: Is the fabric pre-shrunk? A: Yes, minimal shrinkage (<3%).",
          },
        ].map((acc, i) => (
          <details
            key={i}
            className="group border rounded-lg px-5 py-4 shadow-sm hover:shadow transition-all duration-200"
          >
            <summary className="cursor-pointer list-none flex justify-between items-center font-medium text-[#531A1A]">
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
            <div className="mt-3 text-sm text-gray-700 pt-2 border-t border-gray-100">
              {acc.body}
            </div>
          </details>
        ))}
      </section>
    </main>
  );
}
