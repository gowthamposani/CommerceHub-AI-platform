import { useCallback, useMemo, useState, type ReactNode } from "react";

import { AUTH_SESSION_STORAGE_KEY } from "@/constants/auth";
import { AuthContext, type AuthContextValue } from "@/context/auth";
import * as authService from "@/services/authService";
import type { AuthSession, LoginPayload, RegisterPayload } from "@/types/auth";
import { getStorageItem, removeStorageItem, setStorageItem } from "@/utils/storage";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() =>
    getStorageItem<AuthSession | null>(AUTH_SESSION_STORAGE_KEY, null)
  );

  const persistSession = useCallback((nextSession: AuthSession | null) => {
    setSession(nextSession);
    if (nextSession) {
      setStorageItem(AUTH_SESSION_STORAGE_KEY, nextSession);
    } else {
      removeStorageItem(AUTH_SESSION_STORAGE_KEY);
    }
  }, []);

  const handleLogin = useCallback(
    async (payload: LoginPayload) => {
      const response = await authService.login(payload);
      persistSession({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        user: response.user
      });
    },
    [persistSession]
  );

  const handleRegister = useCallback(
    async (payload: RegisterPayload) => {
      await authService.register(payload);
      await handleLogin({
        email: payload.email,
        password: payload.password,
        remember_me: true
      });
    },
    [handleLogin]
  );

  const handleLogout = useCallback(async () => {
    try {
      if (session) {
        await authService.logout();
      }
    } finally {
      persistSession(null);
    }
  }, [persistSession, session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout
    }),
    [handleLogin, handleLogout, handleRegister, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
