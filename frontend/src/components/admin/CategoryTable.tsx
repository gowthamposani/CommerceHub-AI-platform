import { Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import type { Category } from "../../services/admin.service";

type CategoryTableProps = {
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
};

export function CategoryTable({ categories, onCategoriesChange }: CategoryTableProps) {
  const [query, setQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return categories;
    }
    return categories.filter((category) =>
      [category.name, category.description].some((value) => value.toLowerCase().includes(search)),
    );
  }, [categories, query]);

  function handleCreateCategory() {
    const name = draftName.trim();
    if (!name) {
      setToast("Error toast placeholder: category name is required.");
      return;
    }

    onCategoriesChange([
      {
        id: crypto.randomUUID(),
        name,
        description: "Mock category awaiting merchandising details.",
        isActive: true,
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...categories,
    ]);
    setDraftName("");
    setIsDialogOpen(false);
    setToast("Success toast placeholder: category created.");
  }

  return (
    <section className="space-y-4">
      {toast ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          {toast}
        </div>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Category Management</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Maintain catalog taxonomy and category availability.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <span className="sr-only">Search categories</span>
              <input
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600 dark:focus:ring-slate-800 sm:w-72"
                placeholder="Search categories"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              type="button"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Category
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-slate-50 dark:hover:bg-slate-950">
                  <td className="whitespace-nowrap px-5 py-4 font-medium">{category.name}</td>
                  <td className="min-w-72 px-5 py-4 text-slate-600 dark:text-slate-300">
                    {category.description}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300">
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-500 dark:text-slate-400">
                    {category.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Create Category</h3>
              <button
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                type="button"
                aria-label="Close dialog"
                onClick={() => setIsDialogOpen(false)}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <label className="mt-5 block">
              <span className="text-sm font-medium">Category name</span>
              <input
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
              />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-800"
                type="button"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-950"
                type="button"
                onClick={handleCreateCategory}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
