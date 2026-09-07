import type { Metadata } from "next";

import { Container, Eyebrow, Heading, Section } from "@/design-system";
import { CartPageContent } from "../(shop)/CartPageContent";

/**
 * The cart page.
 *
 * A deep-linkable, shareable view of the same cart the drawer shows — both read
 * the one Zustand store, so they can never disagree.
 *
 * Cart contents are per-visitor and live in the browser, so the page itself is
 * static and its interactive body is a client component. There is nothing to
 * render on the server.
 */

export const metadata: Metadata = {
  title: "Your bag",
  description: "Review the pieces in your MAK Watches bag.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/cart" },
};

export default function CartPage() {
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
            Your bag
          </Eyebrow>
          <Heading level="display" as="h1" className="mb-9">
            Your bag.
          </Heading>

          <CartPageContent />
        </Container>
      </Section>
    </div>
  );
}
