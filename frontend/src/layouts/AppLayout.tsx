import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAppState } from "@/hooks/useAppState";

export function AppLayout() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppState();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="page-shell flex">
      {mobileOpen ? (
        <button
          className="fixed inset-0 z-30 bg-gray-950/30 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <Sidebar collapsed={sidebarCollapsed} mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Navbar
          collapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onToggleMobile={() => setMobileOpen((value) => !value)}
        />
        <main className="flex-1 px-4 py-6 lg:px-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
