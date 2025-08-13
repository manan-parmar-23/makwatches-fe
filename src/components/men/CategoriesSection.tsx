"use client";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/lib/women-api";

interface CategoryTileProps {
  category: Category & { imageUrl?: string };
}

function CategoryTile({ category }: CategoryTileProps) {
  // Fallback to public folder image if not found in DB
  const fallbackImage = `/` + category.name.toLowerCase() + `.jpg`;
  const imageSrc =
    category.imageUrl && category.imageUrl !== ""
      ? category.imageUrl
      : fallbackImage;
  return (
    <Link href={`/men/category/${category.name.toLowerCase()}`}>
      <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm bg-gray-100 h-[140px] md:h-[35vh] w-full md:w-[35vw]">
        {imageSrc ? (
          <>
            <Image
              src="/tops.png"
              alt={category.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            <div className="absolute top-2 left-2 bg-white/70 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-gray-900">
              {category.name}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-2xl font-bold text-gray-800">
              {category.name.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

function BrandTile() {
  return (
    <Link href="/">
      <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm bg-white flex items-center justify-center h-[140px] md:h-[35vh] w-full md:w-[35vw]">
        <Image
          src="/p.png"
          alt="Pehnaw Logo"
          width={60}
          height={60}
          className="object-contain"
        />
      </div>
    </Link>
  );
}

function TextTile() {
  return (
    <div className="flex items-center justify-center aspect-square rounded-xl overflow-hidden shadow-sm bg-white h-[140px] md:h-[35vh] w-full md:w-[35vw]">
      <span className="text-lg md:text-xl font-bold text-[#5C1B1B]">
        PEHNAW MUST
      </span>
    </div>
  );
}

// Desktop grid function
function DesktopCategoriesGrid({
  firstCategory,
  secondCategory,
}: {
  firstCategory: Category;
  secondCategory: Category;
}) {
  return (
    <div
      className="hidden md:grid grid-cols-2 gap-x-170 gap-y-3"
      style={{ height: "660px", maxWidth: "300px" }}
    >
      <CategoryTile category={firstCategory} />
      <BrandTile />
      <TextTile />
      <CategoryTile category={secondCategory} />
    </div>
  );
}

// Mobile grid function
function MobileCategoriesGrid({
  firstCategory,
  secondCategory,
}: {
  firstCategory: Category;
  secondCategory: Category;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:hidden">
      <CategoryTile category={firstCategory} />
      <BrandTile />
      <TextTile />
      <CategoryTile category={secondCategory} />
    </div>
  );
}

interface CategoriesSectionProps {
  categories: (Category & { imageUrl?: string })[];
}

export default function CategoriesSection({
  categories,
}: CategoriesSectionProps) {
  // Use first two categories for display, fallback if not enough
  const firstCategory = {
    ...categories[0],
    imageUrl: categories[0]?.imageUrl || "/tops.jpg",
    id: categories[0]?.id || "fallback1",
    name: categories[0]?.name || "Tops",
  };
  const secondCategory = {
    ...categories[1],
    imageUrl: categories[1]?.imageUrl || "/bottoms.jpg",
    id: categories[1]?.id || "fallback2",
    name: categories[1]?.name || "Bottoms",
  };

  return (
    <section className="my-6 md:my-16 md:mb-8">
      <h2 className=" md:text-2xl font-bold font-inter text-lg text-[#5b1d1d] mb-3 md:mb-4">
        Categories
      </h2>
      <MobileCategoriesGrid
        firstCategory={firstCategory}
        secondCategory={secondCategory}
      />
      <DesktopCategoriesGrid
        firstCategory={firstCategory}
        secondCategory={secondCategory}
      />
    </section>
  );
}
