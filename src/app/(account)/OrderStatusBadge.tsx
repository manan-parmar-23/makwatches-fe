import { cn } from "@/lib/utils";

/**
 * An order's status, as a rule-bordered label.
 *
 * Cancelled and returned are drawn with the error tone and delivered with the
 * success tone; everything in between stays neutral. Deliberately no green
 * "on the way" badge -- an order sitting in "processing" has not moved, and
 * colouring it as progress overstates what is known.
 *
 * A status the API introduces later renders as itself in the neutral tone
 * rather than disappearing.
 */

const TONE: Record<string, string> = {
  delivered: "border-mak-success text-mak-success",
  cancelled: "border-mak-error text-mak-error",
  canceled: "border-mak-error text-mak-error",
  returned: "border-mak-error text-mak-error",
  shipped: "border-mak-ink text-mak-ink",
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = status.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center border-2 px-2.5 py-1",
        "font-display text-[11px] font-extrabold uppercase tracking-[0.12em]",
        TONE[key] ?? "border-mak-divider text-mak-muted",
        className
      )}
    >
      {status}
    </span>
  );
}
