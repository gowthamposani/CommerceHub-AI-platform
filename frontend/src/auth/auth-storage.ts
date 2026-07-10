import { authStorageKeys } from "../config";
import type { AuthSession } from "../types/domain";

const canUseBrowserStorage = (): boolean => typeof window !== "undefined";
const AUTH_STORAGE_EVENT = "commercehub:auth-storage-changed";

const parseSession = (value: string | null): AuthSession | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthSession;
  } catch {
    return null;
  }
};

const isExpired = (value: string | null | undefined): boolean => {
  if (!value) {
    return true;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) || timestamp <= Date.now();
};

const emitAuthStorageChange = (): void => {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
};

export const authStorage = {
  getSession(): AuthSession | null {
    if (!canUseBrowserStorage()) {
      return null;
    }

    return (
      parseSession(window.sessionStorage.getItem(authStorageKeys.session)) ??
      parseSession(window.localStorage.getItem(authStorageKeys.session))
    );
  },

  getRememberMe(): boolean {
    if (!canUseBrowserStorage()) {
      return false;
    }

    const remembered = window.localStorage.getItem(authStorageKeys.rememberMe);
    if (remembered !== null) {
      return remembered === "true";
    }

    return window.localStorage.getItem(authStorageKeys.session) !== null;
  },

  saveSession(session: AuthSession, rememberMe: boolean): void {
    if (!canUseBrowserStorage()) {
      return;
    }

    window.sessionStorage.removeItem(authStorageKeys.session);
    window.localStorage.removeItem(authStorageKeys.session);

    const targetStorage = rememberMe ? window.localStorage : window.sessionStorage;
    targetStorage.setItem(authStorageKeys.session, JSON.stringify(session));
    window.localStorage.setItem(authStorageKeys.rememberMe, rememberMe ? "true" : "false");
    emitAuthStorageChange();
  },

  clearSession(): void {
    if (!canUseBrowserStorage()) {
      return;
    }

    window.sessionStorage.removeItem(authStorageKeys.session);
    window.localStorage.removeItem(authStorageKeys.session);
    window.localStorage.removeItem(authStorageKeys.rememberMe);
    emitAuthStorageChange();
  },

  getAccessToken(): string | null {
    return this.getSession()?.tokens.access_token ?? null;
  },

  isAccessTokenExpired(session: AuthSession | null | undefined): boolean {
    return isExpired(session?.tokens.access_token_expires_at);
  },

  isRefreshTokenExpired(session: AuthSession | null | undefined): boolean {
    return isExpired(session?.tokens.refresh_token_expires_at);
  },

  subscribe(listener: () => void): () => void {
    if (!canUseBrowserStorage()) {
      return () => undefined;
    }

    const handleStorage = (event: StorageEvent): void => {
      if (event.key === null || event.key === authStorageKeys.session || event.key === authStorageKeys.rememberMe) {
        listener();
      }
    };

    const handleCustomEvent = (): void => {
      listener();
    };

    window.addEventListener(AUTH_STORAGE_EVENT, handleCustomEvent);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(AUTH_STORAGE_EVENT, handleCustomEvent);
      window.removeEventListener("storage", handleStorage);
    };
  }
};
