import { createContext } from "react";

import type { AuthSession, LoginPayload, RegisterPayload } from "@/types/auth";

export interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
