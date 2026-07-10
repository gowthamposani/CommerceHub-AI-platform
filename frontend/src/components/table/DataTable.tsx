import { ChevronDown, ChevronUp } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import type { TableColumn, TableSort } from "@/types/table";
import { cn } from "@/utils/cn";

interface DataTableProps<T extends { id: string }> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  sort?: TableSort;
  selectedIds?: string[];
  onSortChange?: (sort: TableSort) => void;
  onSelectionChange?: (ids: string[]) => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  sort,
  selectedIds = [],
  onSortChange,
  onSelectionChange
}: DataTableProps<T>) {
  const visibleColumns = columns.filter((column) => !column.hidden);
  const allSelected = data.length > 0 && data.every((row) => selectedIds.includes(row.id));

  function toggleAll() {
    onSelectionChange?.(allSelected ? [] : data.map((row) => row.id));
  }

  function toggleRow(id: string) {
    onSelectionChange?.(
      selectedIds.includes(id) ? selectedIds.filter((selectedId) => selectedId !== id) : [...selectedIds, id]
    );
  }

  if (!loading && data.length === 0) {
    return <EmptyState title="No records found" message="Adjust search or filters when module data is connected." />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-4 py-3">
                <Checkbox checked={allSelected} onChange={toggleAll} aria-label="Select all rows" />
              </th>
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500",
                    column.align === "center" ? "text-center" : null,
                    column.align === "right" ? "text-right" : null
                  )}
                >
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-0 py-0 text-xs uppercase tracking-wide"
                      onClick={() =>
                        onSortChange?.({
                          columnId: column.id,
                          direction: sort?.columnId === column.id && sort.direction === "asc" ? "desc" : "asc"
                        })
                      }
                    >
                      {column.header}
                      {sort?.columnId === column.id && sort.direction === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedIds.includes(row.id)}
                    onChange={() => toggleRow(row.id)}
                    aria-label="Select row"
                  />
                </td>
                {visibleColumns.map((column) => (
                  <td key={column.id} className="px-4 py-3 text-sm text-gray-700">
                    {column.cell ? column.cell(row) : String(row[column.accessor as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
