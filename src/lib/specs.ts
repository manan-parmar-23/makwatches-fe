import type { ProductSpecs } from "@/lib/api/types";

/**
 * Watch specification presentation.
 *
 * Deliberately framework-free and in no client boundary: both the quick view (a
 * client component) and the product detail page (a server component) need this,
 * and a function exported from a "use client" module cannot be called on the
 * server.
 */

/** Human labels for the spec keys, in display order. */
export const SPEC_LABELS: { key: keyof ProductSpecs; label: string }[] = [
  { key: "movement", label: "Movement" },
  { key: "case", label: "Case" },
  { key: "crystal", label: "Crystal" },
  { key: "dial", label: "Dial" },
  { key: "strap", label: "Strap" },
  { key: "waterResistance", label: "Water resistance" },
  { key: "dimensions", label: "Dimensions" },
  { key: "warranty", label: "Warranty" },
];

/**
 * Only the spec entries a product actually carries.
 *
 * A missing specification is omitted entirely rather than rendered as an empty
 * or placeholder row — the UI must never imply a value the record does not have.
 */
export function presentSpecs(
  specs: ProductSpecs | undefined
): { label: string; value: string }[] {
  if (!specs) return [];

  return SPEC_LABELS.flatMap(({ key, label }) => {
    const value = specs[key];
    // boxContents is a string[]; it is rendered separately on the PDP.
    if (typeof value !== "string" || value.trim() === "") return [];
    return [{ label, value: value.trim() }];
  });
}
