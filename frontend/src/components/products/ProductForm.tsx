import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { productFormSchema, type ProductFormValues } from "@/components/products/productValidation";
import { FormActions } from "@/components/forms/FormActions";
import { FormField } from "@/components/forms/FormField";
import { zodFormResolver } from "@/components/forms/formResolver";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { PRODUCT_CURRENCY_OPTIONS, PRODUCT_VISIBILITY_OPTIONS } from "@/constants/product";
import type { Brand } from "@/types/brand";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import type { Seller } from "@/types/seller";

const emptyDefaults: ProductFormValues = {
  seller_id: "",
  category_id: "",
  brand_id: "",
  product_name: "",
  product_slug: "",
  short_description: null,
  long_description: null,
  sku: "",
  barcode: null,
  price: "",
  discount_price: null,
  cost_price: null,
  currency: "INR",
  tax_percentage: "0",
  weight: null,
  length: null,
  width: null,
  height: null,
  visibility: "private",
  is_featured: false
};

function productToFormValues(product?: Product): ProductFormValues {
  if (!product) {
    return emptyDefaults;
  }

  return {
    seller_id: product.seller_id,
    category_id: product.category_id,
    brand_id: product.brand_id,
    product_name: product.product_name,
    product_slug: product.product_slug,
    short_description: product.short_description,
    long_description: product.long_description,
    sku: product.sku,
    barcode: product.barcode,
    price: String(product.price),
    discount_price: product.discount_price === null ? null : String(product.discount_price),
    cost_price: product.cost_price === null ? null : String(product.cost_price),
    currency: product.currency,
    tax_percentage: String(product.tax_percentage),
    weight: product.weight === null ? null : String(product.weight),
    length: product.length === null ? null : String(product.length),
    width: product.width === null ? null : String(product.width),
    height: product.height === null ? null : String(product.height),
    visibility: product.visibility,
    is_featured: product.is_featured
  };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProductForm({
  product,
  mode,
  loading,
  sellers,
  categories,
  brands,
  onSubmit
}: {
  product?: Product;
  mode: "create" | "edit";
  loading?: boolean;
  sellers: Seller[];
  categories: Category[];
  brands: Brand[];
  onSubmit: (values: ProductFormValues) => void;
}) {
  const defaultValues = useMemo(() => productToFormValues(product), [product]);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ProductFormValues>({
    resolver: zodFormResolver(productFormSchema),
    values: defaultValues
  });

  const productName = watch("product_name");
  const productSlug = watch("product_slug");

  useEffect(() => {
    if (mode === "create" && !productSlug && productName) {
      setValue("product_slug", slugify(productName), { shouldValidate: true });
    }
  }, [mode, productName, productSlug, setValue]);

  const sellerOptions = [
    { label: "Select seller", value: "" },
    ...sellers.map((seller) => ({ label: seller.business_name, value: seller.id }))
  ];
  const categoryOptions = [
    { label: "Select category", value: "" },
    ...categories.map((category) => ({ label: category.category_name, value: category.id }))
  ];
  const brandOptions = [
    { label: "Select brand", value: "" },
    ...brands.map((brand) => ({ label: brand.brand_name, value: brand.id }))
  ];

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Product Information</h2>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField label="Product Name" error={errors.product_name?.message}>
            <Input {...register("product_name")} />
          </FormField>
          <FormField label="Product Slug" error={errors.product_slug?.message}>
            <Input {...register("product_slug")} />
          </FormField>
          <FormField label="Seller" error={errors.seller_id?.message}>
            <Select {...register("seller_id")} options={sellerOptions} aria-label="Seller" />
          </FormField>
          <FormField label="Category" error={errors.category_id?.message}>
            <Select {...register("category_id")} options={categoryOptions} aria-label="Category" />
          </FormField>
          <FormField label="Brand" error={errors.brand_id?.message}>
            <Select {...register("brand_id")} options={brandOptions} aria-label="Brand" />
          </FormField>
          <FormField label="SKU" error={errors.sku?.message}>
            <Input {...register("sku")} />
          </FormField>
          <FormField label="Barcode" error={errors.barcode?.message}>
            <Input {...register("barcode")} />
          </FormField>
          <FormField label="Visibility" error={errors.visibility?.message}>
            <Select {...register("visibility")} options={PRODUCT_VISIBILITY_OPTIONS} aria-label="Visibility" />
          </FormField>
          <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm">
            <Checkbox {...register("is_featured")} />
            Featured
          </label>
          <FormField label="Status">
            <Input value={product?.status ?? "draft"} disabled aria-label="Status" />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Pricing</h2>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FormField label="Price" error={errors.price?.message}>
            <Input type="number" min={0} step="0.01" {...register("price")} />
          </FormField>
          <FormField label="Discount Price" error={errors.discount_price?.message}>
            <Input type="number" min={0} step="0.01" {...register("discount_price")} />
          </FormField>
          <FormField label="Cost Price" error={errors.cost_price?.message}>
            <Input type="number" min={0} step="0.01" {...register("cost_price")} />
          </FormField>
          <FormField label="Currency" error={errors.currency?.message}>
            <Select {...register("currency")} options={PRODUCT_CURRENCY_OPTIONS} aria-label="Currency" />
          </FormField>
          <FormField label="Tax Percentage" error={errors.tax_percentage?.message}>
            <Input type="number" min={0} max={100} step="0.01" {...register("tax_percentage")} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Dimensions</h2>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FormField label="Weight" error={errors.weight?.message}>
            <Input type="number" min={0} step="0.001" {...register("weight")} />
          </FormField>
          <FormField label="Length" error={errors.length?.message}>
            <Input type="number" min={0} step="0.001" {...register("length")} />
          </FormField>
          <FormField label="Width" error={errors.width?.message}>
            <Input type="number" min={0} step="0.001" {...register("width")} />
          </FormField>
          <FormField label="Height" error={errors.height?.message}>
            <Input type="number" min={0} step="0.001" {...register("height")} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Descriptions</h2>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FormField label="Short Description" error={errors.short_description?.message}>
            <Input {...register("short_description")} />
          </FormField>
          <FormField label="Long Description" error={errors.long_description?.message}>
            <Textarea {...register("long_description")} />
          </FormField>
        </CardContent>
      </Card>

      <FormActions>
        <Button type="submit" loading={loading}>
          {mode === "create" ? "Create Product" : "Save Changes"}
        </Button>
      </FormActions>
    </form>
  );
}
