import { Outlet } from "react-router-dom";

import { AdminSidebar } from "../components/layout/AdminSidebar";
import { AdminTopNavigation } from "../components/layout/AdminTopNavigation";
import { AppFooter } from "../components/layout/AppFooter";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <AdminSidebar />
      <div className="flex min-h-screen flex-col lg:pl-72">
        <AdminTopNavigation />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
