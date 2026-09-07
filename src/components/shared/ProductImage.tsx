"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

export const PRODUCT_IMAGE_FALLBACK = "/placeholder.png";

/**
 * next/image wrapper for catalog imagery.
 *
 * Product images are served from Firebase Storage, so a reference can be
 * present on the product yet unresolvable (object removed, not yet uploaded, or
 * not publicly readable). next/image renders a broken frame in that case, so
 * this falls back to the project placeholder on load failure — and only then,
 * leaving every image that does resolve untouched.
 */
export default function ProductImage({ src, alt, ...rest }: ImageProps) {
  const [failed, setFailed] = useState(false);

  // A new src is a fresh attempt; clear any failure carried over from the
  // previous one (carousels and galleries reuse the same element).
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const resolved = failed || !src ? PRODUCT_IMAGE_FALLBACK : src;

  return (
    <Image
      {...rest}
      src={resolved}
      alt={alt}
      onError={() => setFailed(true)}
    />
  );
}
