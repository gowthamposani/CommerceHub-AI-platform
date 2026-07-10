import type { APIRequestContext, Browser, BrowserContext } from "@playwright/test";

import { ApiClientUtility } from "../../utils/api-client.utility";
import { StorageUtility } from "../../utils/storage.utility";
import { e2eConfig, type E2EConfig } from "../../config/e2e-config";
import type { AuthSession, AuthRefreshPayload, BrowserStorageState } from "../../types/auth.types";

export class SessionPage extends ApiClientUtility {
  private readonly storageUtility: StorageUtility;

  constructor(
    request: APIRequestContext,
    private readonly browser: Browser,
    config: E2EConfig = e2eConfig
  ) {
    super(request, config);
    this.storageUtility = new StorageUtility(config);
  }

  refresh(refreshToken: string) {
    const payload: AuthRefreshPayload = { refresh_token: refreshToken };
    return this.post("/auth/refresh", payload);
  }

  logout(refreshToken: string) {
    const payload: AuthRefreshPayload = { refresh_token: refreshToken };
    return this.post("/auth/logout", payload);
  }

  buildRememberedStorageState(session: AuthSession, rememberMe = true): BrowserStorageState {
    return this.storageUtility.buildRememberedStorageState(session, rememberMe);
  }

  extractRememberedSession(storageState: BrowserStorageState): AuthSession | null {
    return this.storageUtility.extractSession(storageState);
  }

  extractRememberMe(storageState: BrowserStorageState): boolean {
    return this.storageUtility.extractRememberMe(storageState);
  }

  async createRememberedContext(session: AuthSession, rememberMe = true): Promise<BrowserContext> {
    const storageState = this.buildRememberedStorageState(session, rememberMe);
    return this.browser.newContext({ storageState });
  }
}
