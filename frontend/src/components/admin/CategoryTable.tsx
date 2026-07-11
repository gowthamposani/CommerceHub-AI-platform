import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { Category } from "../../services/admin.service";

type CategoryTableProps = {
  categories: Category[];
};

export function CategoryTable({ categories }: CategoryTableProps) {
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return categories;
    }
    return categories.filter((category) =>
      [category.name, category.description].some((value) => value.toLowerCase().includes(search))
    );
  }, [categories, query]);

  return (
    <section className="space-y-4">
      <div className="rounded-admin border border-admin-border bg-white shadow-admin dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Category Management</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Maintain catalog taxonomy and category availability.
            </p>
          </div>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <span className="sr-only">Search categories</span>
            <input
              className="h-10 w-full rounded-admin border border-admin-border bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-admin-gold focus:ring-2 focus:ring-admin-gold/20 dark:border-slate-800 dark:bg-slate-950 sm:w-72"
              placeholder="Search categories"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
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
                  <td className="min-w-72 px-5 py-4 text-slate-600 dark:text-slate-300">{category.description}</td>
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
    </section>
  );
}
