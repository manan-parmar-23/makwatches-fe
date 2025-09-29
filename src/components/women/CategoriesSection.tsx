"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Category } from "@/lib/women-api";
import { fetchPublicSubcategories } from "@/utils/api";
import { getImageForSubcategory } from "@/config/subcategoryImages";

interface CategoryTileProps {
  category: { id: string; name: string; imageUrl?: string };
  mainCategory: "Women" | "Men";
  index?: number;
}

function CategoryTile({
  category,
  mainCategory,
  index = 0,
}: CategoryTileProps) {
  const fallbackImage = `/categories/${category.name.toLowerCase()}.png`;
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
      <motion.div
        className="group relative aspect-square rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-rose-500 to-pink-600 h-[140px] md:h-[45vh] w-full md:w-[40vw]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        whileHover={{ scale: 1.05, y: -5 }}
      >
        {imageSrc ? (
          <>
            {/* Background Image */}
            {/^https?:\/\//i.test(imageSrc) ? (
              <Image
                src={imageSrc}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 33vw"
                unoptimized
              />
            ) : (
              <Image
                src={imageSrc}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-rose-900/80 via-pink-500/20 to-transparent" />

            {/* Category Label */}
            <div className="absolute bottom-4 left-4 right-4">
              <motion.div
                className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                }}
              >
                <span className="text-white font-semibold text-sm md:text-base uppercase tracking-wider">
                  {category.name}
                </span>
              </motion.div>
            </div>

            {/* Decorative Element */}
            <div className="absolute top-4 right-4">
              <div className="w-3 h-3 bg-gradient-to-r from-rose-400 to-pink-600 rounded-full shadow-lg" />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-rose-500 to-pink-600">
            <div className="text-4xl md:text-6xl font-bold text-white/80">
              {category.name.charAt(0)}
            </div>
          </div>
        )}
      </motion.div>
    </Link>
  );
}

function BrandTile() {
  return (
    <Link href="/">
      <motion.div
        className="group relative aspect-square rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700 flex items-center justify-center h-[140px] md:h-[45vh] w-full md:w-[40vw]"
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ duration: 0.3 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
        </div>

        <div className="relative z-10 text-center">
          <motion.div
            className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src="/mak-logo.png"
              alt="MAK Watches Logo"
              fill
              className="object-contain"
            />
          </motion.div>
          <div className="text-white font-bold text-lg md:text-xl tracking-wider">
            MAK
          </div>
          <div className="text-rose-200 text-sm md:text-base font-medium">
            WATCHES
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function TextTile() {
  return (
    <motion.div
      className="group flex items-center justify-center aspect-square rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-rose-400 to-pink-500 h-[140px] md:h-[45vh] w-full md:w-[40vw]"
      whileHover={{ scale: 1.05, y: -5, rotate: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        <motion.div
          className="text-white font-bold text-lg md:text-2xl uppercase tracking-wider mb-2"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          ELEGANCE
        </motion.div>
        <div className="text-white/80 text-sm md:text-base font-medium">
          REDEFINED
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-2 right-2 w-2 h-2 bg-white/20 rounded-full" />
      <div className="absolute bottom-2 left-2 w-1 h-1 bg-white/20 rounded-full" />
    </motion.div>
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
        <motion.div
          className={`transition-opacity duration-300 ${
            visibleFirst ? "opacity-100" : "opacity-0"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: visibleFirst ? 1 : 0, y: visibleFirst ? 0 : 20 }}
          transition={{ duration: 0.5 }}
        >
          <CategoryTile category={first} mainCategory="Women" index={0} />
        </motion.div>
      ) : (
        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-rose-300 to-pink-400 h-[140px] md:h-[45vh] w-full md:w-[40vw] animate-pulse" />
      )}
      <BrandTile />
      <TextTile />
      {second ? (
        <motion.div
          className={`transition-opacity duration-300 ${
            visibleSecond ? "opacity-100" : "opacity-0"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: visibleSecond ? 1 : 0,
            y: visibleSecond ? 0 : 20,
          }}
          transition={{ duration: 0.5 }}
        >
          <CategoryTile category={second} mainCategory="Women" index={1} />
        </motion.div>
      ) : (
        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-rose-300 to-pink-400 h-[140px] md:h-[45vh] w-full md:w-[40vw] animate-pulse" />
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
        <motion.div
          className={`transition-opacity duration-300 ${
            visibleFirst ? "opacity-100" : "opacity-0"
          }`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: visibleFirst ? 1 : 0,
            scale: visibleFirst ? 1 : 0.9,
          }}
          transition={{ duration: 0.4 }}
        >
          <CategoryTile category={first} mainCategory="Women" index={0} />
        </motion.div>
      ) : (
        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-rose-300 to-pink-400 h-[140px] w-full animate-pulse" />
      )}
      <BrandTile />
      <TextTile />
      {second ? (
        <motion.div
          className={`transition-opacity duration-300 ${
            visibleSecond ? "opacity-100" : "opacity-0"
          }`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: visibleSecond ? 1 : 0,
            scale: visibleSecond ? 1 : 0.9,
          }}
          transition={{ duration: 0.4 }}
        >
          <CategoryTile category={second} mainCategory="Women" index={1} />
        </motion.div>
      ) : (
        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-rose-300 to-pink-400 h-[140px] w-full animate-pulse" />
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
  // Aggregate subcategories for Women, with Unsplash fallback images
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
        // If backend didn't send subcategories populated, fetch per category name
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
                `/logo-1.png`,
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

  // cycle A slowly
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

  // cycle B slowly and staggered
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
    <motion.section
      className="my-6 md:my-16 md:mb-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2
        className="md:text-2xl font-bold font-inter text-lg text-rose-700 mb-3 md:mb-4 uppercase tracking-wider"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Categories
      </motion.h2>
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
    </motion.section>
  );
}
