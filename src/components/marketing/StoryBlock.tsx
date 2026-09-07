"use client";

import { cn } from "@/lib/utils";
import {
  ArrowRightIcon,
  ButtonLink,
  Container,
  Eyebrow,
  Heading,
  Parallax,
  Reveal,
  Text,
} from "@/design-system";
import { IMAGE_SIZES, type MediaRef } from "@/lib/media";
import { ProductImage } from "@/components/commerce/ProductImage";

/**
 * A full-bleed editorial band: a photograph behind a gradient, with copy
 * flush left over it.
 *
 * This is the reference's "House" treatment. The background moves at a slower
 * rate than the page via Parallax, which disables itself entirely under
 * prefers-reduced-motion.
 *
 * All copy is passed in. Brand narrative -- provenance, process, standards --
 * is exactly the kind of claim that must come from real MAK material rather
 * than a component default.
 */

export interface StoryBlockProps {
  eyebrow?: string;
  headline: React.ReactNode;
  body?: React.ReactNode;
  cta?: { label: string; href: string };
  image?: MediaRef | null;
  /** Describe the photograph, or leave empty if purely decorative. */
  imageAlt?: string;
  /** Disable the parallax for a static band. */
  parallax?: boolean;
  className?: string;
}

export function StoryBlock({
  eyebrow,
  headline,
  body,
  cta,
  image,
  imageAlt = "",
  parallax = true,
  className,
}: StoryBlockProps) {
  const background = (
    <ProductImage
      media={image ?? null}
      alt={imageAlt}
      sizes={IMAGE_SIZES.full}
      ratio="auto"
      className="size-full"
      imageClassName="object-cover"
    />
  );

  return (
    <section
      className={cn(
        "relative overflow-hidden border-y-2 border-mak-line",
        className
      )}
    >
      <div aria-hidden={imageAlt === "" ? "true" : undefined} className="absolute inset-0 z-0">
        {/* Inset vertically so the parallax translation never exposes an edge. */}
        <div className="absolute -inset-y-[14%] inset-x-0">
          {parallax ? <Parallax factor={0.14} className="size-full">{background}</Parallax> : background}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-linear-to-r from-[rgba(20,18,17,0.86)] via-[rgba(20,18,17,0.5)] to-[rgba(20,18,17,0.2)]"
      />

      <Container className="relative z-20">
        <Reveal className="max-w-[560px] py-24 md:py-32">
          {eyebrow ? (
            <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
          ) : null}

          <Heading level="display" className="text-white">
            {headline}
          </Heading>

          {body ? (
            <Text size="lead" className="mt-5 max-w-[480px] text-white/80">
              {body}
            </Text>
          ) : null}

          {cta ? (
            <ButtonLink
              href={cta.href}
              variant="primary"
              size="lg"
              className="mt-7"
              iconRight={<ArrowRightIcon size={16} />}
            >
              {cta.label}
            </ButtonLink>
          ) : null}
        </Reveal>
      </Container>
    </section>
  );
}
