import type { ReactNode } from "react";

import { GlobalLoadingOverlay } from "@/components/common/GlobalLoadingOverlay";
import { AppStateProvider } from "@/context/AppStateContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppStateProvider>
          <QueryProvider>
            {children}
            <GlobalLoadingOverlay />
            <ToastProvider />
          </QueryProvider>
        </AppStateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
