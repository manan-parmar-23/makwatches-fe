import {
  ButtonLink,
  Container,
  ErrorState,
  Section,
  SectionHeader,
  ArrowRightIcon,
} from "@/design-system";
import { ProductGrid } from "@/components/commerce";
import type { Product } from "@/lib/api/types";

/**
 * A titled band of products.
 *
 * The homepage uses this three times — latest additions, and the Men's and
 * Women's edits — so the header, grid density and "view all" affordance stay
 * identical across them.
 *
 * Section labels describe what the query actually returned. Where the reference
 * says "Featured" or "Bestsellers", no product currently carries those flags,
 * and calling an arbitrary slice "bestselling" would be an invented claim. The
 * homepage instead labels these for what they are.
 *
 * Renders nothing when the query succeeded with no products, so an empty
 * category never leaves a titled but blank band on the page.
 */

export interface ProductSectionProps {
  id?: string;
  eyebrow: string;
  title: string;
  products: Product[];
  /** True when the request failed, as distinct from returning no results. */
  failed?: boolean;
  /** Total matching the query, shown beside the heading. */
  total?: number;
  viewAll?: { label: string; href: string };
  /** Prioritize images in the first row. Use once per page, above the fold. */
  priorityCount?: number;
  tone?: "default" | "surface";
}

export function ProductSection({
  id,
  eyebrow,
  title,
  products,
  failed = false,
  total,
  viewAll,
  priorityCount = 0,
  tone = "default",
}: ProductSectionProps) {
  // A failed request is surfaced; an empty-but-successful one is simply absent.
  if (!failed && products.length === 0) return null;

  return (
    <Section id={id} spacing="default" tone={tone}>
      <Container>
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          aside={
            typeof total === "number" && total > 0
              ? `${total.toLocaleString("en-IN")} pieces`
              : undefined
          }
          className="mb-9"
        />

        {failed ? (
          <ErrorState
            title="Products could not be loaded."
            description="The catalog is temporarily unavailable. Please refresh, or browse the full collection."
          />
        ) : (
          <ProductGrid products={products} priorityCount={priorityCount} />
        )}

        {viewAll && !failed ? (
          <div className="mt-10 flex justify-center">
            <ButtonLink
              href={viewAll.href}
              variant="secondary"
              size="lg"
              iconRight={<ArrowRightIcon size={16} />}
            >
              {viewAll.label}
            </ButtonLink>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
