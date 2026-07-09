import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Boxes,
  LayoutDashboard,
  Home,
  PackageCheck,
  PackageSearch,
  ShieldCheck,
  Store,
  Tags,
  Warehouse
} from "lucide-react";

export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "CommerceHub AI";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "0.1.0";
export const APP_DESCRIPTION = import.meta.env.VITE_APP_DESCRIPTION ?? "Enterprise multi-vendor e-commerce platform";
export const APP_ENVIRONMENT = import.meta.env.VITE_APP_ENVIRONMENT ?? "development";

export const ROUTES = {
  home: "/",
  sellerDashboard: "/seller/dashboard",
  sellers: "/sellers",
  categories: "/categories",
  brands: "/brands",
  products: "/products",
  inventory: "/inventory",
  warehouses: "/warehouses",
  status: "/status",
  modules: "/modules",
  forbidden: "/403",
  serverError: "/500"
} as const;

interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled: boolean;
}

export const FOUNDATION_NAVIGATION: readonly NavigationItem[] = [
  { label: "Foundation", href: ROUTES.home, icon: Home, disabled: false },
  { label: "Seller Dashboard", href: ROUTES.sellerDashboard, icon: LayoutDashboard, disabled: false },
  { label: "Seller Management", href: ROUTES.sellers, icon: Store, disabled: false },
  { label: "Category Management", href: ROUTES.categories, icon: Tags, disabled: false },
  { label: "Brand Management", href: ROUTES.brands, icon: BadgeCheck, disabled: false },
  { label: "Product Management", href: ROUTES.products, icon: PackageSearch, disabled: false },
  { label: "Inventory Management", href: ROUTES.inventory, icon: PackageCheck, disabled: false },
  { label: "Warehouse Management", href: ROUTES.warehouses, icon: Warehouse, disabled: false },
  { label: "System Status", href: ROUTES.status, icon: ShieldCheck, disabled: false },
  { label: "Module Slots", href: ROUTES.modules, icon: Boxes, disabled: false }
] as const;
