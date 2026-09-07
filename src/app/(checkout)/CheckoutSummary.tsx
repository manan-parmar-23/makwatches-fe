"use client";

import { Divider, Text, formatPrice } from "@/design-system";
import { ProductImage } from "@/components/commerce";
import type { CartLine } from "@/store/cart";

/**
 * The order summary rail.
 *
 * Shows the server's total once the cart has been synced, and the bag's own
 * arithmetic before that. The two agree in the ordinary case; when they do not,
 * the server is right, and the difference is what the adjustment notice
 * upstream is there to explain.
 *
 * Deliberately silent about shipping and tax. Neither is configured in this
 * system yet, and printing "Free" or "₹0" would be a claim we have not earned.
 */

export interface CheckoutSummaryProps {
  lines: CartLine[];
  /** The server-priced total. Falls back to the bag's own sum when unsynced. */
  serverTotal: number | null;
  className?: string;
}

export function CheckoutSummary({
  lines,
  serverTotal,
  className,
}: CheckoutSummaryProps) {
  const localTotal = lines.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0
  );
  const total = serverTotal ?? localTotal;
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <aside
      className={className}
      aria-label="Order summary"
    >
      <div className="border-2 border-mak-line bg-mak-surface p-6">
        <h2 className="mb-5 font-display text-mak-label font-extrabold uppercase tracking-[0.14em] text-mak-ink">
          Your order
        </h2>

        <ul className="flex flex-col gap-4">
          {lines.map((line) => (
            <li
              key={line.size ? `${line.productId}::${line.size}` : line.productId}
              className="flex gap-3.5"
            >
              <div className="relative size-16 shrink-0 border-2 border-mak-divider bg-mak-bg">
                <ProductImage
                  media={line.image}
                  alt={line.name}
                  ratio="square"
                  sizes="64px"
                />
                <span
                  aria-hidden="true"
                  className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center bg-mak-ink px-1 font-display text-[10px] font-extrabold leading-none text-mak-bg"
                >
                  {line.quantity}
                </span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate font-display text-mak-small font-extrabold tracking-[0.02em] text-mak-ink">
                  {line.name}
                </span>
                {line.size ? (
                  <span className="text-mak-label text-mak-muted">
                    {line.size}
                  </span>
                ) : null}
                <span className="text-mak-small text-mak-muted">
                  {formatPrice(line.price)} each
                </span>
              </div>

              <span className="shrink-0 font-display text-mak-small font-extrabold text-mak-ink">
                {formatPrice(line.price * line.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <Divider weight="hairline" className="my-5" />

        <dl className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <dt className="text-mak-small text-mak-muted">
              Subtotal ({count} {count === 1 ? "piece" : "pieces"})
            </dt>
            <dd className="text-mak-small text-mak-ink">
              {formatPrice(total)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="text-mak-small text-mak-muted">Delivery</dt>
            {/*
              Not "Free". No shipping rate is configured, so the honest answer
              is that it is confirmed with the order, not a number invented here.
            */}
            <dd className="text-mak-small text-mak-muted">
              Confirmed on dispatch
            </dd>
          </div>
        </dl>

        <Divider className="my-5" />

        <div className="flex items-baseline justify-between">
          <span className="font-display text-mak-label font-extrabold uppercase tracking-[0.14em] text-mak-ink">
            Total
          </span>
          <span className="font-display text-2xl font-extrabold tracking-[-0.02em] text-mak-ink">
            {formatPrice(total)}
          </span>
        </div>

        {serverTotal === null ? (
          <Text size="label" tone="subtle" className="mt-3">
            Confirmed against live stock and pricing at the next step.
          </Text>
        ) : null}
      </div>
    </aside>
  );
}
