import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AdminErrorBoundary } from "../components/admin/AdminErrorBoundary";
import { LoadingSkeleton } from "../components/admin/LoadingSkeleton";
import { AdminLayout } from "../layouts/AdminLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { MainLayout } from "../layouts/MainLayout";

const AIProductGenerator = lazy(() => import("../pages/admin/AIProductGenerator"));
const Analytics = lazy(() => import("../pages/admin/Analytics"));
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const Notifications = lazy(() => import("../pages/admin/Notifications"));
const Settings = lazy(() => import("../pages/admin/Settings"));
const Users = lazy(() => import("../pages/admin/Users"));

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
      {description ? <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
    </section>
  );
}

function FrontendInitializedPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
      <div className="w-full rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">CommerceHub AI</p>
        <h1 className="mt-3 text-3xl font-semibold">CommerceHub AI - Frontend Initialized</h1>
      </div>
    </section>
  );
}

function AdminPageShell({ children }: { children: ReactNode }) {
  return (
    <AdminErrorBoundary>
      <Suspense fallback={<LoadingSkeleton rows={6} />}>{children}</Suspense>
    </AdminErrorBoundary>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<FrontendInitializedPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<PlaceholderPage title="Authentication Placeholder" />} />
        <Route path="/auth/logout" element={<PlaceholderPage title="Logout Placeholder" />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminPageShell>
              <Dashboard />
            </AdminPageShell>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminPageShell>
              <Users />
            </AdminPageShell>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <AdminPageShell>
              <Analytics />
            </AdminPageShell>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <AdminPageShell>
              <Notifications />
            </AdminPageShell>
          }
        />
        <Route
          path="/admin/ai-tools"
          element={
            <AdminPageShell>
              <AIProductGenerator />
            </AdminPageShell>
          }
        />
        <Route path="/admin/ai-product-generator" element={<Navigate to="/admin/ai-tools" replace />} />
        <Route
          path="/admin/settings"
          element={
            <AdminPageShell>
              <Settings />
            </AdminPageShell>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
