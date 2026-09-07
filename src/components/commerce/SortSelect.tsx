"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@/design-system";

/**
 * Sort order.
 *
 * A native <select>: it is keyboard-accessible, announces correctly, and gets
 * the platform's own picker on mobile, which is better than any custom
 * dropdown would be on a small screen. Only the chevron is custom.
 */

export type SortValue =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "name-asc";

export const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "featured", label: "Sort · Featured" },
  { value: "newest", label: "Sort · Newest" },
  { value: "price-asc", label: "Price · Low to high" },
  { value: "price-desc", label: "Price · High to low" },
  { value: "name-asc", label: "Name · A to Z" },
];

/** Translate a sort choice into catalog query parameters. */
export function sortToQuery(value: SortValue): {
  sortBy?: "createdAt" | "price" | "name";
  order?: "asc" | "desc";
} {
  switch (value) {
    case "price-asc":
      return { sortBy: "price", order: "asc" };
    case "price-desc":
      return { sortBy: "price", order: "desc" };
    case "name-asc":
      return { sortBy: "name", order: "asc" };
    case "newest":
      return { sortBy: "createdAt", order: "desc" };
    case "featured":
    default:
      // Featured has no dedicated ordering yet; newest is the closest proxy.
      return { sortBy: "createdAt", order: "desc" };
  }
}

export interface SortSelectProps {
  value: SortValue;
  onChange: (value: SortValue) => void;
  className?: string;
}

export function SortSelect({ value, onChange, className }: SortSelectProps) {
  const id = useId();

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Sort products
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as SortValue)}
        className={cn(
          "min-h-11 w-full cursor-pointer appearance-none border-2 border-mak-line bg-mak-bg",
          "py-2.5 pl-4 pr-10",
          "font-display text-mak-small font-extrabold tracking-[0.02em] text-mak-ink",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent"
        )}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-mak-ink"
        size={16}
      />
    </div>
  );
}
