import { NavLink } from "react-router-dom";

import { BrandMark } from "@/components/layout/BrandMark";
import { FOUNDATION_NAVIGATION } from "@/constants/app";
import { cn } from "@/utils/cn";

export function Sidebar({
  collapsed,
  mobileOpen,
  onNavigate
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onNavigate: () => void;
}) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-gray-200 bg-white transition lg:static",
        collapsed && "lg:w-20",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex h-16 items-center border-b border-gray-100 px-5">
        <BrandMark compact={collapsed} />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Primary navigation">
        {FOUNDATION_NAVIGATION.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.href}
              onClick={onNavigate}
              aria-disabled={item.disabled}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-600 transition",
                  isActive && !item.disabled && "bg-yellow-50 text-gray-950",
                  item.disabled ? "cursor-not-allowed opacity-45" : "hover:bg-gray-100 hover:text-gray-950"
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {!collapsed ? <span>{item.label}</span> : <span className="sr-only">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
