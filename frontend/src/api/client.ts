import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";

import { API_BASE_URL, API_RETRY_ATTEMPTS, API_RETRY_DELAY_MS, API_TIMEOUT_MS } from "@/constants/api";
import { AUTH_SESSION_STORAGE_KEY } from "@/constants/auth";
import type { AuthSession } from "@/types/auth";
import type { ApiErrorResponse } from "@/types/common";
import { getStorageItem } from "@/utils/storage";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json"
  }
});

function getAccessToken(): string | null {
  const session = getStorageItem<AuthSession | null>(AUTH_SESSION_STORAGE_KEY, null);
  return session?.accessToken ?? null;
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  config.headers["X-Client"] = "commercehub-ai-frontend";
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    return Promise.reject(error);
  }
);

function shouldRetry(error: AxiosError): boolean {
  if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") {
    return true;
  }
  const status = error.response?.status;
  return Boolean(status && status >= 500);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function createRequestController(): AbortController {
  return new AbortController();
}

export async function apiRequest<T>(config: AxiosRequestConfig, attempts = API_RETRY_ATTEMPTS): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= attempts; attempt += 1) {
    try {
      const response = await apiClient.request<T>(config);
      return response.data;
    } catch (error) {
      lastError = error;
      if (!(error instanceof AxiosError) || !shouldRetry(error) || attempt === attempts) {
        throw error;
      }
      await delay(API_RETRY_DELAY_MS * (attempt + 1));
    }
  }

  throw lastError;
}

export async function apiRequestWithCancellation<T>(config: AxiosRequestConfig): Promise<{
  promise: Promise<T>;
  cancel: () => void;
}> {
  const controller = createRequestController();
  const promise = apiRequest<T>({ ...config, signal: controller.signal });
  return {
    promise,
    cancel: () => controller.abort()
  };
}

export async function rawApiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response.data;
}
