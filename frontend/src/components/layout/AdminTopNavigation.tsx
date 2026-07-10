import { Bell, Menu, Moon, Search, UserCircle } from "lucide-react";

type AdminTopNavigationProps = {
  onOpenSidebar?: () => void;
};

export function AdminTopNavigation({ onOpenSidebar }: AdminTopNavigationProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-admin-border bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-admin border border-admin-border bg-white text-admin-muted transition hover:bg-admin-cream hover:text-admin-ink focus:outline-none focus:ring-2 focus:ring-admin-gold/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 lg:hidden"
            type="button"
            aria-label="Open admin navigation"
            onClick={onOpenSidebar}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div>
            <p className="text-sm font-medium text-admin-muted dark:text-slate-400">
              Admin Console
            </p>
            <h1 className="mt-1 text-xl font-semibold text-admin-ink dark:text-white">
              Enterprise Workspace
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted" />
            <span className="sr-only">Search admin workspace</span>
            <input
              className="h-11 w-full rounded-admin border border-admin-border bg-admin-background pl-10 pr-3 text-sm outline-none transition placeholder:text-admin-muted focus:border-admin-gold focus:ring-2 focus:ring-admin-gold/20 dark:border-slate-800 dark:bg-slate-900 sm:w-80"
              placeholder="Search workspace"
              type="search"
            />
          </label>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-admin border border-admin-border bg-white text-admin-muted transition hover:bg-admin-cream hover:text-admin-ink focus:outline-none focus:ring-2 focus:ring-admin-gold/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              type="button"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-admin border border-admin-border bg-white text-admin-muted transition hover:bg-admin-cream hover:text-admin-ink focus:outline-none focus:ring-2 focus:ring-admin-gold/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              type="button"
              aria-label="Theme toggle"
            >
              <Moon className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="hidden items-center gap-2 rounded-admin border border-admin-border bg-white px-3 py-2 text-sm font-medium text-admin-ink dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 sm:flex">
              <UserCircle className="h-5 w-5 text-admin-gold" aria-hidden="true" />
              Account
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
