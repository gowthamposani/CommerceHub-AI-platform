import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

import { ToastViewport } from "../components/admin/ToastViewport";
import { AdminSidebar } from "../components/layout/AdminSidebar";
import { AdminTopNavigation } from "../components/layout/AdminTopNavigation";
import { AppFooter } from "../components/layout/AppFooter";

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-admin-background text-admin-ink dark:bg-slate-950 dark:text-slate-100">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex min-h-screen flex-col lg:pl-72">
        <AdminTopNavigation onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <AppFooter />
      </div>
      <ToastViewport />
    </div>
  );
}
