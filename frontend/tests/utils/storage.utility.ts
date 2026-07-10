import type { AuthSession, BrowserStorageState } from "../types/auth.types";
import { e2eConfig, type E2EConfig } from "../config/e2e-config";

export class StorageUtility {
  constructor(private readonly config: E2EConfig = e2eConfig) {}

  buildRememberedStorageState(session: AuthSession, rememberMe = true): BrowserStorageState {
    return {
      cookies: [],
      origins: [
        {
          origin: this.config.appBaseUrl,
          localStorage: [
            {
              name: this.config.storageKeys.session,
              value: JSON.stringify(session)
            },
            {
              name: this.config.storageKeys.rememberMe,
              value: rememberMe ? "true" : "false"
            }
          ]
        }
      ]
    };
  }

  extractSession(storageState: BrowserStorageState): AuthSession | null {
    const originState = storageState.origins.find((origin) => origin.origin === this.config.appBaseUrl);
    if (!originState) {
      return null;
    }

    const sessionItem = originState.localStorage.find((item) => item.name === this.config.storageKeys.session);
    if (!sessionItem) {
      return null;
    }

    return JSON.parse(sessionItem.value) as AuthSession;
  }

  extractRememberMe(storageState: BrowserStorageState): boolean {
    const originState = storageState.origins.find((origin) => origin.origin === this.config.appBaseUrl);
    const rememberItem = originState?.localStorage.find((item) => item.name === this.config.storageKeys.rememberMe);
    return rememberItem?.value === "true";
  }
}
