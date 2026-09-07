"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { Button, ButtonLink, Text, formatPrice } from "@/design-system";
import type { Product } from "@/lib/api/types";

/**
 * The gate in front of the 3D showroom.
 *
 * The brief is explicit that the boutique is optional and must not get in the
 * way of shopping, so this enforces three things:
 *
 *  1. **Nothing loads until asked.** three.js is behind a dynamic import that
 *     only runs when the visitor presses the button, so the bytes never reach
 *     anyone who does not open the room -- including everyone on the rest of
 *     the site.
 *  2. **The button only appears when the room can actually run.** WebGL,
 *     enough viewport to see anything, no reduced-motion preference, no
 *     Save-Data header.
 *  3. **The grid underneath is the real page.** It is server-rendered, works
 *     without JavaScript, and every piece is as buyable there as anywhere else.
 *     The showroom is decoration on top of a working page, never a gateway to
 *     one.
 */

const Showroom = dynamic(() => import("./Showroom"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(70vh,620px)] w-full items-center justify-center border-2 border-mak-line bg-mak-surface">
      <p className="text-mak-small text-mak-muted">Loading the showroom…</p>
    </div>
  ),
});

type Capability = "checking" | "ready" | "unsupported" | "reduced" | "small";

export function BoutiqueStage({ products }: { products: Product[] }) {
  const [capability, setCapability] = useState<Capability>("checking");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    // Someone who has asked for less motion has asked for less of this.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCapability("reduced");
      return;
    }

    // Save-Data is a direct request not to be handed a megabyte of renderer.
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (connection?.saveData) {
      setCapability("unsupported");
      return;
    }

    if (window.innerWidth < 768) {
      setCapability("small");
      return;
    }

    // Probe for a real context rather than trusting the user agent, and release
    // it immediately -- browsers allow only a handful at a time.
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      if (!gl) {
        setCapability("unsupported");
        return;
      }
      const lose = gl.getExtension("WEBGL_lose_context");
      lose?.loseContext();
      setCapability("ready");
    } catch {
      setCapability("unsupported");
    }
  }, []);

  if (products.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {open ? (
        <>
          <Showroom
            products={products}
            onSelect={setSelected}
            selectedId={selected?.id ?? null}
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            {selected ? (
              <div className="flex flex-wrap items-baseline gap-4">
                <span className="font-display text-mak-body font-extrabold text-mak-ink">
                  {selected.name}
                </span>
                <span className="text-mak-small text-mak-muted">
                  {formatPrice(selected.price)}
                </span>
                <ButtonLink
                  href={`/product/id/${selected.id}`}
                  size="sm"
                  variant="secondary"
                >
                  View this piece
                </ButtonLink>
              </div>
            ) : (
              <Text size="small" tone="muted">
                Drag to look around. Select a piece to see what it is.
              </Text>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen(false);
                setSelected(null);
              }}
            >
              Close the room
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          {capability === "ready" ? (
            <>
              <Button onClick={() => setOpen(true)}>Enter the showroom</Button>
              <Text size="label" tone="subtle">
                Loads a 3D view on demand. Everything in it is below as well.
              </Text>
            </>
          ) : capability === "checking" ? null : (
            <Text size="small" tone="muted">
              {capability === "reduced"
                ? "The 3D showroom is hidden because your device asks for reduced motion. Every piece is below."
                : capability === "small"
                  ? "The 3D showroom needs a wider screen. Every piece is below."
                  : "Your browser cannot run the 3D showroom. Every piece is below."}
            </Text>
          )}
        </div>
      )}
    </div>
  );
}
