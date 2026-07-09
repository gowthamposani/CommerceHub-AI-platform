export function AdminTopNavigation() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Admin Console</p>
          <h1 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
            Enterprise Workspace
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block">
            <span className="sr-only">Search admin workspace</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:focus:border-slate-600 dark:focus:ring-slate-800 sm:w-72"
              placeholder="Search workspace"
              type="search"
            />
          </label>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              type="button"
            >
              Notifications
            </button>
            <button
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              type="button"
            >
              Theme
            </button>
            <div className="hidden rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-800 dark:text-slate-200 sm:block">
              Admin User
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
