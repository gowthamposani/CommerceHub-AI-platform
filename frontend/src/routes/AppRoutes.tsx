import { Navigate, Route, Routes } from "react-router-dom";

import { AdminLayout } from "../layouts/AdminLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { MainLayout } from "../layouts/MainLayout";

type PlaceholderPageProps = {
  title: string;
  description?: string;
};

function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Placeholder Route
      </p>
      <h2 className="mt-3 text-2xl font-semibold">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      ) : null}
    </section>
  );
}

function FrontendInitializedPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
      <div className="w-full rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          CommerceHub AI
        </p>
        <h1 className="mt-3 text-3xl font-semibold">
          CommerceHub AI - Frontend Initialized
        </h1>
      </div>
    </section>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<FrontendInitializedPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route
          path="/auth/login"
          element={<PlaceholderPage title="Authentication Placeholder" />}
        />
        <Route
          path="/auth/logout"
          element={<PlaceholderPage title="Logout Placeholder" />}
        />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="/admin/dashboard"
          element={<PlaceholderPage title="Admin Dashboard" />}
        />
        <Route path="/admin/users" element={<PlaceholderPage title="Users" />} />
        <Route path="/admin/products" element={<PlaceholderPage title="Products" />} />
        <Route path="/admin/orders" element={<PlaceholderPage title="Orders" />} />
        <Route path="/admin/analytics" element={<PlaceholderPage title="Analytics" />} />
        <Route
          path="/admin/notifications"
          element={<PlaceholderPage title="Notifications" />}
        />
        <Route path="/admin/ai-tools" element={<PlaceholderPage title="AI Tools" />} />
        <Route path="/admin/settings" element={<PlaceholderPage title="Settings" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
