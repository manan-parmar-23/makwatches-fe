"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button, FilterIcon, Text } from "@/design-system";
import type { CatalogFilters } from "@/lib/api/types";

import { FilterSidebar, type FilterSelection } from "./FilterSidebar";
import { FilterSheet } from "./FilterSheet";
import { SortSelect, type SortValue } from "./SortSelect";

/**
 * Filter and sort controls for a catalog listing.
 *
 * State lives in the URL, not in this component. That is what makes a filtered
 * view shareable, bookmarkable, back-button-correct and server-renderable: the
 * page reads searchParams and fetches accordingly, and these controls only
 * rewrite the URL.
 *
 * Navigation runs inside a transition so the current results stay on screen,
 * dimmed, while the next page streams in — rather than blanking to a spinner
 * on every checkbox.
 */

export interface ShopControlsProps {
  filters: CatalogFilters;
  /** Result count for the current selection. */
  resultCount?: number;
  /** Params this listing owns and must not rewrite (e.g. a locked category). */
  lockedParams?: string[];
  className?: string;
}

/** Read the current filter selection out of the URL. */
export function selectionFromParams(params: URLSearchParams): FilterSelection {
  const number = (key: string) => {
    const raw = params.get(key);
    if (!raw) return undefined;
    const value = Number(raw);
    return Number.isFinite(value) ? value : undefined;
  };

  const brand = params.get("brand");

  return {
    brand: brand ? brand.split(",").filter(Boolean) : undefined,
    gender: params.get("gender") ?? undefined,
    dialColor: params.get("dialColor") ?? undefined,
    dialShape: params.get("dialShape") ?? undefined,
    dialType: params.get("dialType") ?? undefined,
    strapColor: params.get("strapColor") ?? undefined,
    strapMaterial: params.get("strapMaterial") ?? undefined,
    style: params.get("style") ?? undefined,
    minPrice: number("minPrice"),
    maxPrice: number("maxPrice"),
    inStock: params.get("inStock") === "true" ? true : undefined,
  };
}

/** Read the current sort out of the URL. */
export function sortFromParams(params: URLSearchParams): SortValue {
  const raw = params.get("sort");
  const allowed: SortValue[] = [
    "featured",
    "newest",
    "price-asc",
    "price-desc",
    "name-asc",
  ];
  return allowed.includes(raw as SortValue) ? (raw as SortValue) : "featured";
}

export function ShopControls({
  filters,
  resultCount,
  lockedParams = [],
  className,
}: ShopControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const params = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  );

  const selection = useMemo(() => selectionFromParams(params), [params]);
  const sort = useMemo(() => sortFromParams(params), [params]);

  const [sheetOpen, setSheetOpen] = useState(false);

  /** Rewrite the URL from a next selection, preserving locked params. */
  const push = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams.toString());
      mutate(next);

      // Any change to the result set invalidates the current page number.
      next.delete("page");

      const query = next.toString();
      startTransition(() => {
        router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const onFiltersChange = useCallback(
    (next: FilterSelection) => {
      push((search) => {
        const set = (key: string, value: string | undefined) => {
          if (value) search.set(key, value);
          else search.delete(key);
        };

        set("brand", next.brand?.length ? next.brand.join(",") : undefined);
        set("gender", next.gender);
        set("dialColor", next.dialColor);
        set("dialShape", next.dialShape);
        set("dialType", next.dialType);
        set("strapColor", next.strapColor);
        set("strapMaterial", next.strapMaterial);
        set("style", next.style);
        set("minPrice", next.minPrice !== undefined ? String(next.minPrice) : undefined);
        set("maxPrice", next.maxPrice !== undefined ? String(next.maxPrice) : undefined);
        set("inStock", next.inStock ? "true" : undefined);
      });
    },
    [push]
  );

  const onReset = useCallback(() => {
    push((search) => {
      // Keep the params that define which listing this is; clear the rest.
      const keep = new Map<string, string>();
      for (const key of [...lockedParams, "sort"]) {
        const value = search.get(key);
        if (value) keep.set(key, value);
      }
      for (const key of Array.from(search.keys())) search.delete(key);
      for (const [key, value] of keep) search.set(key, value);
    });
  }, [push, lockedParams]);

  const onSortChange = useCallback(
    (next: SortValue) => {
      push((search) => {
        if (next === "featured") search.delete("sort");
        else search.set("sort", next);
      });
    },
    [push]
  );

  const hasFilters = Object.keys(filters).length > 0;

  return (
    <>
      {/* Mobile: a filter trigger and sort, side by side. */}
      <div
        className={cn(
          "flex items-center gap-3 lg:hidden",
          pending && "opacity-60",
          className
        )}
      >
        {hasFilters ? (
          <Button
            variant="secondary"
            size="md"
            onClick={() => setSheetOpen(true)}
            iconLeft={<FilterIcon size={16} />}
            className="flex-1"
          >
            Filters
          </Button>
        ) : null}
        <SortSelect value={sort} onChange={onSortChange} className="flex-1" />
      </div>

      {/* Desktop: the sidebar itself. */}
      {hasFilters ? (
        <div className={cn("hidden lg:block", pending && "opacity-60")}>
          <FilterSidebar
            filters={filters}
            selection={selection}
            onChange={onFiltersChange}
            onReset={onReset}
            resultCount={resultCount}
          />
        </div>
      ) : (
        <Text size="small" tone="subtle" className="hidden lg:block">
          No filters are available for this selection yet.
        </Text>
      )}

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        selection={selection}
        onChange={onFiltersChange}
        onReset={onReset}
        resultCount={resultCount}
      />
    </>
  );
}

/**
 * The desktop sort control, rendered in the results header rather than the
 * sidebar. Split out so the listing can place it beside the result count.
 */
export function ShopSort({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const sort = useMemo(
    () => sortFromParams(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );

  const onChange = useCallback(
    (next: SortValue) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "featured") params.delete("sort");
      else params.set("sort", next);
      params.delete("page");

      const query = params.toString();
      startTransition(() => {
        router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  return (
    <div className={cn("hidden lg:block", className)}>
      <SortSelect value={sort} onChange={onChange} />
    </div>
  );
}
