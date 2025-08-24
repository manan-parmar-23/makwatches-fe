"use client";

import { useEffect } from "react";
import CategoryHome from "@/components/category-home";
import Hero from "@/components/hero";
import ProductCarousel from "@/components/product_carousel";
import Banner from "@/components/banner";
import Gallery from "@/components/gallery";

export default function Home() {
  // Clear the session storage for intro video when homepage is loaded
  // This ensures the intro video will play on each refresh of the homepage
  useEffect(() => {
    sessionStorage.removeItem("pehnaw-intro-watched");
  }, []);

  return (
    <>
      <div className="py-12">
        <Hero />
      </div>
      <div className="px-4 py-8">
        <ProductCarousel />
      </div>
      <div className="px-4 py-8">
        <CategoryHome />
      </div>
      <div className="px-4 py-8">
        <Banner />
      </div>
      <div className="px-4 py-8">
        <Gallery />
      </div>
    </>
  );
}
