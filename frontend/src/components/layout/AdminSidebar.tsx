import { NavLink } from "react-router-dom";

type AdminNavigationItem = {
  label: string;
  path: string;
  symbol: string;
};

const adminNavigationItems: AdminNavigationItem[] = [
  { label: "Dashboard", path: "/admin/dashboard", symbol: "D" },
  { label: "Users", path: "/admin/users", symbol: "U" },
  { label: "Products", path: "/admin/products", symbol: "P" },
  { label: "Orders", path: "/admin/orders", symbol: "O" },
  { label: "Analytics", path: "/admin/analytics", symbol: "A" },
  { label: "Notifications", path: "/admin/notifications", symbol: "N" },
  { label: "AI Tools", path: "/admin/ai-tools", symbol: "AI" },
  { label: "Settings", path: "/admin/settings", symbol: "S" },
];

export function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-950 lg:block">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
          CH
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-wide">CommerceHub AI</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Admin Workspace</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1" aria-label="Admin navigation">
        {adminNavigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white",
              ].join(" ")
            }
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              {item.symbol}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-5 left-4 right-4">
        <NavLink
          to="/auth/logout"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-red-50 text-xs font-semibold text-red-600 dark:bg-red-950 dark:text-red-300">
            L
          </span>
          Logout
        </NavLink>
      </div>
    </aside>
  );
}
