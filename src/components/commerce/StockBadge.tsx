import { Badge } from "@/design-system";

/**
 * Availability, derived from the stock count.
 *
 * The low-stock threshold is a presentation decision, not a claim about the
 * business: it only changes how an already-known number is described.
 */

const LOW_STOCK_THRESHOLD = 5;

export interface StockBadgeProps {
  stock: number;
  /** Hide the badge entirely when comfortably in stock. */
  onlyWhenNotable?: boolean;
  className?: string;
}

export function StockBadge({
  stock,
  onlyWhenNotable = false,
  className,
}: StockBadgeProps) {
  if (stock <= 0) {
    return (
      <Badge tone="error" className={className}>
        Sold out
      </Badge>
    );
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return (
      <Badge tone="warning" className={className}>
        Only {stock} left
      </Badge>
    );
  }

  if (onlyWhenNotable) return null;

  return (
    <Badge tone="success" className={className}>
      In stock
    </Badge>
  );
}
