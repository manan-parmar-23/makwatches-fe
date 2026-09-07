import { redirect } from "next/navigation";

import { fetchProductById } from "@/lib/api/server";

/**
 * The legacy product URL, `/product_details?id=…`.
 *
 * Now that /product/[slug] and /product/id/[id] exist, this resolves the id and
 * forwards to the rebuilt page rather than rendering its own.
 *
 * A query-param id cannot be expressed as a static rule in next.config.ts, so
 * the redirect is issued here after looking the product up. It is a 307, not a
 * 308: the mapping depends on whether the record has a slug yet, and a
 * permanent redirect would be cached by browsers and search engines before the
 * slug backfill has run.
 *
 * An unknown or missing id falls back to /shop rather than 404ing — the old
 * link was valid once, and dropping the visitor into the catalogue is more
 * useful than a dead end.
 */

export const dynamic = "force-dynamic";

export default async function LegacyProductDetailsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.id;
  const id = Array.isArray(raw) ? raw[0] : raw;

  if (!id) redirect("/shop");

  const product = await fetchProductById(id);
  if (!product) redirect("/shop");

  redirect(product.slug ? `/product/${product.slug}` : `/product/id/${product.id}`);
}
