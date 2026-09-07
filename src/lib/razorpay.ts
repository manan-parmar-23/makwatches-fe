/**
 * Razorpay's checkout widget.
 *
 * The script is loaded on demand rather than in the document head: it is only
 * needed by someone who has reached the payment step and chosen to pay online,
 * and every other visitor should not pay for it.
 *
 * Nothing here decides an amount. The order id, the amount and the publishable
 * key are all issued by our server; this module only opens the widget and
 * reports back what the gateway said.
 */

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (payload: unknown) => void) => void;
}

interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let loader: Promise<RazorpayConstructor> | null = null;

/**
 * Load the widget once per page.
 *
 * A failed load resets the memo so a later attempt can retry: a customer on a
 * flaky connection should not be locked out of paying for the rest of the
 * session by one dropped request.
 */
export function loadRazorpay(): Promise<RazorpayConstructor> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay can only load in the browser"));
  }
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (loader) return loader;

  loader = new Promise<RazorpayConstructor>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`
    );

    const onReady = () => {
      if (window.Razorpay) resolve(window.Razorpay);
      else reject(new Error("Razorpay loaded but did not register"));
    };

    if (existing) {
      existing.addEventListener("load", onReady, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Could not load the payment widget")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.addEventListener("load", onReady, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Could not load the payment widget")),
      { once: true }
    );
    document.body.appendChild(script);
  }).catch((error) => {
    loader = null;
    throw error;
  });

  return loader;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  orderId: string;
  /** Shown in the widget header. */
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
}

export type RazorpayOutcome =
  | { status: "paid"; payment: RazorpaySuccess }
  | { status: "dismissed" }
  | { status: "failed"; message: string };

/**
 * Open the widget and settle once the customer is done with it.
 *
 * Dismissal is a distinct outcome from failure. Someone who closes the sheet to
 * think about it has not hit an error and must not be shown one -- their cart
 * and address are still exactly where they left them.
 */
export async function openRazorpay(
  options: RazorpayCheckoutOptions
): Promise<RazorpayOutcome> {
  const Razorpay = await loadRazorpay();

  return new Promise<RazorpayOutcome>((resolve) => {
    let settled = false;
    const settle = (outcome: RazorpayOutcome) => {
      if (settled) return;
      settled = true;
      resolve(outcome);
    };

    const instance = new Razorpay({
      key: options.key,
      amount: options.amount,
      currency: options.currency,
      order_id: options.orderId,
      name: options.name,
      description: options.description,
      prefill: options.prefill,
      // Square corners and the accent, to match the rest of checkout.
      theme: { color: "#ec3013" },
      handler: (payment: RazorpaySuccess) => settle({ status: "paid", payment }),
      modal: {
        ondismiss: () => settle({ status: "dismissed" }),
      },
    });

    instance.on("payment.failed", (payload: unknown) => {
      const description =
        (payload as { error?: { description?: string } })?.error?.description ??
        "The payment could not be completed.";
      settle({ status: "failed", message: description });
    });

    instance.open();
  });
}
