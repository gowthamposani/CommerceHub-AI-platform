export type RegistrationRole = "customer" | "seller";
export type RoleName = "customer" | "seller" | "admin";
export type UserStatus = "active" | "pending_approval" | "inactive" | "suspended";

export interface AuthRegistrationPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: RegistrationRole;
}

export interface AuthLoginPayload {
  email: string;
  password: string;
}

export interface AuthRefreshPayload {
  refresh_token: string;
}

export interface AuthRole {
  id: string;
  name: RoleName;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  role: AuthRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface AuthTokenPair {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  access_token_expires_at: string;
  refresh_token_expires_at: string;
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokenPair;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BrowserStorageItem {
  name: string;
  value: string;
}

export interface BrowserStorageOrigin {
  origin: string;
  localStorage: BrowserStorageItem[];
}

export interface BrowserStorageCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "Lax" | "None" | "Strict";
}

export interface BrowserStorageState {
  cookies: BrowserStorageCookie[];
  origins: BrowserStorageOrigin[];
}

export interface AuthTestData {
  customer: AuthRegistrationPayload;
  seller: AuthRegistrationPayload;
  validLogin: AuthLoginPayload;
  invalidLogin: AuthLoginPayload;
}
