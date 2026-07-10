import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            CommerceHub AI
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Secure Workspace</h1>
        </div>
        <Outlet />
      </section>
    </main>
  );
}
