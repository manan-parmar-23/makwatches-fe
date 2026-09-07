"use client";

import {
  createContext,
  useContext,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

/**
 * Form controls.
 *
 * Checkout is the first place the system needs real inputs, and it is also the
 * least forgiving: a customer who cannot tell which field is wrong abandons the
 * order. So the error state is part of the primitive rather than something each
 * form reinvents -- the message is rendered, tied to the control through
 * aria-describedby, and announced.
 *
 * Visually these follow the reference: a 2px rule, square corners, no inner
 * shadow, the accent reserved for focus. Never a rounded pill.
 */

const CONTROL_BASE =
  "w-full min-h-12 bg-mak-bg text-mak-ink " +
  "border-2 border-mak-line rounded-none " +
  "px-3.5 py-2.5 text-mak-body " +
  "transition-colors duration-200 ease-mak " +
  "placeholder:text-mak-subtle " +
  "hover:border-mak-ink " +
  "focus:outline-none focus:border-mak-ink " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent " +
  "disabled:opacity-45 disabled:pointer-events-none";

const CONTROL_INVALID = "border-mak-error hover:border-mak-error";

/**
 * Field carries the label, the error and the ids that tie them to the control,
 * so a control nested anywhere inside picks them up without prop drilling.
 */
interface FieldContextValue {
  controlId: string;
  describedBy?: string;
  invalid: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export interface FieldProps {
  label: string;
  /** Validation message. Its presence puts the field in its error state. */
  error?: string;
  /** Guidance shown under the label, before any error. */
  hint?: ReactNode;
  /** Marks the control required, visually and for assistive technology. */
  required?: boolean;
  /** Hide the label visually while keeping it for screen readers. */
  labelHidden?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({
  label,
  error,
  hint,
  required,
  labelHidden,
  className,
  children,
}: FieldProps) {
  const base = useId();
  const controlId = `${base}-control`;
  const hintId = hint ? `${base}-hint` : undefined;
  const errorId = error ? `${base}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <FieldContext.Provider
      value={{ controlId, describedBy, invalid: Boolean(error) }}
    >
      <div className={cn("flex flex-col gap-2", className)}>
        <label
          htmlFor={controlId}
          className={cn(
            "font-display text-mak-label font-extrabold uppercase tracking-[0.14em] text-mak-ink",
            labelHidden && "sr-only"
          )}
        >
          {label}
          {required ? (
            <span className="text-mak-accent" aria-hidden="true">
              {" "}
              *
            </span>
          ) : null}
        </label>

        {hint ? (
          <p id={hintId} className="text-mak-small text-mak-muted">
            {hint}
          </p>
        ) : null}

        {children}

        {error ? (
          <p
            id={errorId}
            role="alert"
            className="text-mak-small font-semibold text-mak-error"
          >
            {error}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

/** Wires a control to the Field wrapping it, if there is one. */
function useFieldProps(explicitId?: string) {
  const field = useContext(FieldContext);
  return {
    id: explicitId ?? field?.controlId,
    describedBy: field?.describedBy,
    invalid: Boolean(field?.invalid),
  };
}

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, id, ...props }: InputProps) {
  const field = useFieldProps(id);
  return (
    <input
      {...props}
      id={field.id}
      aria-describedby={props["aria-describedby"] ?? field.describedBy}
      aria-invalid={props["aria-invalid"] ?? (field.invalid || undefined)}
      className={cn(CONTROL_BASE, field.invalid && CONTROL_INVALID, className)}
    />
  );
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, id, rows = 4, ...props }: TextareaProps) {
  const field = useFieldProps(id);
  return (
    <textarea
      {...props}
      rows={rows}
      id={field.id}
      aria-describedby={props["aria-describedby"] ?? field.describedBy}
      aria-invalid={props["aria-invalid"] ?? (field.invalid || undefined)}
      className={cn(
        CONTROL_BASE,
        "resize-y",
        field.invalid && CONTROL_INVALID,
        className
      )}
    />
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function Select({ className, id, children, ...props }: SelectProps) {
  const field = useFieldProps(id);
  return (
    <div className="relative">
      <select
        {...props}
        id={field.id}
        aria-describedby={props["aria-describedby"] ?? field.describedBy}
        aria-invalid={props["aria-invalid"] ?? (field.invalid || undefined)}
        className={cn(
          CONTROL_BASE,
          "appearance-none pr-10",
          field.invalid && CONTROL_INVALID,
          className
        )}
      >
        {children}
      </select>
      {/*
        The native arrow is replaced rather than restyled -- it cannot be
        themed across browsers -- but the control underneath stays a real
        <select>, so touch and keyboard behaviour is the platform's.
      */}
      <svg
        aria-hidden="true"
        viewBox="0 0 12 8"
        className="pointer-events-none absolute right-4 top-1/2 h-2 w-3 -translate-y-1/2 text-mak-ink"
      >
        <path
          d="M1 1l5 5 5-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
}

export function Checkbox({ className, label, id, ...props }: CheckboxProps) {
  const generated = useId();
  const controlId = id ?? generated;
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          {...props}
          type="checkbox"
          id={controlId}
          className={cn(
            "peer size-5 cursor-pointer appearance-none",
            "border-2 border-mak-line bg-mak-bg rounded-none",
            "checked:border-mak-ink checked:bg-mak-ink",
            "transition-colors duration-200 ease-mak",
            "hover:border-mak-ink",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mak-accent",
            "disabled:opacity-45 disabled:pointer-events-none"
          )}
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 12 10"
          className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-3 -translate-x-1/2 -translate-y-1/2 text-mak-bg opacity-0 peer-checked:opacity-100"
        >
          <path
            d="M1 5l3.5 3.5L11 1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </span>
      <label
        htmlFor={controlId}
        className="cursor-pointer text-mak-small leading-relaxed text-mak-ink"
      >
        {label}
      </label>
    </div>
  );
}

export interface RadioCardOption<T extends string> {
  value: T;
  label: string;
  /** Supporting line. Say what is true; do not promise what is not configured. */
  description?: ReactNode;
  /** Right-aligned slot, typically a price or a badge. */
  meta?: ReactNode;
  disabled?: boolean;
}

export interface RadioCardsProps<T extends string> {
  /** Accessible name for the group. */
  legend: string;
  legendHidden?: boolean;
  name: string;
  value: T | null;
  onChange: (value: T) => void;
  options: RadioCardOption<T>[];
  className?: string;
}

/**
 * A radio group rendered as full-width selectable rows.
 *
 * Used for payment method and saved addresses: choices that carry a
 * description and need a target large enough for a thumb. Built on real radio
 * inputs, so arrow-key navigation and form semantics come from the platform.
 */
export function RadioCards<T extends string>({
  legend,
  legendHidden,
  name,
  value,
  onChange,
  options,
  className,
}: RadioCardsProps<T>) {
  return (
    <fieldset className={cn("flex flex-col gap-3", className)}>
      <legend
        className={cn(
          "mb-1 font-display text-mak-label font-extrabold uppercase tracking-[0.14em] text-mak-ink",
          legendHidden && "sr-only"
        )}
      >
        {legend}
      </legend>

      {options.map((option) => {
        const selected = value === option.value;
        return (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-start gap-3.5 border-2 p-4",
              "transition-colors duration-200 ease-mak",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mak-accent",
              selected
                ? "border-mak-ink bg-mak-surface"
                : "border-mak-divider hover:border-mak-ink",
              option.disabled && "pointer-events-none opacity-45"
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selected}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
              className={cn(
                "mt-0.5 size-5 shrink-0 cursor-pointer appearance-none rounded-full",
                "border-2 border-mak-line bg-mak-bg",
                "checked:border-[6px] checked:border-mak-ink",
                "transition-colors duration-200 ease-mak",
                "focus-visible:outline-none"
              )}
            />

            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="font-display text-mak-small font-extrabold tracking-[0.04em] text-mak-ink">
                {option.label}
              </span>
              {option.description ? (
                <span className="text-mak-small text-mak-muted">
                  {option.description}
                </span>
              ) : null}
            </span>

            {option.meta ? (
              <span className="shrink-0 text-mak-small text-mak-ink">
                {option.meta}
              </span>
            ) : null}
          </label>
        );
      })}
    </fieldset>
  );
}
