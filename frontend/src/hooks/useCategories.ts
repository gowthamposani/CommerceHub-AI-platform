import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "../lib/api";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../services/admin.service";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../types/admin";

export function useCategories() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const categories = await getCategories();
      setData(categories);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreateCategoryRequest) => {
    setError(null);

    try {
      const category = await createCategory(payload);
      setData((currentCategories) => [category, ...currentCategories]);
      return category;
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);
      setError(message);
      throw requestError;
    }
  }, []);

  const update = useCallback(async (categoryId: string, payload: UpdateCategoryRequest) => {
    setError(null);

    try {
      const category = await updateCategory(categoryId, payload);
      setData((currentCategories) => currentCategories.map((item) => (item.id === category.id ? category : item)));
      return category;
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);
      setError(message);
      throw requestError;
    }
  }, []);

  const remove = useCallback(async (categoryId: string) => {
    setError(null);

    try {
      await deleteCategory(categoryId);
      setData((currentCategories) => currentCategories.filter((category) => category.id !== categoryId));
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);
      setError(message);
      throw requestError;
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch, create, update, remove };
}
