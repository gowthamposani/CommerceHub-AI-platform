import { apiRequest } from "@/api/client";
import type { AuthUser, LoginPayload, RegisterPayload, TokenPair } from "@/types/auth";

export function login(payload: LoginPayload) {
  return apiRequest<TokenPair>({
    method: "POST",
    url: "/auth/login",
    data: payload
  });
}

export function register(payload: RegisterPayload) {
  return apiRequest<TokenPair>({
    method: "POST",
    url: "/auth/register",
    data: payload
  });
}

export function getCurrentUser() {
  return apiRequest<AuthUser>({
    method: "GET",
    url: "/auth/me"
  });
}

export function logout() {
  return apiRequest<{ detail: string }>({
    method: "POST",
    url: "/auth/logout"
  });
}
