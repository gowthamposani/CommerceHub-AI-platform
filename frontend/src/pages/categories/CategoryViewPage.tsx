import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageLayout } from "@/components/layout/PageLayout";
import { CategoryDetailSections } from "@/components/categories/CategoryDetailSections";
import { flattenCategoryTree } from "@/components/categories/categoryTreeUtils";
import { Button } from "@/components/ui/Button";
import { queryKeys } from "@/lib/queryKeys";
import { notify } from "@/services/notificationService";
import { activateCategory, deactivateCategory, getCategory, getCategoryTree } from "@/services/categoryService";

export default function CategoryViewPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
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

  const invalidateCategory = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.categories.detail(categoryId ?? "") });
  };

  const activateMutation = useMutation({
    mutationFn: activateCategory,
    onSuccess: async () => {
      notify.success("Category activated");
      await invalidateCategory();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateCategory,
    onSuccess: async () => {
      notify.success("Category deactivated");
      await invalidateCategory();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  if (categoryQuery.isLoading) {
    return <LoadingState label="Loading category details" />;
  }

  if (categoryQuery.isError || !categoryQuery.data?.data) {
    return <ErrorState title="Category not found" message={getApiErrorMessage(categoryQuery.error)} />;
  }

  const category = categoryQuery.data.data;
  const flatTree = flattenCategoryTree(treeQuery.data?.data ?? []);
  const parentName = category.parent_category_id
    ? flatTree.find((item) => item.id === category.parent_category_id)?.category_name
    : null;

  return (
    <PageLayout
      title="Category Details"
      description="View category hierarchy, status, display order, media, and metadata."
      actions={
        <>
          <Link to={`/categories/${category.id}/edit`}>
            <Button variant="secondary">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          {category.is_active ? (
            <Button loading={deactivateMutation.isPending} onClick={() => deactivateMutation.mutate(category.id)}>
              Deactivate
            </Button>
          ) : (
            <Button loading={activateMutation.isPending} onClick={() => activateMutation.mutate(category.id)}>
              Activate
            </Button>
          )}
        </>
      }
    >
      <CategoryDetailSections category={category} parentName={parentName} />
    </PageLayout>
  );
}
