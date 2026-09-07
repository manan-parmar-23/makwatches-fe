import { Archivo, Inter } from "next/font/google";

/**
 * Typefaces, loaded through next/font.
 *
 * next/font self-hosts the files, emits woff2, and inlines the @font-face rules
 * with a size-adjusted fallback, which removes the layout shift the previous
 * hand-written .ttf declarations caused.
 *
 * Both families are exposed as CSS variables rather than class names so they
 * can be referenced from the Tailwind @theme layer.
 */

/**
 * Archivo — the MAK Watches typeface, per the approved reference.
 *
 * Weights are deliberately limited to three: 400 for body, 600 for micro-labels
 * and navigation, 800 for editorial headings. The reference's guidance is to
 * avoid excessive font weights, and every extra weight is another file to ship.
 */
export const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-archivo",
  display: "swap",
});

/**
 * Inter — retained only for the legacy storefront and admin panel, which style
 * against it throughout. New MAK components use Archivo via `--font-display`
 * and `--font-body`. This can be dropped once the last legacy route is rebuilt.
 */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/** Both font variables, for the <html> class list. */
export const fontVariables = `${archivo.variable} ${inter.variable}`;
