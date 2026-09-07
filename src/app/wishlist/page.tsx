import type { Metadata } from "next";

import { Container, Eyebrow, Heading, Section } from "@/design-system";
import { WishlistPageContent } from "../(shop)/WishlistPageContent";

/**
 * The wishlist page.
 *
 * Guest wishlists live in the browser; a signed-in wishlist will sync to the
 * API. Either way the contents are per-visitor, so this page is static and its
 * body is a client component.
 */

export const metadata: Metadata = {
  title: "Saved pieces",
  description: "The MAK Watches pieces you have saved.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/wishlist" },
};

export default function WishlistPage() {
  return (
    <div className="mak bg-mak-bg">
      <Section spacing="default">
        <Container>
          {/*
            The heading is rendered here, on the server, so the page always has
            an <h1> -- the body below only hydrates once the persisted store is
            available in the browser.
          */}
          <Eyebrow withRule className="mb-4">
            Saved
          </Eyebrow>
          <Heading level="display" as="h1" className="mb-9">
            Saved pieces.
          </Heading>

          <WishlistPageContent />
        </Container>
      </Section>
    </div>
  );
}
