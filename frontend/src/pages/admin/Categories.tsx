import { useEffect, useState } from "react";

import { CategoryTable } from "../../components/admin/CategoryTable";
import { EmptyState } from "../../components/admin/EmptyState";
import { LoadingSkeleton } from "../../components/admin/LoadingSkeleton";
import { Sidebar } from "../../components/admin/Sidebar";
import { TopNavbar } from "../../components/admin/TopNavbar";
import { getCategories, type Category } from "../../services/admin.service";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="lg:pl-72">
        <TopNavbar title="Categories" subtitle="Manage marketplace taxonomy" />
        <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {isLoading ? (
            <LoadingSkeleton rows={7} />
          ) : categories.length ? (
            <CategoryTable categories={categories} onCategoriesChange={setCategories} />
          ) : (
            <EmptyState
              title="No categories found"
              description="Create categories to organize catalog discovery."
            />
          )}
        </main>
      </div>
    </div>
  );
}
