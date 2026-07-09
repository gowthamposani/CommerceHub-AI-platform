import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { Product } from "@/types/product";
import { formatCurrency, formatDate } from "@/utils/formatters";

function statusTone(status: Product["status"]) {
  if (status === "published") return "success";
  if (status === "archived") return "neutral";
  if (status === "deleted") return "danger";
  return "warning";
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-950">{value ?? "Not provided"}</p>
    </div>
  );
}

export function ProductDetailSections({ product, preview = false }: { product: Product; preview?: boolean }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-950">{product.product_name}</h2>
                <p className="mt-1 text-sm text-gray-500">{product.product_slug}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone={statusTone(product.status)}>{product.status}</Badge>
                <Badge tone="neutral">{product.visibility}</Badge>
                {preview ? <Badge tone="warning">Preview</Badge> : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Seller" value={product.seller_name} />
            <Field label="Category" value={product.category_name} />
            <Field label="Brand" value={product.brand_name} />
            <Field label="SKU" value={product.sku} />
            <Field label="Barcode" value={product.barcode} />
            <Field label="Featured" value={product.is_featured ? "Yes" : "No"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-bold text-gray-950">Description</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Short Description" value={product.short_description} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Long Description</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                {product.long_description ?? "Not provided"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <h2 className="text-base font-bold text-gray-950">Pricing</h2>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Price" value={formatCurrency(Number(product.price), product.currency)} />
            <Field
              label="Discount Price"
              value={product.discount_price ? formatCurrency(Number(product.discount_price), product.currency) : null}
            />
            <Field
              label="Cost Price"
              value={product.cost_price ? formatCurrency(Number(product.cost_price), product.currency) : null}
            />
            <Field label="Tax Percentage" value={`${product.tax_percentage}%`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-bold text-gray-950">Dimensions</h2>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Weight" value={product.weight ? `${product.weight} kg` : null} />
            <Field label="Length" value={product.length ? `${product.length} cm` : null} />
            <Field label="Width" value={product.width ? `${product.width} cm` : null} />
            <Field label="Height" value={product.height ? `${product.height} cm` : null} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-bold text-gray-950">Lifecycle</h2>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Published" value={product.published_at ? formatDate(product.published_at) : "No"} />
            <Field label="Created" value={formatDate(product.created_at)} />
            <Field label="Updated" value={formatDate(product.updated_at)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
