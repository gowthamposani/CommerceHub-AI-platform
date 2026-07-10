import axios from "axios";

import { appConfig } from "../config";
import { unwrapApiResponse } from "../api/client";
import type { ApiEnvelope } from "../types/api";
import type { AuthLoginPayload, AuthRegistrationPayload, AuthSession, AuthUser } from "../types/domain";

const authHttp = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

export async function registerCustomer(payload: AuthRegistrationPayload): Promise<AuthUser> {
  return unwrapApiResponse(authHttp.post<ApiEnvelope<AuthUser>>("/auth/register", payload));
}

export async function login(payload: AuthLoginPayload): Promise<AuthSession> {
  return unwrapApiResponse(authHttp.post<ApiEnvelope<AuthSession>>("/auth/login", payload));
}

export async function refreshAuthSession(refreshToken: string): Promise<AuthSession> {
  return unwrapApiResponse(
    authHttp.post<ApiEnvelope<AuthSession>>("/auth/refresh", {
      refresh_token: refreshToken
    })
  );
}

export async function me(accessToken: string): Promise<AuthUser> {
  return unwrapApiResponse(
    authHttp.get<ApiEnvelope<AuthUser>>("/auth/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
  );
}

export async function logout(refreshToken: string): Promise<void> {
  await unwrapApiResponse(
    authHttp.post<ApiEnvelope<Record<string, never>>>("/auth/logout", {
      refresh_token: refreshToken
    })
  );
}
