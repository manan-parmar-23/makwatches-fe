import { StoryBlock } from "@/components/marketing";
import { toMediaRef } from "@/lib/media";
import type { HeroSlide, HomeCollectionFeature } from "@/lib/api/home-content";

/**
 * The editorial storytelling band.
 *
 * Sourced from an admin-managed collection feature where one exists, and
 * otherwise from a secondary hero slide — both are real CMS records with real
 * copy and imagery.
 *
 * Nothing is substituted when the CMS is empty. The reference's House section
 * ("regulated in-house across five positions, sealed against water…") is
 * demo copy describing a manufacturing process, which is exactly the kind of
 * claim that cannot be invented. No content means no section.
 */

export interface HomeStoryProps {
  feature?: HomeCollectionFeature;
  /** Used when no collection feature exists. */
  fallbackSlide?: HeroSlide;
}

export function HomeStory({ feature, fallbackSlide }: HomeStoryProps) {
  if (feature) {
    const headline = feature.title?.trim();
    if (!headline) return null;

    return (
      <StoryBlock
        eyebrow={feature.tagline?.trim() || undefined}
        headline={headline}
        body={feature.description?.trim() || undefined}
        cta={
          feature.ctaLabel?.trim() && feature.ctaHref?.trim()
            ? { label: feature.ctaLabel.trim(), href: feature.ctaHref.trim() }
            : { label: "Shop the collection", href: "/shop" }
        }
        image={toMediaRef(feature.image, feature.imageAlt ?? "")}
        imageAlt={feature.imageAlt?.trim() ?? ""}
      />
    );
  }

  if (!fallbackSlide) return null;

  const headline = fallbackSlide.subtitle?.trim() || fallbackSlide.title?.trim();
  const image = toMediaRef(fallbackSlide.image, fallbackSlide.title ?? "");

  // Without both a headline and an image this reads as a broken band rather
  // than an editorial one.
  if (!headline || !image) return null;

  return (
    <StoryBlock
      eyebrow={fallbackSlide.title?.trim() || undefined}
      headline={headline}
      body={fallbackSlide.description?.trim() || undefined}
      cta={{ label: "Shop the collection", href: "/shop" }}
      image={image}
      imageAlt=""
    />
  );
}
