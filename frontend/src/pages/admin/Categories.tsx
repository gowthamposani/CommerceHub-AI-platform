import { CategoryTable } from "../../components/admin/CategoryTable";
import { EmptyState } from "../../components/admin/EmptyState";
import { LoadingSkeleton } from "../../components/admin/LoadingSkeleton";
import { useCategories } from "../../hooks/useCategories";

export default function Categories() {
  const { data: categories, error, loading } = useCategories();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Categories</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage marketplace taxonomy
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton rows={7} />
      ) : error ? (
        <EmptyState title="Categories unavailable" description={error} />
      ) : categories.length > 0 ? (
        <CategoryTable categories={categories} />
      ) : (
        <EmptyState title="No categories available" />
      )}
    </div>
  );
}
