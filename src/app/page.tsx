"use client";

import ProductCarousel from "@/components/product_carousel";

import Gallery from "@/components/gallery";
import HeroContent from "@/components/hero-content";
import TechShowcase from "@/components/tech-showcase";
import Collection from "@/components/collection";
import { LogoLoop } from "@/components/LogoLoop";
import { useHomeContent } from "@/hooks/useHomeContent";

import Category from "@/components/category";

const demoLogos = [
  { src: "/1Balmain 1.png", alt: "Brand 1" },
  { src: "/1Balmain 2.png", alt: "Brand 2" },
  { src: "/1Balmain 3.png", alt: "Brand 3" },
  { src: "/1Balmain 4.png", alt: "Brand 4" },
  { src: "/1Balmain 5.png", alt: "Brand 5" },
];

export default function Home() {
  const { data } = useHomeContent();

  return (
    <>
      <section id="hero" className="relative">
        <HeroContent slides={data?.heroSlides} />
      </section>
      <section className="px-4 py-8">
        <Category items={data?.categories} />
      </section>

      <section id="tech-showcase">
        <TechShowcase
          cards={data?.techCards}
          highlight={data?.highlight || undefined}
        />
      </section>
      <section id="collections" className="px-4 py-8">
        <Collection features={data?.collections} />
      </section>
      <section id="brands-logo" className="px-4 pt-8">
        <LogoLoop
          logos={demoLogos}
          speed={120}
          logoHeight={48}
          gap={32}
          fadeOut
          pauseOnHover
        />
      </section>
      <section id="products" className="px-4 pt-8">
        <ProductCarousel />
      </section>

      <section id="gallery" className="px-2">
        <Gallery images={data?.gallery} />
      </section>
    </>
  );
}
