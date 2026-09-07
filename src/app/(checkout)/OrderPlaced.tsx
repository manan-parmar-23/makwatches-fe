"use client";

import {
  ButtonLink,
  Divider,
  Text,
  formatPrice,
} from "@/design-system";
import { formatAddress } from "@/lib/api/addresses";
import type { PlacedOrder } from "@/lib/api/checkout";

/**
 * The order confirmation.
 *
 * Rendered in place rather than behind a redirect: the order number is the one
 * thing the customer needs to keep, and a navigation is a chance to lose it.
 *
 * Says only what the server actually returned. No delivery date is shown --
 * the carrier gives one when the shipment is created, not at checkout, and
 * inventing "3-5 business days" here would be a promise nothing in this system
 * is making.
 */

export function OrderPlaced({ order }: { order: PlacedOrder }) {
  const paid = order.paymentStatus === "paid";

  return (
    <div className="mx-auto max-w-[640px]">
      <div className="border-2 border-mak-line p-7 sm:p-9">
        <p className="font-display text-mak-label font-extrabold uppercase tracking-[0.14em] text-mak-accent">
          Order confirmed
        </p>

        <h2 className="mt-4 font-display text-mak-display font-extrabold tracking-[-0.02em] text-mak-ink">
          Thank you.
        </h2>

        <Text tone="muted" className="mt-4">
          {paid
            ? "Your payment went through and the order is with our team."
            : "Your order is with our team. You will pay the courier on delivery."}
        </Text>

        <Divider className="my-7" />

        <dl className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="font-display text-mak-label font-extrabold uppercase tracking-[0.14em] text-mak-ink">
              Order number
            </dt>
            <dd className="font-display text-mak-body font-extrabold text-mak-ink">
              {order.orderNumber}
            </dd>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="font-display text-mak-label font-extrabold uppercase tracking-[0.14em] text-mak-ink">
              Total
            </dt>
            <dd className="font-display text-mak-body font-extrabold text-mak-ink">
              {formatPrice(order.total)}
            </dd>
          </div>

          {order.shippingAddress ? (
            <div className="flex flex-col gap-1">
              <dt className="font-display text-mak-label font-extrabold uppercase tracking-[0.14em] text-mak-ink">
                Delivering to
              </dt>
              <dd className="text-mak-small text-mak-muted">
                {order.shippingAddress.name} —{" "}
                {formatAddress(order.shippingAddress)}
              </dd>
            </div>
          ) : null}
        </dl>

        <Divider weight="hairline" className="my-7" />

        <ul className="flex flex-col gap-3">
          {order.items.map((item) => (
            <li
              key={`${item.productId}-${item.size ?? ""}`}
              className="flex items-baseline justify-between gap-4"
            >
              <span className="min-w-0 text-mak-small text-mak-ink">
                <span className="font-semibold">{item.productName}</span>
                {item.size ? (
                  <span className="text-mak-muted"> · {item.size}</span>
                ) : null}
                <span className="text-mak-muted"> × {item.quantity}</span>
              </span>
              <span className="shrink-0 text-mak-small text-mak-ink">
                {formatPrice(item.subtotal)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-9 flex flex-wrap gap-4">
          <ButtonLink href="/orders">View your orders</ButtonLink>
          <ButtonLink href="/shop" variant="secondary">
            Continue shopping
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
