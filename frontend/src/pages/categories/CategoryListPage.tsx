import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { FilterPanel } from "@/components/common/FilterPanel";
import { SearchBar } from "@/components/common/SearchBar";
import { PageLayout } from "@/components/layout/PageLayout";
import { ConfirmationDialog } from "@/components/modals/ConfirmationDialog";
import { CategoryTable } from "@/components/categories/CategoryTable";
import { CategoryTree } from "@/components/categories/CategoryTree";
import { flattenCategoryTree } from "@/components/categories/categoryTreeUtils";
import { Pagination } from "@/components/table/Pagination";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { CATEGORY_SORT_OPTIONS, CATEGORY_STATUS_OPTIONS } from "@/constants/category";
import { useSearch } from "@/hooks/useSearch";
import { queryKeys } from "@/lib/queryKeys";
import { notify } from "@/services/notificationService";
import {
  activateCategory,
  deactivateCategory,
  deleteCategory,
  getCategories,
  getCategoryTree
} from "@/services/categoryService";
import type { Category, CategoryStatus } from "@/types/category";

export default function CategoryListPage() {
  const queryClient = useQueryClient();
  const { search, setSearch, debouncedSearch } = useSearch();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState<CategoryStatus | "">("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [sortBy, setSortBy] = useState("display_order");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const params = {
    page,
    page_size: pageSize,
    search: debouncedSearch || undefined,
    parent_category_id: parentCategoryId || undefined,
    status: status || undefined,
    sort_by: sortBy,
    sort_direction: sortDirection
  };

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list(params),
    queryFn: () => getCategories(params)
  });

  const treeQuery = useQuery({
    queryKey: queryKeys.categories.tree,
    queryFn: getCategoryTree
  });

  const flatTree = useMemo(() => flattenCategoryTree(treeQuery.data?.data ?? []), [treeQuery.data?.data]);
  const parentNameById = useMemo(
    () => new Map(flatTree.map((category) => [category.id, category.category_name])),
    [flatTree]
  );
  const parentOptions = useMemo(
    () =>
      flatTree.map((category) => ({
        label: `${"— ".repeat(category.depth)}${category.category_name}`,
        value: category.id
      })),
    [flatTree]
  );

  const invalidateCategories = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
  };

  const activateMutation = useMutation({
    mutationFn: activateCategory,
    onSuccess: async () => {
      notify.success("Category activated");
      await invalidateCategories();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateCategory,
    onSuccess: async () => {
      notify.success("Category deactivated");
      await invalidateCategories();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      notify.success("Category deleted");
      setCategoryToDelete(null);
      await invalidateCategories();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  if (categoriesQuery.isError) {
    return <ErrorState title="Unable to load categories" message={getApiErrorMessage(categoriesQuery.error)} />;
  }

  const categoryData = categoriesQuery.data?.data;

  return (
    <PageLayout
      title="Category Management"
      description="Create, organize, activate, deactivate, and soft delete hierarchical product categories."
      actions={
        <Link to="/categories/new">
          <Button>
            <Plus className="h-4 w-4" />
            Create Category
          </Button>
        </Link>
      }
    >
      <FilterPanel>
        <div className="min-w-64 flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search categories" />
        </div>
        <Select
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value as CategoryStatus | "");
          }}
          options={[{ label: "All statuses", value: "" }, ...CATEGORY_STATUS_OPTIONS]}
          aria-label="Filter by status"
        />
        <Select
          value={parentCategoryId}
          onChange={(event) => {
            setPage(1);
            setParentCategoryId(event.target.value);
          }}
          options={[{ label: "All parent categories", value: "" }, ...parentOptions]}
          aria-label="Filter by parent category"
        />
        <Select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          options={CATEGORY_SORT_OPTIONS}
          aria-label="Sort categories"
        />
        <Select
          value={sortDirection}
          onChange={(event) => setSortDirection(event.target.value as "asc" | "desc")}
          options={[
            { label: "Ascending", value: "asc" },
            { label: "Descending", value: "desc" }
          ]}
          aria-label="Sort direction"
        />
      </FilterPanel>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-4">
          <CategoryTable
            categories={categoryData?.items ?? []}
            parentNameById={parentNameById}
            loading={categoriesQuery.isLoading}
            onActivate={(category) => activateMutation.mutate(category.id)}
            onDeactivate={(category) => deactivateMutation.mutate(category.id)}
            onDelete={setCategoryToDelete}
            emptyAction={
              <Link to="/categories/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Create Category
                </Button>
              </Link>
            }
          />

          {categoryData ? (
            <Pagination
              page={categoryData.meta.page}
              pageSize={categoryData.meta.page_size}
              totalItems={categoryData.meta.total_items}
              onPageChange={setPage}
              onPageSizeChange={(nextPageSize) => {
                setPage(1);
                setPageSize(nextPageSize);
              }}
            />
          ) : null}
        </div>

        {treeQuery.isError ? (
          <ErrorState title="Unable to load hierarchy" message={getApiErrorMessage(treeQuery.error)} />
        ) : (
          <CategoryTree categories={treeQuery.data?.data ?? []} />
        )}
      </div>

      <ConfirmationDialog
        open={Boolean(categoryToDelete)}
        title="Delete category"
        message={`Soft delete ${categoryToDelete?.category_name ?? "this category"}? Categories with child categories cannot be deleted.`}
        confirmLabel="Delete"
        onCancel={() => setCategoryToDelete(null)}
        onConfirm={() => categoryToDelete && deleteMutation.mutate(categoryToDelete.id)}
      />
    </PageLayout>
  );
}
