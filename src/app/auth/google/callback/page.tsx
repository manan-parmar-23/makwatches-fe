"use client";

import { useEffect, useState } from "react";

export default function GoogleCallbackProxyPage() {
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Forward Google's callback (currently hitting the frontend) to the backend callback
      const search =
        typeof window !== "undefined" ? window.location.search : "";
      const base =
        process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.makwatches.in";
      const url = `${base.replace(/\/$/, "")}/auth/google/callback${search}`;
      window.location.replace(url);
    } catch (e) {
      setError("Failed to redirect to authentication server");
      console.error(e);
    } finally {
      setProcessing(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {processing ? (
          <div>
            <div className="text-xl font-semibold">Connecting to Google…</div>
            <div className="mt-4 text-sm text-gray-600">Please wait.</div>
          </div>
        ) : error ? (
          <div>
            <div className="text-xl font-semibold text-red-600">{error}</div>
            <div className="mt-4 text-sm text-gray-600">Please try again.</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
