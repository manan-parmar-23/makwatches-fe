"use client";

import ProductCarousel from "@/components/product_carousel";

import Gallery from "@/components/gallery";
import HeroContent from "@/components/hero-content";
import TechShowcase from "@/components/tech-showcase";
import Collection from "@/components/collection";
import { LogoLoop } from "@/components/LogoLoop";

import Category from "@/components/category";

const demoLogos = [
  { src: "/logos/discord.png", alt: "Discord" },
  { src: "/logos/whatsapp.png", alt: "WhatsApp" },
  { src: "/logos/linkedin.png", alt: "LinkedIn" },
  { src: "/logos/instagram.png", alt: "instagram" },
  { src: "/logos/snapchat.png", alt: "Snapchat" },
];

export default function Home() {
  return (
    <>
      <section id="hero" className="relative">
        <HeroContent />
      </section>
      <section className="px-4 py-8">
        <Category />
      </section>

      <section id="tech-showcase">
        <TechShowcase />
      </section>
      <section id="collections" className="px-4 py-8">
        <Collection />
      </section>
      <section id="brands-logo" className="px-4 py-8">
        <LogoLoop
          logos={demoLogos}
          speed={120}
          logoHeight={36}
          gap={32}
          fadeOut
          pauseOnHover
        />
      </section>
      <section id="products" className="px-4 py-8">
        <ProductCarousel />
      </section>

      <section id="gallery" className="px-2">
        <Gallery />
      </section>
    </>
  );
}
