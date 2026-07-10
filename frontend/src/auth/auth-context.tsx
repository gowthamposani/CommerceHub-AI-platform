import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { authStorage } from "./auth-storage";
import { login as loginApi, logout as logoutApi, refreshAuthSession, registerCustomer } from "./auth-api";
import type { AuthLoginPayload, AuthRegistrationPayload, AuthSession, AuthUser } from "../types/domain";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  session: AuthSession | null;
  user: AuthUser | null;
  rememberMe: boolean;
  status: AuthStatus;
  isReady: boolean;
  isAuthenticated: boolean;
  register: (payload: AuthRegistrationPayload) => Promise<AuthUser>;
  login: (payload: AuthLoginPayload, rememberMe?: boolean) => Promise<AuthSession>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<AuthUser>) => void;
  replaceSession: (session: AuthSession, rememberMe?: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const syncFromStorage = useCallback((): void => {
    const storedSession = authStorage.getSession();
    const storedRememberMe = authStorage.getRememberMe();

    if (!storedSession) {
      setSession(null);
      setRememberMe(false);
      setStatus("unauthenticated");
      return;
    }

    setSession(storedSession);
    setRememberMe(storedRememberMe);
    setStatus("authenticated");
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async (): Promise<void> => {
      const storedSession = authStorage.getSession();
      const storedRememberMe = authStorage.getRememberMe();

      if (!storedSession) {
        if (!cancelled) {
          syncFromStorage();
        }
        return;
      }

      if (authStorage.isRefreshTokenExpired(storedSession)) {
        authStorage.clearSession();
        return;
      }

      if (authStorage.isAccessTokenExpired(storedSession)) {
        try {
          const refreshed = await refreshAuthSession(storedSession.tokens.refresh_token);
          authStorage.saveSession(refreshed, storedRememberMe);
          return;
        } catch {
          authStorage.clearSession();
          return;
        }
      }

      if (!cancelled) {
        syncFromStorage();
      }
    };

    const unsubscribe = authStorage.subscribe(() => {
      if (!cancelled) {
        syncFromStorage();
      }
    });

    void bootstrap();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [syncFromStorage]);

  const replaceSession = useCallback(
    (nextSession: AuthSession, nextRememberMe = rememberMe): void => {
      authStorage.saveSession(nextSession, nextRememberMe);
      setSession(nextSession);
      setRememberMe(nextRememberMe);
      setStatus("authenticated");
    },
    [rememberMe]
  );

  const register = useCallback(async (payload: AuthRegistrationPayload): Promise<AuthUser> => {
    return registerCustomer(payload);
  }, []);

  const login = useCallback(
    async (payload: AuthLoginPayload, nextRememberMe = false): Promise<AuthSession> => {
      const nextSession = await loginApi(payload);
      replaceSession(nextSession, nextRememberMe);
      return nextSession;
    },
    [replaceSession]
  );

  const logout = useCallback(async (): Promise<void> => {
    const refreshToken = session?.tokens.refresh_token ?? authStorage.getSession()?.tokens.refresh_token;
    try {
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    } finally {
      authStorage.clearSession();
      setSession(null);
      setRememberMe(false);
      setStatus("unauthenticated");
    }
  }, [session]);

  const updateUser = useCallback(
    (patch: Partial<AuthUser>): void => {
      if (!session) {
        return;
      }

      const nextSession: AuthSession = {
        ...session,
        user: {
          ...session.user,
          ...patch
        }
      };

      replaceSession(nextSession, rememberMe);
    },
    [rememberMe, replaceSession, session]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      rememberMe,
      status,
      isReady: status !== "loading",
      isAuthenticated: status === "authenticated",
      register,
      login,
      logout,
      updateUser,
      replaceSession
    }),
    [login, logout, rememberMe, register, replaceSession, session, status, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
