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
  // loading state omitted since skeleton not shown; could be added later
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

  const priceTag = `${Math.round(product.price)}/-`;

  return (
    <main className="container mx-auto px-3 md:px-8 py-6 max-w-7xl text-[#531A1A]">
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Images */}
        <div>
          <div className="aspect-square w-full bg-white flex items-center justify-center border rounded-lg overflow-hidden">
            <Image
              src={product.images[imgIndex]}
              alt={product.name}
              width={600}
              height={600}
              className="object-contain w-full h-full"
            />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {product.images.slice(0, 4).map((img, i) => (
              <button
                key={i}
                onClick={() => setImgIndex(i)}
                className={`aspect-square border rounded-md overflow-hidden ${
                  imgIndex === i ? "ring-2 ring-[#531A1A]" : ""
                }`}
              >
                <Image
                  src={img}
                  alt={`thumb-${i}`}
                  width={120}
                  height={120}
                  className="object-contain w-full h-full"
                />
              </button>
            ))}
          </div>
        </div>
        {/* Right: Info */}
        <div className="flex flex-col">
          <h2 className="text-sm font-medium mb-2 tracking-wide uppercase opacity-80">
            {product.category || "Category"}
          </h2>
          <h1 className="text-2xl md:text-3xl font-semibold leading-snug mb-2">
            {product.name}
          </h1>
          <div className="text-xl font-semibold mb-4">{priceTag}</div>
          {/* Size selector (static placeholder) */}
          <div className="flex items-center gap-2 mb-4">
            {["S", "M", "L", "XL"].map((s) => {
              const active = selectedSize === s;
              return (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-3 py-1.5 border rounded-md text-sm transition ${
                    active
                      ? "bg-[#531A1A] text-white border-[#531A1A]"
                      : "hover:bg-[#531A1A] hover:text-white"
                  }`}
                  aria-pressed={active}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {/* Qty + Add to cart */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center border rounded-md overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-1 text-lg"
              >
                -
              </button>
              <span className="px-4 select-none">{qty}</span>
              <button
                onClick={() =>
                  setQty((q) => Math.min(product.stock || 10, q + 1))
                }
                className="px-3 py-1 text-lg"
              >
                +
              </button>
            </div>
            <button
              onClick={addToCart}
              disabled={adding || (product.stock || 0) < 1 || !selectedSize}
              className="flex-1 px-6 py-3 rounded-md font-semibold text-white bg-[#531A1A] hover:opacity-90 disabled:opacity-50 transition"
            >
              {adding ? "Adding..." : "Add to cart"}
            </button>
            <button
              className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-[#531A1A] hover:text-white transition"
              aria-label="wishlist"
            >
              ♡
            </button>
          </div>
          {addMsg && (
            <div
              className={`text-sm mb-4 ${
                addMsg.includes("select") ? "text-red-600" : ""
              }`}
            >
              {addMsg}
            </div>
          )}
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm leading-relaxed whitespace-pre-line opacity-90 max-h-56 overflow-auto pr-2">
              {product.description}
            </p>
          </div>
        </div>
      </div>
      {/* Related products placeholder (reuse static fallback) */}
      <section className="mt-12">
        <h3 className="text-xl font-semibold mb-6">You may also like</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {product.images.slice(0, 5).map((img, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="aspect-square w-full border rounded-lg flex items-center justify-center overflow-hidden mb-2">
                <Image
                  src={img}
                  alt={`rel-${i}`}
                  width={220}
                  height={220}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="text-center text-sm font-medium truncate w-full">
                {product.name}
              </div>
              <div className="text-xs opacity-70">{priceTag}</div>
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
          <details key={i} className="group border rounded-md px-4 py-3">
            <summary className="cursor-pointer list-none flex justify-between items-center font-medium">
              <span>{acc.title}</span>
              <span className="transition group-open:rotate-45 text-xl leading-none">
                +
              </span>
            </summary>
            <div className="mt-3 text-sm opacity-90">{acc.body}</div>
          </details>
        ))}
      </section>
    </main>
  );
}
