import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-admin border border-dashed border-admin-border bg-white p-8 text-center shadow-admin-soft dark:border-slate-700 dark:bg-slate-900">
      <div className="flex h-12 w-12 items-center justify-center rounded-admin bg-admin-cream text-sm font-semibold text-admin-gold dark:bg-slate-800 dark:text-slate-300">
        <Inbox className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-base font-semibold">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
      ) : null}
    </div>
  );
}
