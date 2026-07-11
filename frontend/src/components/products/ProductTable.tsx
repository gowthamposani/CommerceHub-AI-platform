import { Archive, Copy, Eye, Pencil, Send, Trash2, Undo2 } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/table/TableSkeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types/product";
import { formatCurrency, formatDate } from "@/utils/formatters";

function statusTone(status: Product["status"]) {
  if (status === "published") return "success";
  if (status === "archived") return "neutral";
  if (status === "deleted") return "danger";
  return "warning";
}

function productPrice(product: Product) {
  return formatCurrency(Number(product.discount_price ?? product.price), product.currency);
}

export function ProductTable({
  products,
  loading,
  onPublish,
  onUnpublish,
  onArchive,
  onDuplicate,
  onDelete,
  emptyAction
}: {
  products: Product[];
  loading?: boolean;
  onPublish: (product: Product) => void;
  onUnpublish: (product: Product) => void;
  onArchive: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  onDelete: (product: Product) => void;
  emptyAction?: ReactNode;
}) {
  if (loading) {
    return <TableSkeleton rows={6} />;
  }

  if (products.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          title="No Products Available"
          message="Create a product to start managing seller catalog listings."
        />
        {emptyAction ? <div className="flex justify-center">{emptyAction}</div> : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              {[
                "Product Name",
                "SKU",
                "Category",
                "Brand",
                "Price",
                "Status",
                "Published",
                "Created Date",
                "Actions"
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="text-sm font-bold text-gray-950">{product.product_name}</p>
                  <p className="text-xs text-gray-500">{product.product_slug}</p>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-700">{product.sku}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{product.category_name ?? "Not provided"}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{product.brand_name ?? "Not provided"}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-950">{productPrice(product)}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(product.status)}>{product.status}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {product.published_at ? formatDate(product.published_at) : "Not published"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatDate(product.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Link to={`/products/${product.id}`}>
                      <Button variant="ghost" size="icon" aria-label="View product">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to={`/products/${product.id}/edit`}>
                      <Button variant="ghost" size="icon" aria-label="Edit product">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    {product.status === "published" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onUnpublish(product)}
                        aria-label="Unpublish product"
                      >
                        <Undo2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onPublish(product)}
                        aria-label="Publish product"
                        disabled={product.status === "archived"}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDuplicate(product)}
                      aria-label="Duplicate product"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onArchive(product)} aria-label="Archive product">
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(product)} aria-label="Delete product">
                      <Trash2 className="h-4 w-4 text-brand-red" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
