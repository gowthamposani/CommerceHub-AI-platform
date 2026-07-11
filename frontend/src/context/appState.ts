import { createContext } from "react";

interface UserPlaceholder {
  id: string | null;
  displayName: string;
  role: "anonymous";
}

interface NotificationPlaceholder {
  unreadCount: number;
}

export interface AppStateContextValue {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
  user: UserPlaceholder;
  notifications: NotificationPlaceholder;
}

export const AppStateContext = createContext<AppStateContextValue | null>(null);
