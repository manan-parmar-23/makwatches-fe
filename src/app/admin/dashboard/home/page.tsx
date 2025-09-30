"use client";

import HeroSlidesManager from "@/components/admin/home/HeroSlidesManager";
import CategoryCardsManager from "@/components/admin/home/CategoryCardsManager";
import CollectionFeaturesManager from "@/components/admin/home/CollectionFeaturesManager";
import TechShowcaseManager from "@/components/admin/home/TechShowcaseManager";
import { ADMIN_COLORS } from "@/components/admin/home/constants";

export default function HomeContentPage() {
  return (
    <div className="space-y-8 pt-18 pb-16">
      <header className="space-y-2">
        <div className="flex items-center mb-2 group">
          <div
            className="h-8 w-1 rounded-full mr-3 transform transition-transform duration-300 group-hover:scale-y-110"
            style={{ backgroundColor: ADMIN_COLORS.primary }}
          />
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 transition-all duration-300 group-hover:tracking-wide"
              style={{ color: ADMIN_COLORS.primary }}
            >
              Home Content Management
            </h1>
            <p className="text-sm" style={{ color: ADMIN_COLORS.textMuted }}>
              Control the data displayed across homepage sections without
              changing the public design.
            </p>
          </div>
        </div>
        <div
          className="w-24 h-1 rounded-full transition-all duration-500 hover:w-32"
          style={{
            background: `linear-gradient(90deg, ${ADMIN_COLORS.primary}, ${ADMIN_COLORS.secondary})`,
          }}
        />
      </header>

      <HeroSlidesManager />
      <CategoryCardsManager />
      <CollectionFeaturesManager />
      <TechShowcaseManager />
    </div>
  );
}
