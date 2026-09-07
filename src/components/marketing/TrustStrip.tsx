import { cn } from "@/lib/utils";
import { Container, RuleGrid, Text } from "@/design-system";

/**
 * A short row of service propositions.
 *
 * Every item is supplied by the caller. Shipping speed, warranty length and
 * returns window are commercial commitments, not decoration, so this component
 * ships with no defaults and renders nothing when given nothing.
 *
 * A server component.
 */

export interface TrustItem {
  title: string;
  /** One short supporting line. */
  description?: string;
}

export interface TrustStripProps {
  items: TrustItem[];
  /** `bare` is a simple centred row; `grid` uses the hairline grid. */
  variant?: "bare" | "grid";
  className?: string;
}

export function TrustStrip({
  items,
  variant = "grid",
  className,
}: TrustStripProps) {
  if (items.length === 0) return null;

  if (variant === "bare") {
    return (
      <div className={cn("border-y-2 border-mak-line bg-mak-bg", className)}>
        <Container>
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-4 text-mak-label font-normal uppercase tracking-[0.14em] text-mak-muted">
            {items.map((item, index) => (
              <li key={`${item.title}-${index}`}>{item.title}</li>
            ))}
          </ul>
        </Container>
      </div>
    );
  }

  const columns = Math.min(items.length, 4) as 1 | 2 | 3 | 4;

  return (
    <Container className={className}>
      <RuleGrid cols={{ base: 1, md: columns > 2 ? 2 : columns, lg: columns }}>
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="p-6 md:p-7">
            <h3 className="font-display text-mak-heading font-extrabold tracking-[-0.01em] text-mak-ink">
              {item.title}
            </h3>
            {item.description ? (
              <Text size="small" tone="muted" className="mt-1.5">
                {item.description}
              </Text>
            ) : null}
          </div>
        ))}
      </RuleGrid>
    </Container>
  );
}
