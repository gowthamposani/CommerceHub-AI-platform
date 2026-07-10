import { AxiosError } from "axios";

import type { ApiErrorResponse } from "@/types/common";

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.code === "ECONNABORTED") {
      return "The request timed out. Please try again.";
    }
    if (error.code === "ERR_CANCELED") {
      return "The request was cancelled.";
    }
    if (!error.response) {
      return "Unable to connect to the server.";
    }
    const payload = error.response?.data as ApiErrorResponse | undefined;
    return payload?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

export function getApiErrorDetails(error: unknown): ApiErrorResponse["errors"] {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as ApiErrorResponse | undefined;
    return payload?.errors ?? [];
  }
  return [];
}
