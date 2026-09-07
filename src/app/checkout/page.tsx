import type { Metadata } from "next";

import { Container, Eyebrow, Heading, Section } from "@/design-system";

import { CheckoutFlow } from "../(checkout)/CheckoutFlow";

/**
 * Checkout.
 *
 * The shell is a server component so the page always has its heading, even
 * before the interactive flow hydrates; everything below depends on the
 * customer's bag and session, which only exist in the browser.
 *
 * Never indexed: this page is meaningless without a bag behind it.
 */

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your MAK Watches order.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/checkout" },
};

export default function CheckoutPage() {
  return (
    <div className="mak bg-mak-bg">
      <Section spacing="default">
        <Container>
          <Eyebrow withRule className="mb-4">
            Checkout
          </Eyebrow>
          <Heading level="display" as="h1" className="mb-9">
            Complete your order.
          </Heading>

          <CheckoutFlow />
        </Container>
      </Section>
    </div>
  );
}
