"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ErrorState,
  LoadingState,
  Text,
  formatPrice,
} from "@/design-system";
import { getAccountOverview, type AccountOverview as Overview } from "@/lib/api/account";
import { listOrders, type Order } from "@/lib/api/orders";

import { OrderStatusBadge } from "./OrderStatusBadge";

/**
 * The account landing page.
 *
 * Answers the two questions someone actually opens their account for -- where
 * is my order, and what is on file about me -- rather than showing a dashboard
 * of counts and leaving them to hunt.
 */
export function AccountOverview() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [recent, setRecent] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([
      getAccountOverview(),
      // A failed order read must not take the whole page down: the profile
      // half is still useful on its own.
      listOrders().catch(() => [] as Order[]),
    ])
      .then(([data, orders]) => {
        if (!active) return;
        setOverview(data);
        setRecent(orders.slice(0, 3));
      })
      .catch(() => {
        if (active) setError("We could not load your account just now.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingState label="Loading your account" />;
  if (error || !overview) {
    return (
      <ErrorState
        title="Your account is not available."
        description={error ?? undefined}
        retryLabel="Try again"
        onRetry={() => window.location.reload()}
      />
    );
  }

  const { profile, counts } = overview;

  return (
    <div className="flex flex-col gap-12">
      <section aria-labelledby="account-hello">
        <h2
          id="account-hello"
          className="font-display text-mak-display font-extrabold tracking-[-0.02em] text-mak-ink"
        >
          {profile.name ? `Hello, ${profile.name.split(" ")[0]}.` : "Hello."}
        </h2>
        <Text tone="muted" className="mt-3">
          {profile.email}
        </Text>
      </section>

      <section aria-labelledby="account-counts">
        <h3 id="account-counts" className="sr-only">
          Your account at a glance
        </h3>
        <dl className="grid grid-cols-3 border-2 border-mak-line">
          <CountCell label="Orders" value={counts.orders} href="/orders" />
          <CountCell
            label="Saved"
            value={counts.wishlist}
            href="/wishlist"
            bordered
          />
          <CountCell
            label="Reviews"
            value={counts.reviews}
            href="/account/reviews"
            bordered
          />
        </dl>
      </section>

      <section aria-labelledby="account-recent">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
          <h3
            id="account-recent"
            className="font-display text-mak-label font-extrabold uppercase tracking-[0.14em] text-mak-ink"
          >
            Recent orders
          </h3>
          {recent.length > 0 ? (
            <Link
              href="/orders"
              className="text-mak-small text-mak-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent"
            >
              All orders
            </Link>
          ) : null}
        </div>

        {recent.length === 0 ? (
          <div className="border-2 border-mak-divider p-6">
            <Text tone="muted">
              You have not placed an order yet.{" "}
              <Link
                href="/shop"
                className="text-mak-accent underline underline-offset-4"
              >
                Browse the collection
              </Link>
              .
            </Text>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {recent.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 border-2 border-mak-divider p-4 no-underline transition-colors duration-200 ease-mak hover:border-mak-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent"
                >
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="font-display text-mak-small font-extrabold text-mak-ink">
                      {order.orderNumber || order.id}
                    </span>
                    <span className="text-mak-label text-mak-muted">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </span>
                  <span className="flex items-center gap-4">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-display text-mak-small font-extrabold text-mak-ink">
                      {formatPrice(order.total)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CountCell({
  label,
  value,
  href,
  bordered,
}: {
  label: string;
  value: number;
  href: string;
  bordered?: boolean;
}) {
  return (
    <div className={bordered ? "border-l-2 border-mak-line" : undefined}>
      <Link
        href={href}
        className="flex h-full flex-col gap-1 p-5 no-underline transition-colors duration-200 ease-mak hover:bg-mak-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mak-accent sm:p-6"
      >
        <dt className="font-display text-mak-label font-extrabold uppercase tracking-[0.14em] text-mak-muted">
          {label}
        </dt>
        <dd className="font-display text-3xl font-extrabold leading-none tracking-[-0.03em] text-mak-ink sm:text-4xl">
          {value}
        </dd>
      </Link>
    </div>
  );
}
