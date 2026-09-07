"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import { useMounted } from "../hooks";
import { AlertIcon, CheckIcon, CloseIcon } from "../icons";

/**
 * Toast and Tooltip.
 *
 * The project already depends on react-hot-toast, which the legacy storefront
 * uses. This is a separate, design-system-native implementation so MAK surfaces
 * get the system's geometry (2px rules, zero radius) rather than the library's
 * rounded default -- and so the reconstruction does not inherit a global toast
 * container the legacy app also mounts.
 */

// ── Toast ───────────────────────────────────────────────────────────────────

/**
 * `warning` is for an outcome that succeeded but not as asked -- a cart line
 * clamped to the stock actually left, say. Reporting that as `error` would tell
 * the customer something failed when nothing did.
 */
export type ToastTone = "default" | "success" | "warning" | "error";

export interface Toast {
  id: string;
  message: ReactNode;
  tone: ToastTone;
  duration: number;
}

interface ToastContextValue {
  toast: (message: ReactNode, options?: { tone?: ToastTone; duration?: number }) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Access the toast queue.
 *
 * Throws outside a ToastProvider rather than silently no-opping, so a missing
 * provider surfaces in development instead of swallowing user feedback.
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const mounted = useMounted();
  const counter = useRef(0);
  const idPrefix = useId();

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue["toast"]>(
    (message, options) => {
      counter.current += 1;
      const id = `${idPrefix}-${counter.current}`;
      setToasts((current) => [
        ...current,
        {
          id,
          message,
          tone: options?.tone ?? "default",
          duration: options?.duration ?? 4000,
        },
      ]);
    },
    [idPrefix]
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div
            // A live region so new toasts are announced. "polite" avoids
            // interrupting whatever the user is doing.
            role="status"
            aria-live="polite"
            className="mak pointer-events-none fixed bottom-6 right-6 z-120 flex w-full max-w-sm flex-col gap-2"
          >
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 border-2 bg-mak-bg px-4 py-3 shadow-lg",
        "motion-safe:animate-in motion-safe:slide-in-from-bottom-2 motion-safe:fade-in-0",
        toast.tone === "success" && "border-mak-success",
        toast.tone === "warning" && "border-mak-warning",
        toast.tone === "error" && "border-mak-error",
        toast.tone === "default" && "border-mak-line"
      )}
    >
      {toast.tone !== "default" && (
        <span
          className={cn(
            "mt-0.5 shrink-0",
            toast.tone === "success" && "text-mak-success",
            toast.tone === "warning" && "text-mak-warning",
            toast.tone === "error" && "text-mak-error"
          )}
        >
          {toast.tone === "success" ? <CheckIcon /> : <AlertIcon />}
        </span>
      )}

      <div className="min-w-0 flex-1 text-mak-small leading-snug text-mak-ink">
        {toast.message}
      </div>

      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-mak-subtle transition-colors hover:text-mak-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent"
      >
        <CloseIcon size={16} />
      </button>
    </div>
  );
}

// ── Tooltip ─────────────────────────────────────────────────────────────────

export interface TooltipProps {
  /** The tooltip text. Keep it short -- this is a hint, not documentation. */
  label: string;
  side?: "top" | "bottom";
  children: ReactNode;
  className?: string;
}

/**
 * A hover/focus hint.
 *
 * Shown on focus as well as hover so it is reachable by keyboard, and wired
 * with aria-describedby rather than a title attribute.
 *
 * A tooltip must never be the only way to name a control -- use aria-label for
 * that. This is for supplementary detail only.
 */
export function Tooltip({
  label,
  side = "top",
  children,
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span aria-describedby={visible ? id : undefined} className="inline-flex">
        {children}
      </span>

      <span
        id={id}
        role="tooltip"
        hidden={!visible}
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap",
          "border-2 border-mak-line bg-mak-ink px-2.5 py-1.5",
          "font-display text-mak-micro font-extrabold uppercase tracking-[0.12em] text-mak-on-ink",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2"
        )}
      >
        {label}
      </span>
    </span>
  );
}
