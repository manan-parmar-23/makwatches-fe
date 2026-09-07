"use client";

import { cn } from "@/lib/utils";

/**
 * A horizontal row of filter chips, as the reference collection section uses.
 *
 * Rendered as a radio group rather than a row of buttons: exactly one is
 * selected at a time, and arrow keys should move between them. Native radios
 * give that behaviour for free; the visible chip is the styled label.
 */

export interface ChipOption {
  value: string;
  label: string;
  count?: number;
}

export interface CategoryChipsProps {
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
  /** Accessible name for the group. */
  label?: string;
  className?: string;
}

export function CategoryChips({
  options,
  value,
  onChange,
  label = "Filter by category",
  className,
}: CategoryChipsProps) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("flex flex-wrap gap-2.5", className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <label
            key={option.value}
            className={cn(
              "inline-flex min-h-11 cursor-pointer items-center gap-2 border-2 px-4 py-2",
              "font-display text-mak-small font-extrabold tracking-[0.03em]",
              "transition-colors duration-200 ease-mak",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mak-accent",
              selected
                ? "border-mak-accent bg-mak-accent text-mak-on-accent"
                : "border-mak-line bg-mak-bg text-mak-ink hover:bg-mak-ink hover:text-mak-bg"
            )}
          >
            <input
              type="radio"
              name={label}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span>{option.label}</span>
            {typeof option.count === "number" && (
              <span className={cn("text-mak-micro", selected ? "opacity-80" : "opacity-55")}>
                {option.count}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
