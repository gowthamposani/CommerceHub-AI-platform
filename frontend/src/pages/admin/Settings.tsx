import { EmptyState } from "../../components/admin/EmptyState";

const preferences = [
  "Compact tables",
  "Operational alerts",
  "Dark mode ready",
  "AI confidence notes",
];

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="mt-1 text-sm text-admin-muted dark:text-slate-400">
          Admin profile, theme preferences, and system information.
        </p>
      </div>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-admin border border-admin-border bg-white p-5 shadow-admin dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-base font-semibold">Profile</h3>
          <div className="mt-5">
            <EmptyState
              title="No profile data available"
              description="Profile details will appear after the authentication module is connected."
            />
          </div>
        </article>

        <article className="rounded-admin border border-admin-border bg-white p-5 shadow-admin dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-base font-semibold">Theme</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {["System", "Light", "Dark", "High Contrast"].map((theme) => (
              <button
                key={theme}
                className="rounded-admin border border-admin-border px-4 py-3 text-left text-sm hover:bg-admin-cream dark:border-slate-800 dark:hover:bg-slate-950"
                type="button"
              >
                {theme}
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-admin border border-admin-border bg-white p-5 shadow-admin dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-base font-semibold">Preferences</h3>
          <div className="mt-5 space-y-3">
            {preferences.map((preference) => (
              <label key={preference} className="flex items-center justify-between gap-4">
                <span className="text-sm">{preference}</span>
                <input className="h-4 w-4 accent-admin-gold" type="checkbox" />
              </label>
            ))}
          </div>
        </article>

        <article className="rounded-admin border border-admin-border bg-white p-5 shadow-admin dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-base font-semibold">System Information</h3>
          <div className="mt-5">
            <EmptyState
              title="No system data available"
              description="System details will appear when the Admin settings API is available."
            />
          </div>
        </article>
      </section>
    </div>
  );
}
