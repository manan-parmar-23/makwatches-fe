import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The MAK type-scale tokens, which produce `text-mak-*` font-size utilities.
 *
 * These must be declared to tailwind-merge. Without it, `text-mak-hero` and
 * `text-mak-ink` look like the same `text-*` class group, so merging a size
 * with a colour silently dropped the size -- every heading in the design system
 * rendered at body size because `Heading` composes
 * `text-mak-hero` + `text-mak-ink` through cn().
 *
 * Keep in sync with the `--text-mak-*` tokens in
 * src/styles/mak-design-system.css.
 */
const MAK_FONT_SIZES = [
  "mak-hero",
  "mak-display",
  "mak-title",
  "mak-heading",
  "mak-body",
  "mak-small",
  "mak-label",
  "mak-micro",
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Classify the size tokens as font-size so they no longer conflict with
      // the `text-mak-*` colour utilities, which stay in the text-color group.
      "font-size": [{ text: [...MAK_FONT_SIZES] }],
    },
  },
});

/**
 * Compose class names, resolving Tailwind conflicts last-wins.
 *
 * Uses a tailwind-merge instance extended with the MAK design tokens; see above.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
