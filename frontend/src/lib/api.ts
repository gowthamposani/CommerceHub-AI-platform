import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 30000);
const ACCESS_TOKEN_STORAGE_KEY = "commercehub_access_token";

export type ApiErrorPayload = {
  error_code?: string;
  code?: string;
  message?: string;
  details?: unknown;
};

export type ToastVariant = "error" | "success" | "info";

export type ToastPayload = {
  id: string;
  message: string;
  title?: string;
  variant: ToastVariant;
};

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status?: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

function clearAccessToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

function handleUnauthorized(): void {
  clearAccessToken();
  window.dispatchEvent(new CustomEvent("commercehub:auth:unauthorized"));
}

function normalizeApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return new ApiError("Unexpected application error.");
  }

  const axiosError = error as AxiosError<
    { error?: ApiErrorPayload; error_code?: string; message?: string; details?: unknown } | ApiErrorPayload
  >;
  const status = axiosError.response?.status;
  const payload = axiosError.response?.data;
  const nestedError =
    payload && "error" in payload && payload.error ? payload.error : (payload as ApiErrorPayload);
  const message =
    nestedError?.message ??
    (payload && "message" in payload ? payload.message : undefined) ??
    axiosError.message ??
    "The request could not be completed.";

  const errorCode =
    nestedError?.code ??
    nestedError?.error_code ??
    (payload && "error_code" in payload ? payload.error_code : undefined);
  const details =
    nestedError?.details ?? (payload && "details" in payload ? payload.details : undefined);

  return new ApiError(message, status, errorCode, details);
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    const normalizedError = normalizeApiError(error);

    if (normalizedError.status === 401) {
      handleUnauthorized();
    }

    return Promise.reject(normalizedError);
  },
);

export function setAccessToken(token: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

export function removeAccessToken(): void {
  clearAccessToken();
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export function notifyToast(payload: Omit<ToastPayload, "id">): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<ToastPayload>("commercehub:toast", {
      detail: {
        ...payload,
        id: crypto.randomUUID(),
      },
    }),
  );
}

export function notifyApiFailure(error: unknown, title = "Request failed"): void {
  notifyToast({
    title,
    message: getApiErrorMessage(error),
    variant: "error",
  });
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return true;
  }

  return !error.status || error.status >= 500 || error.status === 408 || error.status === 429;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

export async function requestWithRetry<T>(
  request: () => Promise<AxiosResponse<T>>,
  options: { retries?: number; retryDelayMs?: number } = {},
): Promise<AxiosResponse<T>> {
  const retries = options.retries ?? 1;
  const retryDelayMs = options.retryDelayMs ?? 350;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      if (attempt >= retries || !isRetryableError(error)) {
        break;
      }
      await wait(retryDelayMs * (attempt + 1));
    }
  }

  throw lastError;
}

export function get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  return requestWithRetry(() => apiClient.get<T>(url, config));
}

export function post<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
  return requestWithRetry(() => apiClient.post<T>(url, data, config));
}
