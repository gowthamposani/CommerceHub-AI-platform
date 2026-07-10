import {
  Boxes,
  ClipboardList,
  LineChart,
  PackagePlus,
  PackageSearch,
  RefreshCw,
  Store,
  UserRound,
  Warehouse
} from "lucide-react";

import type { DashboardDatePreset } from "@/types/sellerDashboard";

export const DASHBOARD_DATE_PRESETS: Array<{ label: string; value: DashboardDatePreset }> = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 days", value: "last_7_days" },
  { label: "Last 30 days", value: "last_30_days" },
  { label: "This month", value: "this_month" },
  { label: "Previous month", value: "previous_month" },
  { label: "Quarter", value: "quarter" },
  { label: "Year", value: "year" },
  { label: "Custom", value: "custom" }
];

export const SELLER_DASHBOARD_QUICK_ACTIONS = [
  { label: "Add Product", href: "/products/new", icon: PackagePlus },
  { label: "Manage Products", href: "/products", icon: PackageSearch },
  { label: "Manage Inventory", href: "/inventory", icon: Boxes },
  { label: "Create Warehouse", href: "/warehouses/new", icon: Warehouse },
  { label: "Transfer Inventory", href: "/warehouses", icon: RefreshCw },
  { label: "View Orders", href: "/modules", icon: ClipboardList },
  { label: "View Analytics", href: "/seller-dashboard", icon: LineChart },
  { label: "Update Seller Profile", href: "/sellers", icon: UserRound },
  { label: "Seller Management", href: "/sellers", icon: Store }
] as const;
