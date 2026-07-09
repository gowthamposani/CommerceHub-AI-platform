import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bell,
  Bot,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
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

export function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-admin-border bg-white/95 px-4 py-5 shadow-admin-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:block">
      <div className="flex items-center gap-3 px-2">
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

      <nav className="mt-8 space-y-2" aria-label="Admin navigation">
        {adminNavigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-admin px-3 py-3 text-sm font-medium transition duration-200",
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
          className="flex items-center gap-3 rounded-admin px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </NavLink>
      </div>
    </aside>
  );
}
