import { useMemo, useState, type ReactNode } from "react";

import { AppStateContext, type AppStateContextValue } from "@/context/appState";

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);

  const value = useMemo<AppStateContextValue>(
    () => ({
      sidebarCollapsed,
      setSidebarCollapsed,
      globalLoading,
      setGlobalLoading,
      user: { id: null, displayName: "CommerceHub User", role: "anonymous" },
      notifications: { unreadCount: 0 }
    }),
    [globalLoading, sidebarCollapsed]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
