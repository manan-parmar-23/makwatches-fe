"use client";

import { Button, Drawer } from "@/design-system";
import type { CatalogFilters } from "@/lib/api/types";

import { FilterSidebar, type FilterSelection } from "./FilterSidebar";

/**
 * The mobile filter experience.
 *
 * Wraps the same FilterSidebar body in a full-height drawer, so desktop and
 * mobile can never present a different set of facets. Per the approved
 * responsive strategy this is what mobile and tablet get instead of a sidebar.
 *
 * The Apply button just closes the sheet: filtering is applied live as the
 * shopper selects, and the footer confirms the result count so the choice is
 * not made blind.
 */

export interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: CatalogFilters;
  selection: FilterSelection;
  onChange: (next: FilterSelection) => void;
  onReset: () => void;
  resultCount?: number;
}

export function FilterSheet({
  open,
  onClose,
  filters,
  selection,
  onChange,
  onReset,
  resultCount,
}: FilterSheetProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filters"
      side="left"
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" size="lg" onClick={onReset} className="flex-1">
            Clear
          </Button>
          <Button variant="primary" size="lg" onClick={onClose} className="flex-[2]">
            {typeof resultCount === "number"
              ? `Show ${resultCount} ${resultCount === 1 ? "piece" : "pieces"}`
              : "Apply"}
          </Button>
        </div>
      }
    >
      <FilterSidebar
        filters={filters}
        selection={selection}
        onChange={onChange}
        onReset={onReset}
        resultCount={resultCount}
        className="p-6"
      />
    </Drawer>
  );
}
