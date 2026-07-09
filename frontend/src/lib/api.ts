import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 30000);
const ACCESS_TOKEN_STORAGE_KEY = "commercehub_access_token";

export type ApiErrorPayload = {
  code?: string;
  message?: string;
  details?: unknown;
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

  const axiosError = error as AxiosError<{ error?: ApiErrorPayload } | ApiErrorPayload>;
  const status = axiosError.response?.status;
  const payload = axiosError.response?.data;
  const nestedError =
    payload && "error" in payload && payload.error ? payload.error : (payload as ApiErrorPayload);
  const message =
    nestedError?.message ??
    axiosError.message ??
    "The request could not be completed.";

  return new ApiError(message, status, nestedError?.code, nestedError?.details);
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
