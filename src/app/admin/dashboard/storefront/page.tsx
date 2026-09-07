"use client";

import { ADMIN_COLORS } from "@/components/admin/home/constants";
import { StorefrontEditor } from "@/components/admin/storefront/StorefrontEditor";

/**
 * Storefront display settings.
 *
 * Distinct from Home Content next door: that page edits the catalogue-driven
 * material the homepage shows (hero slides, gallery imagery), while this one
 * edits the storefront *configuration* -- which sections exist at all, what the
 * menus contain, and which slice of the catalogue each product row pulls.
 */
export default function StorefrontSettingsPage() {
  return (
    <div className="space-y-8 pt-18 pb-16">
      <header className="space-y-2">
        <div className="mb-2 flex items-center">
          <div
            className="mr-3 h-8 w-1 rounded-full"
            style={{ backgroundColor: ADMIN_COLORS.primary }}
          />
          <div>
            <h1
              className="mb-1 text-2xl font-bold tracking-tight sm:text-3xl"
              style={{ color: ADMIN_COLORS.primary }}
            >
              Storefront Display
            </h1>
            <p className="text-sm" style={{ color: ADMIN_COLORS.textMuted }}>
              Navigation, category tiles, homepage sections and product rails —
              changed here, without a deploy.
            </p>
          </div>
        </div>
        <div
          className="h-1 w-24 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${ADMIN_COLORS.primary}, ${ADMIN_COLORS.secondary})`,
          }}
        />
      </header>

      <StorefrontEditor />
    </div>
  );
}
