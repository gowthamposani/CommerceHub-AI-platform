import { BarChart3, Boxes, LayoutDashboard, Sparkles, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

const navigationItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Categories", href: "/admin/categories", icon: Boxes },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "AI Generator", href: "/admin/ai-product-generator", icon: Sparkles },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-950 lg:block">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
          CH
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide">CommerceHub AI</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Admin Console</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1" aria-label="Admin navigation">
        {navigationItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white",
              ].join(" ")
            }
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
