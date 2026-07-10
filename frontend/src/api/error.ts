import axios from "axios";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { message?: string; data?: { message?: string } | unknown } | undefined;

    const nestedMessage =
      payload && typeof payload.data === "object" ? (payload.data as { message?: string }).message : undefined;
    return nestedMessage ?? payload?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

export function toApiError(error: unknown, fallback = "Something went wrong"): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { message?: string; data?: { message?: string } | unknown } | undefined;
    const nestedMessage =
      payload && typeof payload.data === "object" ? (payload.data as { message?: string }).message : undefined;
    return new ApiError(
      nestedMessage ?? payload?.message ?? error.message ?? fallback,
      error.response?.status,
      payload
    );
  }

  if (error instanceof Error) {
    return new ApiError(error.message || fallback, undefined, error);
  }

  return new ApiError(fallback, undefined, error);
}
