import { expect } from "@playwright/test";

import type {
  ApiResponse,
  AuthSession,
  AuthTokenPair,
  AuthUser,
  BrowserStorageState,
  RegistrationRole,
  UserStatus
} from "../types/auth.types";
import { StorageUtility } from "./storage.utility";

export interface ExpectedUserShape {
  first_name: string;
  last_name: string;
  email: string;
  role: RegistrationRole | "admin";
  status: UserStatus;
}

export class AuthAssertions {
  static expectSuccessEnvelope<T>(body: ApiResponse<T>, expectedMessage: string): void {
    expect(body.success).toBe(true);
    expect(body.message).toBe(expectedMessage);
    expect(body.data).toBeDefined();
  }

  static expectErrorEnvelope(body: ApiResponse<unknown>, expectedMessage: string): void {
    expect(body.success).toBe(false);
    expect(body.message).toBe(expectedMessage);
  }

  static expectTokenPair(tokens: AuthTokenPair): void {
    expect(tokens.access_token).toBeTruthy();
    expect(tokens.refresh_token).toBeTruthy();
    expect(tokens.token_type).toBe("bearer");
    expect(tokens.access_token_expires_at).toBeTruthy();
    expect(tokens.refresh_token_expires_at).toBeTruthy();
  }

  static expectUser(user: AuthUser, expected: ExpectedUserShape): void {
    expect(user.first_name).toBe(expected.first_name);
    expect(user.last_name).toBe(expected.last_name);
    expect(user.full_name).toBe(`${expected.first_name} ${expected.last_name}`);
    expect(user.email).toBe(expected.email);
    expect(user.role.name).toBe(expected.role);
    expect(user.status).toBe(expected.status);
    expect(user.id).toBeTruthy();
    expect(user.created_at).toBeTruthy();
    expect(user.updated_at).toBeTruthy();
  }

  static expectSession(session: AuthSession, expected: ExpectedUserShape): void {
    this.expectUser(session.user, expected);
    this.expectTokenPair(session.tokens);
  }

  static expectRememberedSession(
    storageState: BrowserStorageState,
    expectedSession: AuthSession,
    expectedRememberMe = true
  ): void {
    const storageUtility = new StorageUtility();
    const storedSession = storageUtility.extractSession(storageState);

    expect(storageUtility.extractRememberMe(storageState)).toBe(expectedRememberMe);
    expect(storedSession).not.toBeNull();
    if (storedSession) {
      expect(storedSession.user.email).toBe(expectedSession.user.email);
      expect(storedSession.user.id).toBe(expectedSession.user.id);
      expect(storedSession.tokens.access_token).toBe(expectedSession.tokens.access_token);
      expect(storedSession.tokens.refresh_token).toBe(expectedSession.tokens.refresh_token);
    }
  }

  static expectUnauthorizedEnvelope(body: ApiResponse<unknown>, expectedMessage = "Not authenticated"): void {
    this.expectErrorEnvelope(body, expectedMessage);
  }
}
