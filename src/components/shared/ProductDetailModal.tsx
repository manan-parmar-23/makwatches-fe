import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  XMarkIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

type ProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id?: string;
    name?: string;
    price?: number | string;
    image?: string;
    images?: string[];
    description?: string;
  };
};

const iconClass = "w-6 h-6"; // For consistent icon sizing

const ProductDetailModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(
    product.image || product.images?.[0] || "/placeholder.png"
  );

  // New states for add-to-cart flow
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState<string | null>(null);

  // Replace simple handler with full add-to-cart logic
  const handleAddToCart = async () => {
    setAdding(true);
    setAddMsg(null);

    try {
      // Retrieve token from multiple legacy keys (same logic as product_details page)
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("customerToken") ||
            localStorage.getItem("adminToken") ||
            sessionStorage.getItem("adminAuthToken") ||
            localStorage.getItem("auth_token") ||
            localStorage.getItem("authToken")
          : null;

      if (!token) {
        setAddMsg("Please login to add to cart.");
        setAdding(false);
        return;
      }

      const base =
        process.env.NEXT_PUBLIC_API_BASE || "https://api.makwatches.in";
      const res = await fetch(`${base}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productID: product.id,
          quantity,
        }),
      });

      interface AddToCartResponse {
        success?: boolean;
        message?: string;
      }

      const json: AddToCartResponse = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setAddMsg("Session expired. Please login again.");
        setAdding(false);
        return;
      }
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Add to cart failed");
      }

      setAddMsg("Added to cart");
      // Optionally close modal after success:
      // onClose();
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message || "Failed to add to cart";
      setAddMsg(message);
    } finally {
      setAdding(false);
    }
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto border border-amber-200"
            onClick={handleModalClick}
          >
            <div className="flex justify-end p-2">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-amber-50 transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className={iconClass} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-6">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden border border-amber-200 shadow-md">
                  <Image
                    src={selectedImage}
                    alt={product.name || "Product"}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>

                {/* Thumbnail Gallery */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-2 overflow-auto pb-2">
                    {product.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(img)}
                        className={`relative w-16 h-16 border-2 rounded-md overflow-hidden flex-shrink-0 
                        ${
                          selectedImage === img
                            ? "border-amber-500"
                            : "border-amber-200"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Product view ${i + 1}`}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 font-serif">
                    {product.name}
                  </h2>
                  <p className="text-xl font-semibold text-amber-600 mt-2">
                    ₹{product.price}
                  </p>
                </div>

                <div className="prose prose-sm max-w-none text-gray-600">
                  <p>
                    {product.description ||
                      "Experience premium quality and comfort with this exclusive product. Perfect for all occasions."}
                  </p>
                </div>

                {/* Watch Specifications */}
                <div>
                  <label className="text-sm text-amber-700 font-medium block mb-2">
                    Specifications
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>Swiss Movement</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>100m Water Resistant</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>Sapphire Crystal</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>2-Year Warranty</span>
                    </div>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-amber-300 rounded-md">
                    <button
                      onClick={decrementQuantity}
                      className="p-2 text-amber-700 hover:bg-amber-50 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-center w-12">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      className="p-2 text-amber-700 hover:bg-amber-50 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <div>
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3 px-6 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md"
                    aria-label="Add to cart"
                    disabled={adding}
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                    <span>{adding ? "Adding..." : "Add to Cart"}</span>
                  </button>

                  {addMsg && (
                    <div
                      className={`mt-3 text-sm ${
                        addMsg.includes("select")
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {addMsg}
                    </div>
                  )}
                </div>

                {/* Additional product information */}
                <div className="border-t border-amber-200 pt-4 text-sm text-gray-600">
                  <p>✦ Free delivery on luxury watches</p>
                  <p>✦ 2-year international warranty</p>
                  <p>✦ Authentic certification included</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductDetailModal;
