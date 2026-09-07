// Feature-level API helpers.
//
// These build on the canonical shared client in src/lib/api. This module used
// to construct its own axios instance with its own base URL and a hardcoded
// `|| "https://api.makwatches.in"` fallback; both are gone. The exported
// helpers below are unchanged, so existing callers keep working.
import api from "@/lib/api";

// Product API
export const productApi = {
  // Get all products with optional filtering
  getProducts: async (params?: {
    category?: string;
    mainCategory?: string;
    subcategory?: string;
    brand?: string[] | string;
    gender?: string;
    dialColor?: string;
    dialShape?: string;
    dialType?: string;
    strapColor?: string;
    strapMaterial?: string;
    style?: string;
    dialThickness?: string;
    inStock?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    order?: "asc" | "desc";
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  // Get a single product by ID
  getProductById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
};

// Cart API
export const cartApi = {
  // Get current user's cart
  getCart: async (userId: string) => {
    const response = await api.get(`/cart/${userId}`);
    return response.data;
  },

  // Add a product to the cart
  addToCart: async (productId: string, quantity: number = 1) => {
    const response = await api.post("/cart", { productId, quantity });
    return response.data;
  },

  // Remove an item from the cart
  removeFromCart: async (userId: string, productId: string) => {
    const response = await api.delete(`/cart/${userId}/${productId}`);
    return response.data;
  },
};

// Wishlist API
export const wishlistApi = {
  // Get current user's wishlist
  getWishlist: async () => {
    const response = await api.get("/account/wishlist");
    return response.data;
  },

  // Add a product to the wishlist
  addToWishlist: async (productId: string) => {
    const response = await api.post("/wishlist", { productId });
    return response.data;
  },

  // Remove a product from the wishlist
  removeFromWishlist: async (itemId: string) => {
    const response = await api.delete(`/account/wishlist/${itemId}`);
    return response.data;
  },
};

// Category API
export const categoryApi = {
  // Get all categories
  getCategories: async () => {
    const response = await api.get("/categories");
    return response.data;
  },
};

export default api;

// Payment API (Razorpay)
export const paymentApi = {
  // Create a Razorpay order from current cart on server
  createRazorpayOrder: async () => {
    const res = await api.post("/payments/razorpay/order", {});
    return res.data as {
      success: boolean;
      key: string;
      amount: number; // paise
      currency: string;
      data: unknown; // contains order details from Razorpay
    };
  },
};

// Checkout API
export const checkoutApi = {
  placeOrder: async (payload: {
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      landmark?: string;
    };
    paymentInfo: {
      method: "razorpay" | "cod";
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
    };
    clientTotal?: number;
  }) => {
    const res = await api.post("/checkout", payload);
    return res.data;
  },
};
