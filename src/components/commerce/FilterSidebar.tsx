"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";
import { Button, Divider, Text, formatPrice } from "@/design-system";
import type { CatalogFilters, FilterOption } from "@/lib/api/types";

/**
 * The shop filter panel.
 *
 * Renders whatever facets the API reports for the current scope, rather than a
 * hardcoded list: the backend derives them from the products that actually
 * exist, so a facet with no values simply does not appear.
 *
 * Presentation-only and fully controlled -- it owns no state. The same
 * component body is used by the desktop sidebar and the mobile bottom sheet,
 * which is what keeps the two from drifting apart.
 */

/** The selected value(s) for each facet. */
export interface FilterSelection {
  brand?: string[];
  gender?: string;
  dialColor?: string;
  dialShape?: string;
  dialType?: string;
  strapColor?: string;
  strapMaterial?: string;
  style?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface FilterSidebarProps {
  filters: CatalogFilters;
  selection: FilterSelection;
  onChange: (next: FilterSelection) => void;
  onReset: () => void;
  /** Number of products the current selection yields. */
  resultCount?: number;
  className?: string;
}

/** The single-select facets, in display order. */
const SINGLE_FACETS: {
  key: keyof CatalogFilters;
  selectionKey: keyof FilterSelection;
  label: string;
}[] = [
  { key: "genders", selectionKey: "gender", label: "Gender" },
  { key: "styles", selectionKey: "style", label: "Style" },
  { key: "dialColors", selectionKey: "dialColor", label: "Dial colour" },
  { key: "dialShapes", selectionKey: "dialShape", label: "Dial shape" },
  { key: "dialTypes", selectionKey: "dialType", label: "Dial type" },
  { key: "strapColors", selectionKey: "strapColor", label: "Strap colour" },
  { key: "strapMaterials", selectionKey: "strapMaterial", label: "Strap material" },
];

function FacetGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-3 font-display text-mak-label font-extrabold uppercase tracking-[0.14em] text-mak-ink">
        {label}
      </legend>
      <div className="flex flex-col gap-2">{children}</div>
    </fieldset>
  );
}

/** A checkbox or radio row with a 44px target. */
function FilterRow({
  type,
  name,
  checked,
  onChange,
  label,
  count,
}: {
  type: "checkbox" | "radio";
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center gap-3 text-mak-small",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mak-accent",
        checked ? "text-mak-ink" : "text-mak-muted hover:text-mak-ink"
      )}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "flex size-[18px] shrink-0 items-center justify-center border-2 transition-colors",
          checked
            ? "border-mak-accent bg-mak-accent"
            : "border-mak-divider bg-transparent"
        )}
      >
        {checked && (
          <span className="size-1.5 bg-mak-on-accent" />
        )}
      </span>
      <span className="flex-1">{label}</span>
      {typeof count === "number" && (
        <span className="text-mak-micro text-mak-subtle">{count}</span>
      )}
    </label>
  );
}

export function FilterSidebar({
  filters,
  selection,
  onChange,
  onReset,
  resultCount,
  className,
}: FilterSidebarProps) {
  const priceId = useId();

  const activeCount =
    (selection.brand?.length ?? 0) +
    SINGLE_FACETS.filter((f) => selection[f.selectionKey]).length +
    (selection.inStock ? 1 : 0) +
    (selection.minPrice !== undefined || selection.maxPrice !== undefined ? 1 : 0);

  const toggleBrand = (value: string) => {
    const current = selection.brand ?? [];
    const next = current.includes(value)
      ? current.filter((b) => b !== value)
      : [...current, value];
    onChange({ ...selection, brand: next.length ? next : undefined });
  };

  const setSingle = (key: keyof FilterSelection, value: string) => {
    // Selecting the active value again clears it, so a radio facet can be
    // unset without a separate "Any" option.
    onChange({
      ...selection,
      [key]: selection[key] === value ? undefined : value,
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex items-center justify-between gap-3">
        <Text size="label" tone="ink">
          Filters
          {activeCount > 0 ? ` (${activeCount})` : ""}
        </Text>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Clear all
          </Button>
        )}
      </div>

      {typeof resultCount === "number" && (
        <Text size="small" tone="muted" aria-live="polite">
          {resultCount.toLocaleString("en-IN")}{" "}
          {resultCount === 1 ? "piece" : "pieces"}
        </Text>
      )}

      <Divider weight="hairline" />

      <FacetGroup label="Availability">
        <FilterRow
          type="checkbox"
          name="inStock"
          checked={Boolean(selection.inStock)}
          onChange={() =>
            onChange({ ...selection, inStock: selection.inStock ? undefined : true })
          }
          label="In stock only"
        />
      </FacetGroup>

      {filters.priceRange && (
        <>
          <Divider weight="hairline" />
          <FacetGroup label="Price">
            <div className="flex items-center gap-3">
              <label className="flex-1">
                <span className="sr-only">Minimum price</span>
                <input
                  id={`${priceId}-min`}
                  type="number"
                  inputMode="numeric"
                  min={filters.priceRange.min}
                  max={filters.priceRange.max}
                  value={selection.minPrice ?? ""}
                  placeholder={String(filters.priceRange.min)}
                  onChange={(event) =>
                    onChange({
                      ...selection,
                      minPrice: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                  className="min-h-11 w-full border-2 border-mak-divider bg-mak-bg px-3 text-mak-small text-mak-ink focus-visible:border-mak-accent focus-visible:outline-none"
                />
              </label>
              <span aria-hidden="true" className="text-mak-subtle">
                —
              </span>
              <label className="flex-1">
                <span className="sr-only">Maximum price</span>
                <input
                  id={`${priceId}-max`}
                  type="number"
                  inputMode="numeric"
                  min={filters.priceRange.min}
                  max={filters.priceRange.max}
                  value={selection.maxPrice ?? ""}
                  placeholder={String(filters.priceRange.max)}
                  onChange={(event) =>
                    onChange({
                      ...selection,
                      maxPrice: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                  className="min-h-11 w-full border-2 border-mak-divider bg-mak-bg px-3 text-mak-small text-mak-ink focus-visible:border-mak-accent focus-visible:outline-none"
                />
              </label>
            </div>
            <Text size="small" tone="subtle" className="text-mak-micro normal-case tracking-normal font-normal">
              {formatPrice(filters.priceRange.min)} –{" "}
              {formatPrice(filters.priceRange.max)}
            </Text>
          </FacetGroup>
        </>
      )}

      {filters.brands && filters.brands.length > 0 && (
        <>
          <Divider weight="hairline" />
          <FacetGroup label="Brand">
            {filters.brands.map((option: FilterOption) => (
              <FilterRow
                key={option.value}
                type="checkbox"
                name="brand"
                checked={(selection.brand ?? []).includes(option.value)}
                onChange={() => toggleBrand(option.value)}
                label={option.label ?? option.value}
                count={option.count}
              />
            ))}
          </FacetGroup>
        </>
      )}

      {SINGLE_FACETS.map(({ key, selectionKey, label }) => {
        const options = filters[key] as FilterOption[] | undefined;
        if (!options || options.length === 0) return null;

        return (
          <div key={key}>
            <Divider weight="hairline" className="mb-6" />
            <FacetGroup label={label}>
              {options.map((option) => (
                <FilterRow
                  key={option.value}
                  type="radio"
                  name={String(selectionKey)}
                  checked={selection[selectionKey] === option.value}
                  onChange={() => setSingle(selectionKey, option.value)}
                  label={option.label ?? option.value}
                  count={option.count}
                />
              ))}
            </FacetGroup>
          </div>
        );
      })}
    </div>
  );
}
