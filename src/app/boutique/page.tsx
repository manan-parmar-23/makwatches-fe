import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  Container,
  ErrorState,
  Eyebrow,
  Heading,
  Section,
  Text,
} from "@/design-system";
import { ProductGrid } from "@/components/commerce";
import {
  fetchRailProducts,
  fetchStorefront,
  isApiConfigured,
} from "@/lib/api/server";

import { BoutiqueStage } from "../(boutique)/BoutiqueStage";

/**
 * The boutique: an optional 3D showroom, over a page that works without it.
 *
 * Server-rendered, and the grid is the substance of it. The 3D room is a
 * client island that loads nothing until a capable visitor asks for it, so this
 * page costs a phone no more than any other listing page does.
 *
 * Which pieces appear is a selection rule from the storefront document -- the
 * same mechanism the homepage rails use -- so an admin can point the room at a
 * collection without a deploy, and it keeps up as stock changes.
 */

export const metadata: Metadata = {
  title: "The Boutique",
  description:
    "Step inside the MAK Watches boutique and look around the collection.",
  alternates: { canonical: "/boutique" },
};

/**
 * Rendered per request rather than prerendered.
 *
 * This page 404s when the boutique is switched off, and a `notFound()` on a
 * statically prerendered route is baked in at build time -- so switching the
 * boutique *on* in the admin would not bring the route back until the next
 * deploy, which is exactly the coupling this architecture exists to remove.
 * The cost is one render per request on a low-traffic, config-gated page; the
 * catalogue fetch underneath is still cached.
 */
export const dynamic = "force-dynamic";

export default async function BoutiquePage() {
  if (!isApiConfigured()) {
    return (
      <div className="mak bg-mak-bg">
        <Section spacing="loose">
          <Container>
            <ErrorState
              title="The storefront is not configured."
              description="NEXT_PUBLIC_API_BASE_URL is not set, so the catalog cannot be reached."
            />
          </Container>
        </Section>
      </div>
    );
  }

  const storefront = await fetchStorefront();
  const boutique = storefront.boutique;

  // Switched off in the admin means the route is gone, not that it renders an
  // empty shell. A disabled section must leave no trace on the site.
  if (!boutique.enabled) notFound();

  const page = await fetchRailProducts({
    id: "boutique",
    enabled: true,
    position: 1,
    eyebrow: "",
    title: "",
    source: boutique.source,
    value: boutique.value,
    limit: boutique.limit > 0 ? boutique.limit : 6,
    filterable: false,
    tone: "default",
    viewAll: { label: "", href: "" },
  });

  return (
    <div className="mak bg-mak-bg">
      <Section spacing="default">
        <Container>
          {boutique.eyebrow ? (
            <Eyebrow withRule className="mb-4">
              {boutique.eyebrow}
            </Eyebrow>
          ) : null}

          <Heading level="display" as="h1" className="mb-5">
            {boutique.title || "The boutique."}
          </Heading>

          {boutique.body ? (
            <Text tone="muted" className="mb-9 max-w-[52ch]">
              {boutique.body}
            </Text>
          ) : null}

          <BoutiqueStage products={page.items} />
        </Container>
      </Section>

      <Section spacing="tight">
        <Container>
          <h2 className="mb-6 font-display text-mak-label font-extrabold uppercase tracking-[0.14em] text-mak-ink">
            Every piece in the room
          </h2>

          {/*
            The page proper. Server-rendered, works with JavaScript off, and is
            where the showroom's contents are actually bought -- the 3D view
            never becomes a required step.
          */}
          <ProductGrid
            products={page.items}
            emptyTitle="Nothing is on show just now."
            emptyDescription="The boutique is pointed at a selection with no pieces in stock."
            priorityCount={4}
          />
        </Container>
      </Section>
    </div>
  );
}
