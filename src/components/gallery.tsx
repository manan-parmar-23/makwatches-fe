"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

type GalleryImage = string;

const IMAGES: GalleryImage[] = [
  "/gallery1.png",
  "/gallery2.png",
  "/gallery3.png",
  "/gallery4.png",
  "/gallery5.png",
];

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
      className={`relative cursor-pointer transition-all duration-500 ease-in-out overflow-hidden rounded-2xl shadow-md hover:shadow-lg ${widthClass} h-[70vh] max-w-[100vw] mx-1`}
      onClick={() => setExpandedIdx(isExpanded ? null : idx)}
    >
      <div className="absolute inset-0">
        <Image
          src={src}
          alt={`Gallery image ${idx + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-all duration-500 ease-in-out"
          priority={idx < 2}
        />
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
  // Same flex logic as desktop
  const widthClass = isExpanded
    ? "flex-[3]"
    : isAnyExpanded
    ? "flex-[1]"
    : "flex-1";
  return (
    <div
      className={`relative cursor-pointer transition-all duration-500 ease-in-out overflow-hidden rounded-2xl shadow-md ${widthClass} h-52 mx-1`}
      onClick={() => setExpandedIdx(isExpanded ? null : idx)}
    >
      <div className="absolute inset-0">
        <Image
          src={src}
          alt={`Gallery image ${idx + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-all duration-500 ease-in-out"
          priority={idx < 2}
        />
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
    <div className="w-full max-w-7xl mx-auto md:px-8">
      <h2 className="mb-6 font-semibold text-2xl text-[#531A1A]">
        you &amp; us
      </h2>

      <div className="flex justify-center items-center">
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
  );
};

export default Gallery;
