import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { PageLayout } from "@/components/layout/PageLayout";
import { CategoryForm } from "@/components/categories/CategoryForm";
import type { CategoryFormValues } from "@/components/categories/categoryValidation";
import { flattenCategoryTree } from "@/components/categories/categoryTreeUtils";
import { queryKeys } from "@/lib/queryKeys";
import { notify } from "@/services/notificationService";
import { createCategory, getCategoryTree } from "@/services/categoryService";

export default function CategoryCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const treeQuery = useQuery({
    queryKey: queryKeys.categories.tree,
    queryFn: getCategoryTree
  });

  const parentOptions = useMemo(
    () =>
      flattenCategoryTree(treeQuery.data?.data ?? []).map((category) => ({
        label: `${"— ".repeat(category.depth)}${category.category_name}`,
        value: category.id
      })),
    [treeQuery.data?.data]
  );

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: async (response) => {
      notify.success("Category created");
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      if (response.data?.id) {
        navigate(`/categories/${response.data.id}`);
      }
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  function handleSubmit(values: CategoryFormValues) {
    createMutation.mutate(values);
  }

  return (
    <PageLayout title="Create Category" description="Create a category that persists through the backend category API.">
      <CategoryForm
        mode="create"
        parentOptions={parentOptions}
        loading={createMutation.isPending}
        onSubmit={handleSubmit}
      />
    </PageLayout>
  );
}
