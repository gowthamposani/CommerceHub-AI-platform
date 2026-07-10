import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getApiErrorMessage } from "@/api/errors";
import { EmptyState } from "@/components/common/EmptyState";
import { FormField } from "@/components/forms/FormField";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { queryKeys } from "@/lib/queryKeys";
import { notify } from "@/services/notificationService";
import {
  createProductAttribute,
  createProductSpecification,
  createProductTag,
  createProductVariant,
  deleteProductAttribute,
  deleteProductSpecification,
  deleteProductTag,
  deleteProductVariant,
  getProductAttributes,
  getProductExtensionPreview,
  getProductSeo,
  getProductSpecifications,
  getProductTags,
  getProductVariants,
  upsertProductSeo
} from "@/services/productExtensionService";
import type { AttributeSelection, ProductSeoPayload, ProductVariantStatus } from "@/types/productExtension";
import { formatDate } from "@/utils/formatters";

const tabs = ["Variants", "Attributes", "Tags", "Specifications", "SEO", "Preview"] as const;
type ProductExtensionTab = (typeof tabs)[number];

const variantStatusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" }
];

function splitValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ProductExtensionManager({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ProductExtensionTab>("Variants");
  const [variantSearch, setVariantSearch] = useState("");
  const [attributeName, setAttributeName] = useState("");
  const [attributeValues, setAttributeValues] = useState("");
  const [tagName, setTagName] = useState("");
  const [specification, setSpecification] = useState({
    group_name: "",
    specification_name: "",
    specification_value: "",
    display_order: "0"
  });
  const [variant, setVariant] = useState({
    sku: "",
    barcode: "",
    price: "",
    discount_price: "",
    cost_price: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    status: "draft" as ProductVariantStatus
  });
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [seo, setSeo] = useState<ProductSeoPayload>({
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    meta_robots: "index,follow",
    canonical_url: "",
    friendly_url: "",
    open_graph_title: "",
    open_graph_description: ""
  });

  const variantParams = useMemo(
    () => ({
      page: 1,
      page_size: 25,
      search: variantSearch || undefined,
      sort_by: "sku",
      sort_direction: "asc" as const
    }),
    [variantSearch]
  );

  const variantsQuery = useQuery({
    queryKey: queryKeys.products.variants(productId, variantParams),
    queryFn: () => getProductVariants(productId, variantParams)
  });
  const attributesQuery = useQuery({
    queryKey: queryKeys.products.attributes(productId),
    queryFn: () => getProductAttributes(productId)
  });
  const tagsQuery = useQuery({
    queryKey: queryKeys.products.tags(productId),
    queryFn: () => getProductTags(productId)
  });
  const specificationsQuery = useQuery({
    queryKey: queryKeys.products.specifications(productId),
    queryFn: () => getProductSpecifications(productId)
  });
  const seoQuery = useQuery({
    queryKey: queryKeys.products.seo(productId),
    queryFn: () => getProductSeo(productId)
  });
  const previewQuery = useQuery({
    queryKey: queryKeys.products.extensionPreview(productId),
    queryFn: () => getProductExtensionPreview(productId),
    enabled: activeTab === "Preview"
  });

  useEffect(() => {
    const payload = seoQuery.data?.data;
    if (payload) {
      setSeo({
        seo_title: payload.seo_title ?? "",
        seo_description: payload.seo_description ?? "",
        seo_keywords: payload.seo_keywords ?? "",
        meta_robots: payload.meta_robots,
        canonical_url: payload.canonical_url ?? "",
        friendly_url: payload.friendly_url ?? "",
        open_graph_title: payload.open_graph_title ?? "",
        open_graph_description: payload.open_graph_description ?? ""
      });
    }
  }, [seoQuery.data?.data]);

  const invalidateExtensions = async () => {
    await queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const attributeMutation = useMutation({
    mutationFn: () =>
      createProductAttribute(productId, {
        attribute_name: attributeName,
        values: splitValues(attributeValues),
        display_order: 0,
        is_variant_defining: true
      }),
    onSuccess: async () => {
      notify.success("Product attribute saved");
      setAttributeName("");
      setAttributeValues("");
      await invalidateExtensions();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const variantMutation = useMutation({
    mutationFn: () => {
      const attributes: AttributeSelection[] = Object.entries(selectedAttributes)
        .filter(([, value]) => value)
        .map(([attribute_id, value]) => ({ attribute_id, value }));
      return createProductVariant(productId, {
        sku: variant.sku,
        barcode: variant.barcode || null,
        price: variant.price,
        discount_price: variant.discount_price || null,
        cost_price: variant.cost_price || null,
        weight: variant.weight || null,
        length: variant.length || null,
        width: variant.width || null,
        height: variant.height || null,
        status: variant.status,
        is_active: variant.status === "active",
        attributes
      });
    },
    onSuccess: async () => {
      notify.success("Product variant saved");
      setVariant({
        sku: "",
        barcode: "",
        price: "",
        discount_price: "",
        cost_price: "",
        weight: "",
        length: "",
        width: "",
        height: "",
        status: "draft"
      });
      setSelectedAttributes({});
      await invalidateExtensions();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const tagMutation = useMutation({
    mutationFn: () => createProductTag(productId, tagName),
    onSuccess: async () => {
      notify.success("Product tag saved");
      setTagName("");
      await invalidateExtensions();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const specificationMutation = useMutation({
    mutationFn: () =>
      createProductSpecification(productId, {
        group_name: specification.group_name || null,
        specification_name: specification.specification_name,
        specification_value: specification.specification_value,
        display_order: Number(specification.display_order || 0)
      }),
    onSuccess: async () => {
      notify.success("Product specification saved");
      setSpecification({ group_name: "", specification_name: "", specification_value: "", display_order: "0" });
      await invalidateExtensions();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const seoMutation = useMutation({
    mutationFn: () => upsertProductSeo(productId, seo),
    onSuccess: async () => {
      notify.success("Product SEO metadata saved");
      await invalidateExtensions();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: "variant" | "attribute" | "tag" | "specification"; id: string }) => {
      if (type === "variant") await deleteProductVariant(id);
      if (type === "attribute") await deleteProductAttribute(id);
      if (type === "tag") await deleteProductTag(id);
      if (type === "specification") await deleteProductSpecification(id);
      return true;
    },
    onSuccess: async () => {
      notify.success("Product metadata deleted");
      await invalidateExtensions();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const attributes = attributesQuery.data?.data?.items ?? [];
  const variants = variantsQuery.data?.data?.items ?? [];
  const tags = tagsQuery.data?.data?.items ?? [];
  const specifications = specificationsQuery.data?.data?.items ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-950">Product Configuration</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage variants, attributes, tags, specs, SEO, and preview data.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  activeTab === tab ? "bg-brand-gold text-gray-950" : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {activeTab === "Attributes" ? (
          <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <FormField label="Attribute Name">
                <Input value={attributeName} onChange={(event) => setAttributeName(event.target.value)} />
              </FormField>
              <FormField label="Allowed Values">
                <Input
                  value={attributeValues}
                  onChange={(event) => setAttributeValues(event.target.value)}
                  placeholder="Red, Blue, Small, Medium"
                />
              </FormField>
              <Button
                type="button"
                loading={attributeMutation.isPending}
                onClick={() => attributeMutation.mutate()}
                disabled={!attributeName.trim()}
              >
                <Plus className="h-4 w-4" />
                Add Attribute
              </Button>
            </div>
            <div className="space-y-3">
              {attributes.length === 0 ? (
                <EmptyState title="No attributes configured" message="Create attributes before adding variants." />
              ) : (
                attributes.map((attribute) => (
                  <div key={attribute.id} className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-950">{attribute.attribute_name}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {attribute.values
                            .filter((value) => value.variant_id === null)
                            .map((value) => (
                              <Badge key={value.id} tone="info">
                                {value.value}
                              </Badge>
                            ))}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Delete attribute"
                        onClick={() => deleteMutation.mutate({ type: "attribute", id: attribute.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        ) : null}

        {activeTab === "Variants" ? (
          <section className="space-y-5">
            <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2 xl:grid-cols-4">
              <FormField label="SKU">
                <Input value={variant.sku} onChange={(event) => setVariant({ ...variant, sku: event.target.value })} />
              </FormField>
              <FormField label="Barcode">
                <Input
                  value={variant.barcode}
                  onChange={(event) => setVariant({ ...variant, barcode: event.target.value })}
                />
              </FormField>
              <FormField label="Price">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={variant.price}
                  onChange={(event) => setVariant({ ...variant, price: event.target.value })}
                />
              </FormField>
              <FormField label="Status">
                <Select
                  value={variant.status}
                  options={variantStatusOptions}
                  onChange={(event) => setVariant({ ...variant, status: event.target.value as ProductVariantStatus })}
                  aria-label="Variant status"
                />
              </FormField>
              {attributes.map((attribute) => (
                <FormField key={attribute.id} label={attribute.attribute_name}>
                  <Select
                    value={selectedAttributes[attribute.id] ?? ""}
                    options={[
                      { label: "Select value", value: "" },
                      ...attribute.values
                        .filter((value) => value.variant_id === null)
                        .map((value) => ({ label: value.value, value: value.value }))
                    ]}
                    onChange={(event) =>
                      setSelectedAttributes({ ...selectedAttributes, [attribute.id]: event.target.value })
                    }
                    aria-label={attribute.attribute_name}
                  />
                </FormField>
              ))}
              <div className="flex items-end">
                <Button
                  type="button"
                  loading={variantMutation.isPending}
                  onClick={() => variantMutation.mutate()}
                  disabled={!variant.sku.trim() || !variant.price}
                >
                  <Plus className="h-4 w-4" />
                  Add Variant
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                value={variantSearch}
                onChange={(event) => setVariantSearch(event.target.value)}
                placeholder="Search SKU, barcode, or variant"
              />
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">SKU</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Barcode</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Combination</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Price</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {variants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No variants configured
                      </td>
                    </tr>
                  ) : (
                    variants.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 font-semibold text-gray-950">{item.sku}</td>
                        <td className="px-4 py-3 text-gray-600">{item.barcode ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-600">{item.variant_signature}</td>
                        <td className="px-4 py-3 text-gray-600">{item.price}</td>
                        <td className="px-4 py-3">
                          <Badge tone={item.status === "active" ? "success" : "neutral"}>{item.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Delete variant"
                            onClick={() => deleteMutation.mutate({ type: "variant", id: item.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {activeTab === "Tags" ? (
          <section className="space-y-4">
            <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:flex-row">
              <Input value={tagName} onChange={(event) => setTagName(event.target.value)} placeholder="New Arrival" />
              <Button
                type="button"
                loading={tagMutation.isPending}
                onClick={() => tagMutation.mutate()}
                disabled={!tagName.trim()}
              >
                <Plus className="h-4 w-4" />
                Add Tag
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.length === 0 ? (
                <EmptyState title="No product tags" message="Add tags for merchandising and search." />
              ) : (
                tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700"
                    onClick={() => deleteMutation.mutate({ type: "tag", id: tag.id })}
                  >
                    {tag.tag_name}
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ))
              )}
            </div>
          </section>
        ) : null}

        {activeTab === "Specifications" ? (
          <section className="space-y-5">
            <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
              <FormField label="Group">
                <Input
                  value={specification.group_name}
                  onChange={(event) => setSpecification({ ...specification, group_name: event.target.value })}
                  placeholder="Display"
                />
              </FormField>
              <FormField label="Name">
                <Input
                  value={specification.specification_name}
                  onChange={(event) => setSpecification({ ...specification, specification_name: event.target.value })}
                  placeholder="Screen Size"
                />
              </FormField>
              <FormField label="Value">
                <Input
                  value={specification.specification_value}
                  onChange={(event) => setSpecification({ ...specification, specification_value: event.target.value })}
                  placeholder="6.7 inch"
                />
              </FormField>
              <FormField label="Display Order">
                <Input
                  type="number"
                  min={0}
                  value={specification.display_order}
                  onChange={(event) => setSpecification({ ...specification, display_order: event.target.value })}
                />
              </FormField>
              <Button
                type="button"
                loading={specificationMutation.isPending}
                onClick={() => specificationMutation.mutate()}
                disabled={!specification.specification_name.trim() || !specification.specification_value.trim()}
              >
                <Plus className="h-4 w-4" />
                Add Specification
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {specifications.length === 0 ? (
                <EmptyState title="No specifications" message="Add product specifications for buyer-facing details." />
              ) : (
                specifications.map((item) => (
                  <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">{item.group_name ?? "General"}</p>
                        <p className="font-semibold text-gray-950">{item.specification_name}</p>
                        <p className="text-sm text-gray-600">{item.specification_value}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Delete specification"
                        onClick={() => deleteMutation.mutate({ type: "specification", id: item.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        ) : null}

        {activeTab === "SEO" ? (
          <section className="grid gap-4 md:grid-cols-2">
            <FormField label="SEO Title">
              <Input
                value={seo.seo_title ?? ""}
                onChange={(event) => setSeo({ ...seo, seo_title: event.target.value })}
              />
            </FormField>
            <FormField label="Friendly URL">
              <Input
                value={seo.friendly_url ?? ""}
                onChange={(event) => setSeo({ ...seo, friendly_url: event.target.value })}
              />
            </FormField>
            <FormField label="SEO Description">
              <Textarea
                value={seo.seo_description ?? ""}
                onChange={(event) => setSeo({ ...seo, seo_description: event.target.value })}
              />
            </FormField>
            <FormField label="SEO Keywords">
              <Textarea
                value={seo.seo_keywords ?? ""}
                onChange={(event) => setSeo({ ...seo, seo_keywords: event.target.value })}
              />
            </FormField>
            <FormField label="Canonical URL">
              <Input
                value={seo.canonical_url ?? ""}
                onChange={(event) => setSeo({ ...seo, canonical_url: event.target.value })}
              />
            </FormField>
            <FormField label="Meta Robots">
              <Input
                value={seo.meta_robots}
                onChange={(event) => setSeo({ ...seo, meta_robots: event.target.value })}
              />
            </FormField>
            <FormField label="Open Graph Title">
              <Input
                value={seo.open_graph_title ?? ""}
                onChange={(event) => setSeo({ ...seo, open_graph_title: event.target.value })}
              />
            </FormField>
            <FormField label="Open Graph Description">
              <Input
                value={seo.open_graph_description ?? ""}
                onChange={(event) => setSeo({ ...seo, open_graph_description: event.target.value })}
              />
            </FormField>
            <div className="md:col-span-2">
              <Button type="button" loading={seoMutation.isPending} onClick={() => seoMutation.mutate()}>
                Save SEO Metadata
              </Button>
            </div>
          </section>
        ) : null}

        {activeTab === "Preview" ? (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Eye className="h-4 w-4 text-brand-gold" />
              Product Preview Metadata
            </div>
            {previewQuery.isLoading ? (
              <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <PreviewStat label="Variants" value={previewQuery.data?.data?.variants.length ?? 0} />
                <PreviewStat label="Attributes" value={previewQuery.data?.data?.attributes.length ?? 0} />
                <PreviewStat label="Tags" value={previewQuery.data?.data?.tags.length ?? 0} />
                <PreviewStat label="Specifications" value={previewQuery.data?.data?.specifications.length ?? 0} />
              </div>
            )}
            {previewQuery.data?.data?.seo ? (
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="font-semibold text-gray-950">{previewQuery.data.data.seo.seo_title ?? "Untitled SEO"}</p>
                <p className="mt-1 text-sm text-gray-600">{previewQuery.data.data.seo.seo_description}</p>
                <p className="mt-2 text-xs text-gray-500">
                  Updated {formatDate(previewQuery.data.data.seo.updated_at)}
                </p>
              </div>
            ) : null}
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}

function PreviewStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm font-semibold text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-950">{value}</p>
    </div>
  );
}
