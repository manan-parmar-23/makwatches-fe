// src/components/women/WomenProductsPage.tsx
"use client";
import React from "react";
import { Product } from "@/utils/api";
import ProductGrid from "@/components/shared/ProductGrid";
import HeroBanner from "@/components/women/HeroBanner";

interface WomenProductsPageProps {
  onProductClick?: (product: Product) => void;
}

const WomenProductsPage: React.FC<WomenProductsPageProps> = ({
  onProductClick,
}) => {
  const handleProductClick = (product: Product) => {
    // Default behavior: navigate to product detail page
    if (onProductClick) {
      onProductClick(product);
    } else {
      // You can implement navigation logic here
      console.log("Navigate to product:", product.id);
    }
  };

  return (
    <main className="container px-4 md:px-6 py-4 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="max-w-lg md:max-w-4xl mb-8 md:mb-12">
        <HeroBanner />
      </div>

      {/* All Women's Products */}
      <section>
        <ProductGrid
          mainCategory="Women"
          title="Women's Collection"
          onProductClick={handleProductClick}
          className="mb-12"
        />
      </section>
    </main>
  );
};

export default WomenProductsPage;
