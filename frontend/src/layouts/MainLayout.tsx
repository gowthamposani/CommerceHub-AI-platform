import { Outlet } from "react-router-dom";

import { AppFooter } from "../components/layout/AppFooter";

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <a className="text-sm font-semibold tracking-wide" href="/">
            CommerceHub AI
          </a>
          <nav className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
            <a className="transition hover:text-slate-950 dark:hover:text-white" href="/admin/dashboard">
              Admin
            </a>
            <a className="transition hover:text-slate-950 dark:hover:text-white" href="/auth/login">
              Login
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
