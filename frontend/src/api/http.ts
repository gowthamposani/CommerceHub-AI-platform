import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { appConfig } from "../config";
import { authStorage } from "../auth/auth-storage";
import { refreshAuthSession } from "../auth/auth-api";
import type { AuthSession } from "../types/domain";
import { toApiError } from "./error";

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };
let refreshSessionPromise: Promise<AuthSession> | null = null;

export const http = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

const isAuthEndpoint = (url?: string): boolean =>
  Boolean(
    url &&
    (url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/register") ||
      url.includes("/auth/logout"))
  );

const refreshSession = (refreshToken: string): Promise<AuthSession> => {
  if (!refreshSessionPromise) {
    refreshSessionPromise = refreshAuthSession(refreshToken).finally(() => {
      refreshSessionPromise = null;
    });
  }

  return refreshSessionPromise;
};

http.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry && !isAuthEndpoint(original.url)) {
      original._retry = true;
      const session = authStorage.getSession();

      if (session && !authStorage.isRefreshTokenExpired(session)) {
        try {
          const refreshed = await refreshSession(session.tokens.refresh_token);
          authStorage.saveSession(refreshed, authStorage.getRememberMe());
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${refreshed.tokens.access_token}`;
          return http.request(original);
        } catch {
          authStorage.clearSession();
        }
      }
    }

    return Promise.reject(toApiError(error));
  }
);
