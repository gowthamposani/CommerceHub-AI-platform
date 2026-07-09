import { ImageOff, UploadCloud, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { FormActions } from "@/components/forms/FormActions";
import { FormField } from "@/components/forms/FormField";
import { zodFormResolver } from "@/components/forms/formResolver";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { categoryFormSchema, type CategoryFormValues } from "@/components/categories/categoryValidation";
import type { Category, CategoryStatus } from "@/types/category";
import type { Option } from "@/types/common";

const emptyDefaults: CategoryFormValues = {
  parent_category_id: null,
  category_name: "",
  category_slug: "",
  description: null,
  image_url: null,
  display_order: 0
};

function categoryToFormValues(category?: Category): CategoryFormValues {
  if (!category) {
    return emptyDefaults;
  }

  return {
    parent_category_id: category.parent_category_id,
    category_name: category.category_name,
    category_slug: category.category_slug,
    description: category.description,
    image_url: category.image_url,
    display_order: category.display_order
  };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CategoryForm({
  category,
  parentOptions,
  mode,
  loading,
  onSubmit
}: {
  category?: Category;
  parentOptions: readonly Option[];
  mode: "create" | "edit";
  loading?: boolean;
  onSubmit: (values: CategoryFormValues) => void;
}) {
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
  const defaultValues = useMemo(() => categoryToFormValues(category), [category]);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CategoryFormValues>({
    resolver: zodFormResolver(categoryFormSchema),
    values: defaultValues
  });

  const imageUrl = watch("image_url");
  const categoryName = watch("category_name");
  const categorySlug = watch("category_slug");
  const previewSource = localImagePreview ?? imageUrl;
  const status: CategoryStatus = category?.status ?? "active";

  useEffect(() => {
    if (mode === "create" && !categorySlug && categoryName) {
      setValue("category_slug", slugify(categoryName), { shouldValidate: true });
    }
  }, [categoryName, categorySlug, mode, setValue]);

  useEffect(() => {
    return () => {
      if (localImagePreview) {
        URL.revokeObjectURL(localImagePreview);
      }
    };
  }, [localImagePreview]);

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Category Information</h2>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField label="Parent Category" error={errors.parent_category_id?.message}>
            <Select
              {...register("parent_category_id")}
              options={[{ label: "No parent category", value: "" }, ...parentOptions]}
            />
          </FormField>
          <FormField label="Status">
            <Select
              value={status}
              disabled
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Deleted", value: "deleted" }
              ]}
              aria-label="Category status"
            />
          </FormField>
          <FormField label="Category Name" error={errors.category_name?.message}>
            <Input {...register("category_name")} />
          </FormField>
          <FormField label="Category Slug" error={errors.category_slug?.message}>
            <Input {...register("category_slug")} />
          </FormField>
          <FormField label="Display Order" error={errors.display_order?.message}>
            <Input type="number" min={0} {...register("display_order")} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Category Image</h2>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="space-y-4">
            <FormField label="Image URL" error={errors.image_url?.message}>
              <Input type="url" {...register("image_url")} />
            </FormField>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50">
                <UploadCloud className="h-4 w-4" />
                Upload Preview
                <input
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (localImagePreview) {
                      URL.revokeObjectURL(localImagePreview);
                    }
                    setLocalImagePreview(URL.createObjectURL(file));
                  }}
                />
              </label>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (localImagePreview) {
                    URL.revokeObjectURL(localImagePreview);
                  }
                  setLocalImagePreview(null);
                  setValue("image_url", null, { shouldValidate: true });
                }}
              >
                <X className="h-4 w-4" />
                Remove Image
              </Button>
            </div>
          </div>
          <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
            {previewSource ? (
              <img src={previewSource} alt="Category preview" className="max-h-40 rounded-md object-contain" />
            ) : (
              <div className="grid justify-items-center gap-2 text-center text-sm text-gray-500">
                <ImageOff className="h-7 w-7" />
                No image selected
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Description</h2>
        </CardHeader>
        <CardContent>
          <FormField label="Description" error={errors.description?.message}>
            <Textarea {...register("description")} />
          </FormField>
        </CardContent>
      </Card>

      <FormActions>
        <Button type="submit" loading={loading}>
          {mode === "create" ? "Create Category" : "Save Changes"}
        </Button>
      </FormActions>
    </form>
  );
}
