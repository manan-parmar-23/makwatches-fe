"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import { Category } from "@/lib/women-api";
import { fetchPublicSubcategories } from "@/utils/api";
import { getImageForSubcategory } from "@/config/subcategoryImages";

interface CategoryTileProps {
  category: { id: string; name: string; imageUrl?: string };
  mainCategory: "Women" | "Men";
}

function CategoryTile({ category, mainCategory }: CategoryTileProps) {
  // Fallback to public folder image if not found in DB
  const fallbackImage = `/` + category.name.toLowerCase() + `.jpg`;
  const imageSrc =
    category.imageUrl && category.imageUrl !== ""
      ? category.imageUrl
      : fallbackImage;
  return (
    <Link
      href={`/${mainCategory.toLowerCase()}/category/${encodeURIComponent(
        category.id
      )}?name=${encodeURIComponent(category.name)}`}
    >
      <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm bg-gray-100 h-[140px] md:h-[45vh] w-full md:w-[40vw]">
        {imageSrc ? (
          <>
            {/* Use plain <img> for external URLs to avoid Next/Image remote config */}
            {/^https?:\/\//i.test(imageSrc) ? (
              <Image
                src={imageSrc}
                alt={category.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
                unoptimized
              />
            ) : (
              <Image
                src={imageSrc}
                alt={category.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            )}
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
      <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm bg-white flex items-center justify-center h-[140px] md:h-[45vh] w-full md:w-[40vw]">
        <div className="relative w-12 h-12 md:w-20 md:h-20">
          <Image
            src="/p.png"
            alt="Pehnaw Logo"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </Link>
  );
}

function TextTile() {
  return (
    <div className="flex items-center justify-center aspect-square rounded-xl overflow-hidden shadow-sm bg-white h-[140px] md:h-[45vh] w-full md:w-[40vw]">
      <span className="text-lg md:text-2xl font-bold text-[#5C1B1B]">
        PEHNAW MUST
      </span>
    </div>
  );
}

// Desktop grid function
function DesktopCategoriesGrid({
  first,
  second,
  visibleFirst,
  visibleSecond,
}: {
  first?: { id: string; name: string; imageUrl?: string } | null;
  second?: { id: string; name: string; imageUrl?: string } | null;
  visibleFirst?: boolean;
  visibleSecond?: boolean;
}) {
  return (
    <div
      className="hidden md:grid grid-cols-2 gap-x-6 gap-y-4"
      style={{ height: "760px" }}
    >
      {first ? (
        <div
          className={`transition-opacity duration-300 ${
            visibleFirst ? "opacity-100" : "opacity-0"
          }`}
        >
          <CategoryTile category={first} mainCategory="Men" />
        </div>
      ) : (
        <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm bg-gray-100 h-[140px] md:h-[45vh] w-full md:w-[40vw]" />
      )}
      <BrandTile />
      <TextTile />
      {second ? (
        <div
          className={`transition-opacity duration-300 ${
            visibleSecond ? "opacity-100" : "opacity-0"
          }`}
        >
          <CategoryTile category={second} mainCategory="Men" />
        </div>
      ) : (
        <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm bg-gray-100 h-[140px] md:h-[45vh] w-full md:w-[40vw]" />
      )}
    </div>
  );
}

// Mobile grid function
function MobileCategoriesGrid({
  first,
  second,
  visibleFirst,
  visibleSecond,
}: {
  first?: { id: string; name: string; imageUrl?: string } | null;
  second?: { id: string; name: string; imageUrl?: string } | null;
  visibleFirst?: boolean;
  visibleSecond?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:hidden">
      {first ? (
        <div
          className={`transition-opacity duration-300 ${
            visibleFirst ? "opacity-100" : "opacity-0"
          }`}
        >
          <CategoryTile category={first} mainCategory="Men" />
        </div>
      ) : (
        <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm bg-gray-100 h-[140px] w-full" />
      )}
      <BrandTile />
      <TextTile />
      {second ? (
        <div
          className={`transition-opacity duration-300 ${
            visibleSecond ? "opacity-100" : "opacity-0"
          }`}
        >
          <CategoryTile category={second} mainCategory="Men" />
        </div>
      ) : (
        <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm bg-gray-100 h-[140px] w-full" />
      )}
    </div>
  );
}

interface CategoriesSectionProps {
  categories: (Category & { imageUrl?: string })[];
}

export default function CategoriesSection({
  categories,
}: CategoriesSectionProps) {
  // Aggregate subcategories for Men, with Unsplash (search) fallback images
  const [subcats, setSubcats] = useState<
    { id: string; name: string; imageUrl?: string }[]
  >([]);
  const [indexA, setIndexA] = useState(0);
  const [indexB, setIndexB] = useState(0);
  const [visibleA, setVisibleA] = useState(true);
  const [visibleB, setVisibleB] = useState(true);
  const intervalARef = useRef<number | null>(null);
  const intervalBRef = useRef<number | null>(null);

  type SubItem = { id?: string; name: string; imageUrl?: string };
  const localSubs = useMemo(() => {
    const list: { id: string; name: string; imageUrl?: string }[] = [];
    categories?.forEach((c) => {
      if (Array.isArray(c?.subcategories) && c.subcategories.length > 0) {
        c.subcategories.forEach((s: SubItem) =>
          list.push({ id: s.id || s.name, name: s.name, imageUrl: s.imageUrl })
        );
      }
    });
    return list;
  }, [categories]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let all: { id: string; name: string }[] = [...localSubs];
        if (all.length === 0 && Array.isArray(categories)) {
          const fetchedSets = await Promise.all(
            categories.slice(0, 4).map(async (c) => {
              try {
                const { data } = await fetchPublicSubcategories(c.name, true);
                const arr: { id: string; name: string }[] = Array.isArray(
                  data.data
                )
                  ? data.data.map((s) => ({ id: s.id || s.name, name: s.name }))
                  : [];
                return arr;
              } catch {
                return [] as { id: string; name: string }[];
              }
            })
          );
          all = fetchedSets.flat();
        }
        const withImages = all.map(
          (s: { id: string; name: string; imageUrl?: string }) => {
            // prefer curated images, then a local deterministic image (not random), then site asset
            const slug = encodeURIComponent(
              s.name.toLowerCase().replace(/\s+/g, "-")
            );
            return {
              ...s,
              imageUrl:
                s.imageUrl ||
                getImageForSubcategory(s.name) ||
                `/subcategories/${slug}.jpg` ||
                `/p.png`,
            };
          }
        );
        if (!cancelled) setSubcats(withImages);
      } catch {
        if (!cancelled) setSubcats([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categories, localSubs]);

  // initialize indices when subcats load
  useEffect(() => {
    if (!subcats || subcats.length === 0) return;
    setIndexA(0);
    // start B roughly halfway through the list so tiles differ initially
    setIndexB(
      subcats.length > 2
        ? Math.floor(subcats.length / 2)
        : subcats.length > 1
        ? 1
        : 0
    );
    setVisibleA(true);
    setVisibleB(true);
  }, [subcats]);

  // cycle A slowly through all subcats
  useEffect(() => {
    if (!subcats || subcats.length <= 1) return;
    const len = subcats.length;
    let cancelled = false;
    const cycleA = async () => {
      setVisibleA(false);
      await new Promise((r) => setTimeout(r, 350));
      if (cancelled) return;
      setIndexA((prev) => {
        let next = (prev + 1) % len;
        // avoid collision with B
        if (next === indexB) next = (next + 1) % len;
        return next;
      });
      setVisibleA(true);
    };
    // faster rotation: 6s
    intervalARef.current = window.setInterval(cycleA, 6000);
    return () => {
      cancelled = true;
      if (intervalARef.current) {
        clearInterval(intervalARef.current);
        intervalARef.current = null;
      }
    };
  }, [subcats, indexB]);

  // cycle B slowly and stagger start so it doesn't mirror A
  useEffect(() => {
    if (!subcats || subcats.length <= 1) return;
    const len = subcats.length;
    let cancelled = false;
    const cycleB = async () => {
      setVisibleB(false);
      await new Promise((r) => setTimeout(r, 350));
      if (cancelled) return;
      setIndexB((prev) => {
        let next = (prev + 1) % len;
        if (next === indexA) next = (next + 1) % len;
        return next;
      });
      setVisibleB(true);
    };
    // stagger first run by half the new interval (3s) and use 6s interval
    const timeout = window.setTimeout(() => {
      if (!cancelled) cycleB();
      intervalBRef.current = window.setInterval(cycleB, 6000);
    }, 3000);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      if (intervalBRef.current) {
        clearInterval(intervalBRef.current);
        intervalBRef.current = null;
      }
    };
  }, [subcats, indexA]);

  return (
    <section className="my-6 md:my-16 md:mb-8">
      <h2 className=" md:text-2xl font-bold font-inter text-lg text-[#5b1d1d] mb-3 md:mb-4">
        Categories
      </h2>
      <MobileCategoriesGrid
        first={subcats[indexA] ?? null}
        second={subcats[indexB] ?? null}
        visibleFirst={visibleA}
        visibleSecond={visibleB}
      />
      <DesktopCategoriesGrid
        first={subcats[indexA] ?? null}
        second={subcats[indexB] ?? null}
        visibleFirst={visibleA}
        visibleSecond={visibleB}
      />
    </section>
  );
}
