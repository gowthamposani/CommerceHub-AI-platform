import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bell,
  Bot,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  X,
} from "lucide-react";

type AdminNavigationItem = {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
};

const adminNavigationItems: AdminNavigationItem[] = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { label: "Notifications", path: "/admin/notifications", icon: Bell },
  { label: "AI Tools", path: "/admin/ai-tools", icon: Bot },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

type AdminSidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  return (
    <>
      {isOpen ? (
        <button
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
          type="button"
          aria-label="Close admin navigation overlay"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-admin-border bg-white/95 px-4 py-5 shadow-admin-soft backdrop-blur transition-transform duration-200 dark:border-slate-800 dark:bg-slate-950/95 lg:z-40 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
        aria-label="Admin sidebar navigation"
      >
        <div className="flex items-center justify-between gap-3 px-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-admin bg-admin-gold text-sm font-semibold text-white shadow-admin-soft">
              CH
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-wide text-admin-ink dark:text-white">
                CommerceHub AI
              </p>
              <p className="text-xs text-admin-muted dark:text-slate-400">Admin Workspace</p>
            </div>
          </div>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-admin border border-admin-border text-admin-muted transition hover:bg-admin-cream hover:text-admin-ink focus:outline-none focus:ring-2 focus:ring-admin-gold/30 dark:border-slate-800 dark:hover:bg-slate-900 lg:hidden"
            type="button"
            aria-label="Close admin navigation"
            onClick={onClose}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <nav className="mt-8 space-y-2" aria-label="Admin navigation">
          {adminNavigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-admin px-3 py-3 text-sm font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-admin-gold/30",
                    isActive
                      ? "bg-admin-gold text-white shadow-admin-soft"
                      : "text-admin-muted hover:bg-admin-cream hover:text-admin-ink dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white",
                  ].join(" ")
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4">
          <NavLink
            to="/auth/logout"
            onClick={onClose}
            className="flex items-center gap-3 rounded-admin px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 dark:text-red-300 dark:hover:bg-red-950"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </NavLink>
        </div>
      </aside>
    </>
  );
}
