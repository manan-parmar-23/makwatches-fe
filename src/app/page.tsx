import CategoryHome from "@/components/category-home";

import Hero from "@/components/hero";

import ProductCarousel from "@/components/product_carousel";
import Banner from "@/components/banner";
import Gallery from "@/components/gallery";

export default function Home() {
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
