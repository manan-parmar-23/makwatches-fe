"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchHomeContent, type ApiResponse } from "@/utils/api";
import type { HomeContentResponse } from "@/types/home-content";

export function useHomeContent() {
  const [data, setData] = useState<HomeContentResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchHomeContent();
      const payload: ApiResponse<HomeContentResponse> = res.data;
      setData(payload.data);
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null &&
        // @ts-expect-error - narrow axios-like error shape optionally
        (err.response?.data?.message || err.message)
          ? // @ts-expect-error - optional chaining on axios-like error
            (err.response?.data?.message || err.message)
          : "Failed to load home content";
      setError(String(message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
