import { ImageOff, UploadCloud, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { brandFormSchema, type BrandFormValues } from "@/components/brands/brandValidation";
import { FormActions } from "@/components/forms/FormActions";
import { FormField } from "@/components/forms/FormField";
import { zodFormResolver } from "@/components/forms/formResolver";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { BRAND_LOGO_ACCEPTED_TYPES, BRAND_LOGO_MAX_SIZE_BYTES } from "@/constants/brand";
import type { Brand, BrandStatus } from "@/types/brand";

const emptyDefaults: BrandFormValues = {
  brand_name: "",
  brand_slug: "",
  description: null,
  logo_url: null,
  website: null,
  country_of_origin: null,
  founded_year: null
};

function brandToFormValues(brand?: Brand): BrandFormValues {
  if (!brand) {
    return emptyDefaults;
  }

  return {
    brand_name: brand.brand_name,
    brand_slug: brand.brand_slug,
    description: brand.description,
    logo_url: brand.logo_url,
    website: brand.website,
    country_of_origin: brand.country_of_origin,
    founded_year: brand.founded_year
  };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function BrandForm({
  brand,
  mode,
  loading,
  onSubmit
}: {
  brand?: Brand;
  mode: "create" | "edit";
  loading?: boolean;
  onSubmit: (values: BrandFormValues) => void;
}) {
  const [localLogoPreview, setLocalLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const defaultValues = useMemo(() => brandToFormValues(brand), [brand]);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<BrandFormValues>({
    resolver: zodFormResolver(brandFormSchema),
    values: defaultValues
  });

  const logoUrl = watch("logo_url");
  const brandName = watch("brand_name");
  const brandSlug = watch("brand_slug");
  const previewSource = localLogoPreview ?? logoUrl;
  const status: BrandStatus = brand?.status ?? "active";

  useEffect(() => {
    if (mode === "create" && !brandSlug && brandName) {
      setValue("brand_slug", slugify(brandName), { shouldValidate: true });
    }
  }, [brandName, brandSlug, mode, setValue]);

  useEffect(() => {
    return () => {
      if (localLogoPreview) {
        URL.revokeObjectURL(localLogoPreview);
      }
    };
  }, [localLogoPreview]);

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Brand Information</h2>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField label="Brand Name" error={errors.brand_name?.message}>
            <Input {...register("brand_name")} />
          </FormField>
          <FormField label="Brand Slug" error={errors.brand_slug?.message}>
            <Input {...register("brand_slug")} />
          </FormField>
          <FormField label="Website" error={errors.website?.message}>
            <Input type="url" {...register("website")} />
          </FormField>
          <FormField label="Country of Origin" error={errors.country_of_origin?.message}>
            <Input {...register("country_of_origin")} />
          </FormField>
          <FormField label="Founded Year" error={errors.founded_year?.message}>
            <Input
              type="number"
              min={1800}
              max={new Date().getFullYear()}
              {...register("founded_year", {
                setValueAs: (value) => (value === "" ? null : Number(value))
              })}
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
              aria-label="Brand status"
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Logo Management</h2>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="space-y-4">
            <FormField label="Logo URL" error={errors.logo_url?.message}>
              <Input type="url" {...register("logo_url")} />
            </FormField>
            {logoError ? <p className="text-sm text-brand-red">{logoError}</p> : null}
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50">
                <UploadCloud className="h-4 w-4" />
                Upload Preview
                <input
                  className="sr-only"
                  type="file"
                  accept={BRAND_LOGO_ACCEPTED_TYPES.join(",")}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (!BRAND_LOGO_ACCEPTED_TYPES.includes(file.type as (typeof BRAND_LOGO_ACCEPTED_TYPES)[number])) {
                      setLogoError("Logo must be a JPG, PNG, WEBP, or SVG image");
                      return;
                    }
                    if (file.size > BRAND_LOGO_MAX_SIZE_BYTES) {
                      setLogoError("Logo must be 2 MB or smaller");
                      return;
                    }
                    if (localLogoPreview) {
                      URL.revokeObjectURL(localLogoPreview);
                    }
                    setLogoError(null);
                    setLocalLogoPreview(URL.createObjectURL(file));
                  }}
                />
              </label>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (localLogoPreview) {
                    URL.revokeObjectURL(localLogoPreview);
                  }
                  setLogoError(null);
                  setLocalLogoPreview(null);
                  setValue("logo_url", null, { shouldValidate: true });
                }}
              >
                <X className="h-4 w-4" />
                Remove Logo
              </Button>
            </div>
          </div>
          <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
            {previewSource ? (
              <img src={previewSource} alt="Brand logo preview" className="max-h-40 rounded-md object-contain" />
            ) : (
              <div className="grid justify-items-center gap-2 text-center text-sm text-gray-500">
                <ImageOff className="h-7 w-7" />
                No logo selected
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
          {mode === "create" ? "Create Brand" : "Save Changes"}
        </Button>
      </FormActions>
    </form>
  );
}
