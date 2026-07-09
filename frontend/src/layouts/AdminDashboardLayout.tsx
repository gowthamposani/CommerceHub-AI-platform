import type { ReactNode } from "react";

import { Sidebar } from "../components/admin/Sidebar";
import { TopNavbar } from "../components/admin/TopNavbar";

type AdminDashboardLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
};

export function AdminDashboardLayout({
  children,
  title,
  subtitle,
}: AdminDashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="lg:pl-72">
        <TopNavbar title={title} subtitle={subtitle} />
        <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
