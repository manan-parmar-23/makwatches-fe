import type { Metadata } from "next";

import { Container, Eyebrow, Heading, Section } from "@/design-system";
import { AccountShell } from "../../(account)/AccountShell";
import { OrderDetail } from "../../(account)/OrderDetail";

/**
 * One order.
 *
 * The page an order confirmation, a delivery email or a customer chasing a
 * parcel can be pointed at. It exists because the previous account was a set of
 * tabs in a single page, which meant an individual order had no address of its
 * own.
 *
 * The order itself is fetched in the browser: it is private to one signed-in
 * customer, so there is nothing to render on the server and nothing to cache.
 */

export const metadata: Metadata = {
  title: "Your order",
  description: "Track your MAK Watches order.",
  robots: { index: false, follow: false },
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mak bg-mak-bg">
      <Section spacing="default">
        <Container>
          <Eyebrow withRule className="mb-4">
            Order
          </Eyebrow>
          <Heading level="display" as="h1" className="mb-9">
            Your order.
          </Heading>

          <AccountShell>
            <OrderDetail orderId={id} />
          </AccountShell>
        </Container>
      </Section>
    </div>
  );
}
