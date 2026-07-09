import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/table/TableSkeleton";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { InventoryTransaction } from "@/types/inventory";
import { formatDate, formatNumber } from "@/utils/formatters";

function transactionLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function InventoryHistoryTable({
  transactions,
  loading
}: {
  transactions: InventoryTransaction[];
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-bold text-gray-950">Inventory History</h2>
      </CardHeader>
      <CardContent>
        {loading ? (
          <TableSkeleton rows={5} />
        ) : transactions.length === 0 ? (
          <EmptyState title="No Inventory History" message="Stock transactions will appear after inventory changes." />
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Type", "Quantity", "Previous", "Current", "Reference", "Performed By", "Date"].map((header) => (
                      <th key={header} className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-4 py-3">
                        <Badge tone="info">{transactionLabel(transaction.transaction_type)}</Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-950">{formatNumber(transaction.quantity)}</td>
                      <td className="px-4 py-3 text-gray-700">{formatNumber(transaction.previous_quantity)}</td>
                      <td className="px-4 py-3 text-gray-700">{formatNumber(transaction.current_quantity)}</td>
                      <td className="px-4 py-3 text-gray-700">{transaction.reference_number ?? "-"}</td>
                      <td className="px-4 py-3 text-gray-700">{transaction.performed_by ?? "-"}</td>
                      <td className="px-4 py-3 text-gray-700">{formatDate(transaction.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
