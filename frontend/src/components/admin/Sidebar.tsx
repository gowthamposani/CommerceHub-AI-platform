type NavigationItem = {
  label: string;
  href: string;
  symbol: string;
};

const navigationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", symbol: "D" },
  { label: "Users", href: "/admin/users", symbol: "U" },
  { label: "Categories", href: "/admin/categories", symbol: "C" },
  { label: "Analytics", href: "/admin/analytics", symbol: "A" },
  { label: "AI Generator", href: "/admin/ai-product-generator", symbol: "AI" },
];

type SidebarProps = {
  activePath?: string;
};

export function Sidebar({ activePath = "/admin/dashboard" }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-950 lg:block">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
          CH
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-wide">CommerceHub AI</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Admin Console</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1" aria-label="Admin navigation">
        {navigationItems.map((item) => {
          const isActive = activePath === item.href;

          return (
            <a
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
                  isActive
                    ? "bg-white/15 text-white dark:bg-slate-950/10 dark:text-slate-950"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300",
                ].join(" ")}
                aria-hidden="true"
              >
                {item.symbol}
              </span>
              {item.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
