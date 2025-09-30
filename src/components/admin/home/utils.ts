import type { AxiosError } from "axios";

export const parseErrorMessage = (err: unknown, fallback = "Something went wrong") => {
  const axiosError = err as AxiosError<{ message?: string }>;
  return (
    axiosError?.response?.data?.message || axiosError?.message || fallback
  );
};

export const parseListInput = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
