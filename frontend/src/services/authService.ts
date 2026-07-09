import { apiRequest } from "@/api/client";
import type { ApiResponse } from "@/types/common";
import type { AuthUser, LoginPayload, RegisterPayload, TokenPair } from "@/types/auth";

export function login(payload: LoginPayload) {
  return apiRequest<ApiResponse<TokenPair>>({
    method: "POST",
    url: "/auth/login",
    data: payload
  });
}

export function register(payload: RegisterPayload) {
  return apiRequest<ApiResponse<TokenPair>>({
    method: "POST",
    url: "/auth/register",
    data: payload
  });
}

export function getCurrentUser() {
  return apiRequest<ApiResponse<AuthUser>>({
    method: "GET",
    url: "/auth/me"
  });
}

export function logout() {
  return apiRequest<ApiResponse<{ detail: string }>>({
    method: "POST",
    url: "/auth/logout"
  });
}
