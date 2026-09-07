"use client";

import { useId, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "../icons";

/**
 * Accordion and Tabs.
 *
 * Both are built on native buttons with the correct ARIA wiring rather than on
 * divs with click handlers, so keyboard and screen-reader behaviour comes for
 * free.
 */

// ── Accordion ───────────────────────────────────────────────────────────────

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Ids open on first render. */
  defaultOpen?: string[];
  /** Close the others when one opens. */
  single?: boolean;
  className?: string;
}

/** A stack of expandable rows, separated by the system's hairline rule. */
export function Accordion({
  items,
  defaultOpen = [],
  single = false,
  className,
}: AccordionProps) {
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const baseId = useId();

  const toggle = (id: string) => {
    setOpen((current) => {
      const isOpen = current.includes(id);
      if (single) return isOpen ? [] : [id];
      return isOpen ? current.filter((x) => x !== id) : [...current, id];
    });
  };

  return (
    <div className={cn("border-t-2 border-mak-line", className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        const headerId = `${baseId}-${item.id}-header`;
        const panelId = `${baseId}-${item.id}-panel`;

        return (
          <div key={item.id} className="border-b-2 border-mak-line">
            <h3>
              <button
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className={cn(
                  "flex w-full min-h-14 items-center justify-between gap-4 py-4 text-left",
                  "font-display text-mak-body font-extrabold tracking-[-0.01em] text-mak-ink",
                  "transition-colors duration-200 ease-mak hover:text-mak-accent",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent"
                )}
              >
                <span>{item.title}</span>
                <ChevronDownIcon
                  className={cn(
                    "shrink-0 transition-transform duration-300 ease-mak",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
            </h3>

            {/*
              Kept mounted but hidden so in-page search still finds the content.
              `hidden` also removes it from the accessibility tree and tab order.
            */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isOpen}
              className="pb-5 text-mak-small leading-[1.6] text-mak-muted"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Tabs ────────────────────────────────────────────────────────────────────

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
}

/**
 * A tab set with roving-focus arrow-key navigation, per the WAI-ARIA tabs
 * pattern: Tab enters the list once, then Left/Right moves between tabs.
 */
export function Tabs({ items, defaultTab, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? items[0]?.id);
  const baseId = useId();

  if (items.length === 0) return null;

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const delta =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (delta === 0) return;

    event.preventDefault();
    const next = (index + delta + items.length) % items.length;
    setActive(items[next].id);
    document.getElementById(`${baseId}-${items[next].id}-tab`)?.focus();
  };

  return (
    <div className={className}>
      <div
        role="tablist"
        className="flex flex-wrap gap-2 border-b-2 border-mak-line"
      >
        {items.map((item, index) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${baseId}-${item.id}-tab`}
              aria-selected={selected}
              aria-controls={`${baseId}-${item.id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "relative min-h-11 px-4 py-3 -mb-0.5",
                "font-display text-mak-small font-extrabold uppercase tracking-[0.06em]",
                "border-b-2 transition-colors duration-200 ease-mak",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent",
                selected
                  ? "border-mak-accent text-mak-accent"
                  : "border-transparent text-mak-muted hover:text-mak-ink"
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-${item.id}-panel`}
          aria-labelledby={`${baseId}-${item.id}-tab`}
          hidden={item.id !== active}
          tabIndex={0}
          className="pt-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
