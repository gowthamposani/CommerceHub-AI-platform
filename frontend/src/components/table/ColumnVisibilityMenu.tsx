import { Eye } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Popover } from "@/components/ui/Popover";

export function ColumnVisibilityMenu({
  columns,
  visibleColumnIds,
  onChange
}: {
  columns: readonly { id: string; header: string }[];
  visibleColumnIds: string[];
  onChange: (columnIds: string[]) => void;
}) {
  function toggleColumn(columnId: string) {
    onChange(
      visibleColumnIds.includes(columnId)
        ? visibleColumnIds.filter((id) => id !== columnId)
        : [...visibleColumnIds, columnId]
    );
  }

  return (
    <Popover
      trigger={
        <Button variant="secondary">
          <Eye className="h-4 w-4" />
          Columns
        </Button>
      }
    >
      <div className="space-y-3">
        <p className="text-sm font-bold text-gray-900">Column visibility</p>
        <div className="grid gap-2">
          {columns.map((column) => (
            <label key={column.id} className="flex items-center gap-2 text-sm text-gray-700">
              <Checkbox checked={visibleColumnIds.includes(column.id)} onChange={() => toggleColumn(column.id)} />
              {column.header}
            </label>
          ))}
        </div>
      </div>
    </Popover>
  );
}
