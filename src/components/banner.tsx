"use client";
import Image from "next/image";

const COLORS = {
  primary: "#531A1A",
  overlay: "rgba(0,0,0,0.35)",
  buttonBg: "#fff",
  buttonText: "#531A1A",
  buttonBorder: "#531A1A",
};

export default function Banner() {
  return (
    <div className="w-full flex flex-col items-center py-8 px-2">
      {/* Heading */}
      <h2
        className="text-center font-bold mb-6"
        style={{
          color: COLORS.primary,
          fontSize: "2.4rem", // Increased size
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
          width={800}
          height={400}
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
          <button
            className="px-6 py-2 rounded-full border font-medium transition-all duration-200 hover:bg-[#531A1A] hover:text-white"
            style={{
              background: COLORS.buttonBg,
              color: COLORS.buttonText,
              border: `2px solid ${COLORS.buttonBorder}`,
              fontSize: "1.15rem",
            }}
          >
            Shop Now
          </button>
        </div>
      </div>
      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 600px) {
          h2 {
            font-size: 1.1rem;
          }
          .text-2xl {
            font-size: 1.2rem;
          }
          .text-base {
            font-size: 0.95rem;
          }
          .max-w-2xl {
            max-width: 98vw;
          }
        }
      `}</style>
    </div>
  );
}
