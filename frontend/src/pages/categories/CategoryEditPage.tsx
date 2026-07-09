import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageLayout } from "@/components/layout/PageLayout";
import { CategoryForm } from "@/components/categories/CategoryForm";
import type { CategoryFormValues } from "@/components/categories/categoryValidation";
import { collectDescendantIds, flattenCategoryTree } from "@/components/categories/categoryTreeUtils";
import { queryKeys } from "@/lib/queryKeys";
import { notify } from "@/services/notificationService";
import { getCategory, getCategoryTree, updateCategory } from "@/services/categoryService";

export default function CategoryEditPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const categoryQuery = useQuery({
    queryKey: queryKeys.categories.detail(categoryId ?? ""),
    queryFn: () => getCategory(categoryId ?? ""),
    enabled: Boolean(categoryId)
  });

  const treeQuery = useQuery({
    queryKey: queryKeys.categories.tree,
    queryFn: getCategoryTree
  });

  const parentOptions = useMemo(() => {
    const tree = treeQuery.data?.data ?? [];
    const descendants = categoryId ? collectDescendantIds(tree, categoryId) : new Set<string>();
    return flattenCategoryTree(tree)
      .filter((category) => category.id !== categoryId && !descendants.has(category.id))
      .map((category) => ({
        label: `${"— ".repeat(category.depth)}${category.category_name}`,
        value: category.id
      }));
  }, [categoryId, treeQuery.data?.data]);

  const updateMutation = useMutation({
    mutationFn: (values: CategoryFormValues) => updateCategory(categoryId ?? "", values),
    onSuccess: async () => {
      notify.success("Category updated");
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories.detail(categoryId ?? "") });
      navigate(`/categories/${categoryId}`);
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  if (categoryQuery.isLoading) {
    return <LoadingState label="Loading category" />;
  }

  if (categoryQuery.isError || !categoryQuery.data?.data) {
    return <ErrorState title="Category not found" message={getApiErrorMessage(categoryQuery.error)} />;
  }

  return (
    <PageLayout title="Edit Category" description="Update category hierarchy, metadata, display order, and media.">
      <CategoryForm
        category={categoryQuery.data.data}
        mode="edit"
        parentOptions={parentOptions}
        loading={updateMutation.isPending}
        onSubmit={updateMutation.mutate}
      />
    </PageLayout>
  );
}
