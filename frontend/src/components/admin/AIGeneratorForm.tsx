import { Sparkles } from "lucide-react";

import { EmptyState } from "./EmptyState";

export function AIGeneratorForm() {
  return (
    <section className="rounded-admin border border-admin-border bg-white p-6 shadow-admin dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-admin bg-admin-gold text-white">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold">Product Description Generator</h2>
          <p className="text-sm text-admin-muted dark:text-slate-400">
            Use the AI Tools page for the connected generator workflow.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <EmptyState title="No generator data available" />
      </div>
    </section>
  );
}
