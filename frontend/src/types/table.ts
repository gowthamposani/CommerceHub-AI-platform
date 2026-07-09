import type { ReactNode } from "react";

import type { SortDirection } from "@/types/common";

export interface TableColumn<T> {
  id: string;
  header: string;
  accessor?: keyof T;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  hidden?: boolean;
  align?: "left" | "center" | "right";
}

export interface TableSort {
  columnId: string;
  direction: SortDirection;
}
