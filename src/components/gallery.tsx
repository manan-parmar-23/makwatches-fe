"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

type GalleryImage = string;

const IMAGES: GalleryImage[] = [
  "/item-card-image-1.png",
  "/item-card-image-2.png",
  "/item-card-image-3.png",
  "/item-card-image-4.png",
  "/item-card-image-5.png",
];

const COLORS = {
  primary: "#1a1a1a",
  primaryLight: "#333333",
  accent: "#d4af37",
  surface: "#FFFFFF",
  text: "grey-700",
  textSecondary: "#666666",
  textMuted: "#999999",
  border: "#e5e5e5",
  shadow: "rgba(0, 0, 0, 0.1)",
  shadowHover: "rgba(0, 0, 0, 0.2)",
};

interface CardProps {
  src: string;
  idx: number;
  expandedIdx: number | null;
  setExpandedIdx: (i: number | null) => void;
  totalImages: number;
}

const GalleryCard: React.FC<CardProps> = ({
  src,
  idx,
  expandedIdx,
  setExpandedIdx,
}) => {
  const isExpanded = expandedIdx === idx;
  const isAnyExpanded = expandedIdx !== null;

  // Calculate style classes based on expansion state
  const widthClass = isExpanded
    ? "flex-[3]"
    : isAnyExpanded
    ? "flex-[1]"
    : `flex-1`;

  return (
    <div
      className={`group relative cursor-pointer transition-all duration-700 ease-out overflow-hidden rounded-2xl ${widthClass} h-[65vh] max-w-[100vw] mx-1 sm:mx-2`}
      style={{
        boxShadow: isExpanded
          ? `0 20px 40px ${COLORS.shadowHover}, 0 0 0 1px ${COLORS.accent}25`
          : `0 8px 32px ${COLORS.shadow}`,
        transform: isExpanded ? "scale(1.02)" : "scale(1)",
      }}
      onClick={() => setExpandedIdx(isExpanded ? null : idx)}
    >
      {/* Image container */}
      <div className="absolute inset-0">
        <Image
          src={src}
          alt={`Gallery image ${idx + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-all duration-700 ease-out group-hover:scale-110"
          priority={idx < 2}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Hover content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <div className="text-white">
            <h3
              className="text-lg font-semibold mb-1"
              style={{ color: COLORS.accent }}
            >
              Gallery Image {idx + 1}
            </h3>
            <p className="text-sm opacity-90">
              Click to {isExpanded ? "collapse" : "expand"} view
            </p>
          </div>
        </div>

        {/* Expansion indicator */}
        <div
          className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isExpanded
              ? "opacity-100 scale-100"
              : "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
          }`}
          style={{
            background: `${COLORS.accent}20`,
            backdropFilter: "blur(10px)",
            border: `1px solid ${COLORS.accent}50`,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.accent}
            strokeWidth="2"
            className={`transition-transform duration-300 ${
              isExpanded ? "rotate-45" : ""
            }`}
          >
            {isExpanded ? (
              <path d="M18 6L6 18M6 6L18 18" />
            ) : (
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};

const GalleryCardMobile: React.FC<CardProps> = ({
  src,
  idx,
  expandedIdx,
  setExpandedIdx,
}) => {
  const isExpanded = expandedIdx === idx;
  const isAnyExpanded = expandedIdx !== null;

  const widthClass = isExpanded
    ? "flex-[3]"
    : isAnyExpanded
    ? "flex-[1]"
    : "flex-1";

  return (
    <div
      className={`group relative cursor-pointer transition-all duration-600 ease-out overflow-hidden rounded-xl ${widthClass} h-48 mx-0.5 sm:mx-1`}
      style={{
        boxShadow: isExpanded
          ? `0 12px 24px ${COLORS.shadowHover}, 0 0 0 1px ${COLORS.accent}30`
          : `0 4px 16px ${COLORS.shadow}`,
        transform: isExpanded ? "scale(1.05)" : "scale(1)",
      }}
      onClick={() => setExpandedIdx(isExpanded ? null : idx)}
    >
      {/* Image container */}
      <div className="absolute inset-0">
        <Image
          src={src}
          alt={`Gallery image ${idx + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-all duration-600 ease-out active:scale-110"
          priority={idx < 2}
        />

        {/* Mobile gradient overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-400 ${
            isExpanded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Mobile expansion indicator */}
        <div
          className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
            isExpanded ? "opacity-100 scale-100" : "opacity-60 scale-75"
          }`}
          style={{
            background: `${COLORS.accent}25`,
            backdropFilter: "blur(8px)",
            border: `1px solid ${COLORS.accent}40`,
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.accent}
            strokeWidth="2.5"
            className={`transition-transform duration-300 ${
              isExpanded ? "rotate-45" : ""
            }`}
          >
            {isExpanded ? (
              <path d="M18 6L6 18M6 6L18 18" />
            ) : (
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            )}
          </svg>
        </div>

        {/* Mobile tap indicator */}
        {isExpanded && (
          <div className="absolute bottom-2 left-2 text-white text-xs font-medium opacity-90">
            Tap to close
          </div>
        )}
      </div>
    </div>
  );
};

const Gallery: React.FC = () => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = (): void => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section
      className="py-8 sm:py-16 px-1 sm:px-2"
      style={{
        background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 0%)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-5">
            <div
              className="w-1 h-6 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent})`,
              }}
            />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-700">
              Gallery
            </h2>
            <div
              className="w-1 h-6 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent})`,
              }}
            />
          </div>
          <p
            className="text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed"
            style={{ color: COLORS.textSecondary }}
          >
            Discover the artistry and precision of our timepiece collection
            through our curated gallery
          </p>
        </div>
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-8">
          <div className="flex justify-center items-center gap-2 sm:gap-4">
            {IMAGES.map((src, idx) =>
              isMobile ? (
                <GalleryCardMobile
                  key={idx}
                  src={src}
                  idx={idx}
                  expandedIdx={expandedIdx}
                  setExpandedIdx={setExpandedIdx}
                  totalImages={IMAGES.length}
                />
              ) : (
                <GalleryCard
                  key={idx}
                  src={src}
                  idx={idx}
                  expandedIdx={expandedIdx}
                  setExpandedIdx={setExpandedIdx}
                  totalImages={IMAGES.length}
                />
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
