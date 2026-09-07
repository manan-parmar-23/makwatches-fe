"use client";

import type { ReactNode } from "react";

import { ADMIN_COLORS } from "@/components/admin/home/constants";

/**
 * The small controls the storefront editor is built from.
 *
 * These follow the admin panel's existing look (ADMIN_COLORS, rounded cards)
 * rather than the storefront's design system. The two are deliberately
 * different: this is internal tooling that lives inside an established panel,
 * and dropping the storefront's Modernist primitives into it would leave the
 * admin looking like two applications stitched together.
 */

export function AdminField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: ADMIN_COLORS.textMuted }}
      >
        {label}
      </span>
      {children}
      {hint ? (
        <span className="text-xs" style={{ color: ADMIN_COLORS.textMuted }}>
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function AdminInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors " +
        "focus:border-transparent focus:ring-2 " +
        (props.className ?? "")
      }
      style={{
        borderColor: ADMIN_COLORS.surfaceLight,
        color: ADMIN_COLORS.text,
        ...props.style,
      }}
    />
  );
}

export function AdminSelect({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select
      {...props}
      className={
        "w-full rounded-md border bg-white px-3 py-2 text-sm outline-none " +
        (props.className ?? "")
      }
      style={{
        borderColor: ADMIN_COLORS.surfaceLight,
        color: ADMIN_COLORS.text,
        ...props.style,
      }}
    >
      {children}
    </select>
  );
}

/**
 * An on/off switch for a section or an item.
 *
 * A real checkbox underneath, so it is reachable and announced as one; the
 * track is decoration.
 */
export function AdminToggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer h-5 w-9 cursor-pointer appearance-none rounded-full transition-colors"
          style={{
            backgroundColor: checked
              ? ADMIN_COLORS.primary
              : ADMIN_COLORS.surfaceLight,
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
          style={{ left: checked ? "1.25rem" : "0.125rem" }}
        />
      </span>
      <span className="min-w-0">
        <span
          className="block text-sm font-medium"
          style={{ color: ADMIN_COLORS.text }}
        >
          {label}
        </span>
        {description ? (
          <span
            className="block text-xs"
            style={{ color: ADMIN_COLORS.textMuted }}
          >
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export function AdminButton({
  tone = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "default" | "danger";
}) {
  const style =
    tone === "primary"
      ? { backgroundColor: ADMIN_COLORS.primary, color: ADMIN_COLORS.secondary }
      : tone === "danger"
        ? { backgroundColor: "transparent", color: ADMIN_COLORS.error, borderColor: ADMIN_COLORS.error }
        : { backgroundColor: "transparent", color: ADMIN_COLORS.text, borderColor: ADMIN_COLORS.surfaceLight };

  return (
    <button
      {...props}
      className={
        "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium " +
        "transition-opacity hover:opacity-80 disabled:opacity-40 disabled:pointer-events-none " +
        (props.className ?? "")
      }
      style={{ borderColor: "transparent", ...style, ...props.style }}
    />
  );
}

/** Up/down/remove, the controls every ordered list in this editor needs. */
export function RowActions({
  onUp,
  onDown,
  onRemove,
  disableUp,
  disableDown,
}: {
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
  disableUp: boolean;
  disableDown: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <AdminButton onClick={onUp} disabled={disableUp} aria-label="Move up">
        ↑
      </AdminButton>
      <AdminButton onClick={onDown} disabled={disableDown} aria-label="Move down">
        ↓
      </AdminButton>
      <AdminButton tone="danger" onClick={onRemove} aria-label="Remove">
        Remove
      </AdminButton>
    </div>
  );
}

export function AdminCard({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section
      className="rounded-xl border p-5"
      style={{
        borderColor: ADMIN_COLORS.surfaceLight,
        backgroundColor: ADMIN_COLORS.background,
      }}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            className="text-lg font-semibold"
            style={{ color: ADMIN_COLORS.text }}
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm" style={{ color: ADMIN_COLORS.textMuted }}>
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
