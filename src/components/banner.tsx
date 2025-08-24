"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const COLORS = {
  primary: "#531A1A",
  overlay: "rgba(0,0,0,0.35)",
  buttonBg: "#fff",
  buttonText: "#531A1A",
  buttonBorder: "#531A1A",
};

const BREAKPOINT = 640;

function DesktopBanner() {
  return (
    <div className="w-full flex flex-col items-center py-8 px-2">
      {/* Heading */}
      <h2
        className="text-center font-bold mb-6"
        style={{
          color: COLORS.primary,
          fontSize: "2.4rem",
          lineHeight: "1.2",
        }}
      >
        Our limit edition kit bundles all your rhode summer
        <br />
        essentials in a baby rhode bubble.
      </h2>

      {/* Banner image with overlay and text */}
      <div className="relative w-full max-w-6xl rounded-2xl overflow-hidden shadow-lg">
        <Image
          src="/banner.png"
          alt="lemontini summer"
          width={1600}
          height={600}
          className="w-full h-auto object-cover"
          priority
        />
        {/* Overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-4"
          style={{
            background: COLORS.overlay,
          }}
        >
          <div
            className="text-white font-semibold mb-2 text-center"
            style={{ fontSize: "2.2rem" }}
          >
            lemontini summer
          </div>
          <div
            className="text-white mb-6 text-center max-w-md"
            style={{ fontSize: "1.35rem" }}
          >
            Our limited edition kit bundles all your rhode summer
            <br />
            essentials in a baby rhode bubble
          </div>
          <Link
            href="/shop"
            aria-label="Shop now"
            className="px-6 py-2 rounded-full border font-medium transition-all duration-200 hover:bg-[#531A1A] hover:text-white"
            style={{
              background: COLORS.buttonBg,
              color: COLORS.buttonText,
              border: `2px solid ${COLORS.buttonBorder}`,
              fontSize: "1.15rem",
            }}
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}

function MobileBanner() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Compact heading for mobile */}
      <h2
        className="text-center font-bold mb-4"
        style={{
          color: COLORS.primary,
          fontSize: "1.15rem",
          lineHeight: "1.25",
        }}
      >
        Limited edition kit — all your rhode summer essentials.
      </h2>

      <div className="relative w-full max-w-md rounded-xl overflow-hidden shadow-md">
        <Image
          src="/banner.png"
          alt="lemontini summer mobile"
          width={800}
          height={450}
          className="w-full h-auto object-cover"
          priority
        />

        {/* Bottom overlay for mobile (less intrusive) */}
        <div
          className="absolute left-0 right-0 bottom-0 px-4 pb-4 pt-3 flex flex-col items-center"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 100%)",
          }}
        >
          <div
            className="text-white font-semibold mb-1 text-center"
            style={{ fontSize: "1rem" }}
          >
            lemontini summer
          </div>
          <div
            className="text-white mb-3 text-center"
            style={{ fontSize: "0.9rem" }}
          >
            Essentials in a baby rhode bubble
          </div>
          <Link
            href="/shop"
            aria-label="Shop now"
            className="w-full max-w-xs px-4 py-2 rounded-full border font-medium transition-colors duration-200 flex justify-center items-center"
            style={{
              background: COLORS.buttonBg,
              color: COLORS.buttonText,
              border: `2px solid ${COLORS.buttonBorder}`,
              fontSize: "1rem",
              textDecoration: "none",
            }}
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Banner() {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const update = () =>
      setIsMobile(
        typeof window !== "undefined" && window.innerWidth <= BREAKPOINT
      );
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return isMobile ? <MobileBanner /> : <DesktopBanner />;
}
