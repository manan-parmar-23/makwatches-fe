"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Button,
  ButtonLink,
  EmptyState,
  ErrorState,
  LoadingState,
  Text,
  useToast,
} from "@/design-system";
import {
  deleteReview,
  listReviews,
  type AccountReview,
} from "@/lib/api/account";

/**
 * The reviews this customer has written.
 *
 * Ratings are rendered as filled and empty marks with the number stated in
 * text too -- a star row alone is invisible to a screen reader and ambiguous
 * in a screenshot.
 */
export function ReviewsList() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<AccountReview[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setError(null);
    listReviews()
      .then(setReviews)
      .catch(() => setError("We could not load your reviews just now."));
  }

  useEffect(load, []);

  async function remove(id: string) {
    try {
      await deleteReview(id);
      toast("Review deleted.", { tone: "success" });
      load();
    } catch {
      toast("We could not delete that review.", { tone: "error" });
    }
  }

  if (error) {
    return (
      <ErrorState
        title="Reviews unavailable"
        description={error}
        retryLabel="Try again"
        onRetry={load}
      />
    );
  }

  if (!reviews) return <LoadingState label="Loading your reviews" />;

  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No reviews yet."
        description="Reviews you write on a product page appear here."
        action={<ButtonLink href="/shop">Browse the collection</ButtonLink>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h2 className="font-display text-mak-display font-extrabold tracking-[-0.02em] text-mak-ink">
        Your reviews
      </h2>

      <ul className="flex flex-col gap-4">
        {reviews.map((review) => (
          <li key={review.id} className="border-2 border-mak-divider p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                {review.productName ? (
                  <Link
                    href={`/product/id/${review.productId}`}
                    className="font-display text-mak-small font-extrabold text-mak-ink no-underline hover:text-mak-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent"
                  >
                    {review.productName}
                  </Link>
                ) : (
                  <span className="font-display text-mak-small font-extrabold text-mak-ink">
                    A product you reviewed
                  </span>
                )}
                <p className="mt-1.5 text-mak-label text-mak-muted">
                  <span aria-hidden="true">
                    {"●".repeat(Math.max(0, Math.min(5, review.rating)))}
                    {"○".repeat(Math.max(0, 5 - review.rating))}
                  </span>{" "}
                  <span>{review.rating} out of 5</span>
                  {" · "}
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => void remove(review.id)}
              >
                Delete
              </Button>
            </div>

            {review.title ? (
              <p className="mt-4 font-display text-mak-small font-extrabold text-mak-ink">
                {review.title}
              </p>
            ) : null}
            {review.comment ? (
              <Text size="small" tone="muted" className="mt-2">
                {review.comment}
              </Text>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
