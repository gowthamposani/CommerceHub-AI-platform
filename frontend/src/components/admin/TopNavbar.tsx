type TopNavbarProps = {
  title: string;
  subtitle: string;
};

export function TopNavbar({ title, subtitle }: TopNavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-slate-950 dark:text-white">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              Search
            </span>
            <span className="sr-only">Search admin workspace</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-16 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:focus:border-slate-600 dark:focus:ring-slate-800 sm:w-72"
              placeholder="Orders, sellers, users"
              type="search"
            />
          </label>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              type="button"
              aria-label="Toggle dark mode"
            >
              Mode
            </button>
            <button
              className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              type="button"
              aria-label="Open notifications"
            >
              Alerts
            </button>
            <div className="hidden items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 sm:flex">
              Admin
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
