import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { PageLoader } from "@/components/common/PageLoader";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { PublicLayout } from "@/layouts/PublicLayout";
import { ROUTES } from "@/constants/app";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const FoundationPage = lazy(() => import("@/pages/shared/FoundationPage"));
const ModuleSlotsPage = lazy(() => import("@/pages/shared/ModuleSlotsPage"));
const StatusPage = lazy(() => import("@/pages/shared/StatusPage"));
const AIProductGenerator = lazy(() => import("@/pages/admin/AIProductGenerator"));
const AdminAnalytics = lazy(() => import("@/pages/admin/Analytics"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminNotifications = lazy(() => import("@/pages/admin/Notifications"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));
const AdminUsers = lazy(() => import("@/pages/admin/Users"));
const SellerDashboardPage = lazy(() => import("@/pages/sellerDashboard/SellerDashboardPage"));
const SellerListPage = lazy(() => import("@/pages/sellers/SellerListPage"));
const SellerCreatePage = lazy(() => import("@/pages/sellers/SellerCreatePage"));
const SellerViewPage = lazy(() => import("@/pages/sellers/SellerViewPage"));
const SellerEditPage = lazy(() => import("@/pages/sellers/SellerEditPage"));
const SellerSettingsPage = lazy(() => import("@/pages/sellers/SellerSettingsPage"));
const CategoryListPage = lazy(() => import("@/pages/categories/CategoryListPage"));
const CategoryCreatePage = lazy(() => import("@/pages/categories/CategoryCreatePage"));
const CategoryViewPage = lazy(() => import("@/pages/categories/CategoryViewPage"));
const CategoryEditPage = lazy(() => import("@/pages/categories/CategoryEditPage"));
const BrandListPage = lazy(() => import("@/pages/brands/BrandListPage"));
const BrandCreatePage = lazy(() => import("@/pages/brands/BrandCreatePage"));
const BrandViewPage = lazy(() => import("@/pages/brands/BrandViewPage"));
const BrandEditPage = lazy(() => import("@/pages/brands/BrandEditPage"));
const ProductListPage = lazy(() => import("@/pages/products/ProductListPage"));
const ProductCreatePage = lazy(() => import("@/pages/products/ProductCreatePage"));
const ProductViewPage = lazy(() => import("@/pages/products/ProductViewPage"));
const ProductEditPage = lazy(() => import("@/pages/products/ProductEditPage"));
const ProductPreviewPage = lazy(() => import("@/pages/products/ProductPreviewPage"));
const InventoryListPage = lazy(() => import("@/pages/inventory/InventoryListPage"));
const InventoryViewPage = lazy(() => import("@/pages/inventory/InventoryViewPage"));
const InventoryLowStockPage = lazy(() => import("@/pages/inventory/InventoryLowStockPage"));
const WarehouseListPage = lazy(() => import("@/pages/warehouses/WarehouseListPage"));
const WarehouseCreatePage = lazy(() => import("@/pages/warehouses/WarehouseCreatePage"));
const WarehouseViewPage = lazy(() => import("@/pages/warehouses/WarehouseViewPage"));
const WarehouseEditPage = lazy(() => import("@/pages/warehouses/WarehouseEditPage"));
const WarehouseInventoryPage = lazy(() => import("@/pages/warehouses/WarehouseInventoryPage"));
const WarehouseCapacityPage = lazy(() => import("@/pages/warehouses/WarehouseCapacityPage"));
const WarehouseActivityPage = lazy(() => import("@/pages/warehouses/WarehouseActivityPage"));
const ForbiddenPage = lazy(() => import("@/pages/errors/ForbiddenPage"));
const ServerErrorPage = lazy(() => import("@/pages/errors/ServerErrorPage"));
const NotFoundPage = lazy(() => import("@/pages/errors/NotFoundPage"));

function lazyElement(element: JSX.Element) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

function sellerProtectedElement(element: JSX.Element) {
  return lazyElement(<ProtectedRoute allowedRoles={["seller", "admin"]}>{element}</ProtectedRoute>);
}

function adminProtectedElement(element: JSX.Element) {
  return lazyElement(<ProtectedRoute allowedRoles={["admin"]}>{element}</ProtectedRoute>);
}

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <PublicLayout />,
    errorElement: <ServerErrorPage />,
    children: [
      { path: "login", element: lazyElement(<LoginPage />) },
      { path: "register", element: lazyElement(<RegisterPage />) }
    ]
  },
  {
    path: ROUTES.home,
    element: <AppLayout />,
    errorElement: <ServerErrorPage />,
    children: [
      { index: true, element: lazyElement(<FoundationPage />) },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: "dashboard", element: adminProtectedElement(<AdminDashboard />) },
          { path: "users", element: adminProtectedElement(<AdminUsers />) },
          { path: "analytics", element: adminProtectedElement(<AdminAnalytics />) },
          { path: "notifications", element: adminProtectedElement(<AdminNotifications />) },
          { path: "ai-tools", element: adminProtectedElement(<AIProductGenerator />) },
          { path: "ai-product-generator", element: <Navigate to="/admin/ai-tools" replace /> },
          { path: "settings", element: adminProtectedElement(<AdminSettings />) }
        ]
      },
      { path: "seller/dashboard", element: sellerProtectedElement(<SellerDashboardPage />) },
      { path: "seller-dashboard", element: sellerProtectedElement(<SellerDashboardPage />) },
      { path: "sellers", element: sellerProtectedElement(<SellerListPage />) },
      { path: "sellers/new", element: sellerProtectedElement(<SellerCreatePage />) },
      { path: "sellers/:sellerId", element: sellerProtectedElement(<SellerViewPage />) },
      { path: "sellers/:sellerId/edit", element: sellerProtectedElement(<SellerEditPage />) },
      { path: "sellers/:sellerId/settings", element: sellerProtectedElement(<SellerSettingsPage />) },
      { path: "categories", element: sellerProtectedElement(<CategoryListPage />) },
      { path: "categories/new", element: sellerProtectedElement(<CategoryCreatePage />) },
      { path: "categories/:categoryId", element: sellerProtectedElement(<CategoryViewPage />) },
      { path: "categories/:categoryId/edit", element: sellerProtectedElement(<CategoryEditPage />) },
      { path: "brands", element: sellerProtectedElement(<BrandListPage />) },
      { path: "brands/new", element: sellerProtectedElement(<BrandCreatePage />) },
      { path: "brands/:brandId", element: sellerProtectedElement(<BrandViewPage />) },
      { path: "brands/:brandId/edit", element: sellerProtectedElement(<BrandEditPage />) },
      { path: "products", element: sellerProtectedElement(<ProductListPage />) },
      { path: "products/new", element: sellerProtectedElement(<ProductCreatePage />) },
      { path: "products/:productId", element: sellerProtectedElement(<ProductViewPage />) },
      { path: "products/:productId/edit", element: sellerProtectedElement(<ProductEditPage />) },
      { path: "products/:productId/preview", element: sellerProtectedElement(<ProductPreviewPage />) },
      { path: "inventory", element: sellerProtectedElement(<InventoryListPage />) },
      { path: "inventory/low-stock", element: sellerProtectedElement(<InventoryLowStockPage />) },
      { path: "inventory/:inventoryId", element: sellerProtectedElement(<InventoryViewPage />) },
      { path: "warehouses", element: sellerProtectedElement(<WarehouseListPage />) },
      { path: "warehouses/new", element: sellerProtectedElement(<WarehouseCreatePage />) },
      { path: "warehouses/:warehouseId", element: sellerProtectedElement(<WarehouseViewPage />) },
      { path: "warehouses/:warehouseId/edit", element: sellerProtectedElement(<WarehouseEditPage />) },
      { path: "warehouses/:warehouseId/inventory", element: sellerProtectedElement(<WarehouseInventoryPage />) },
      { path: "warehouses/:warehouseId/capacity", element: sellerProtectedElement(<WarehouseCapacityPage />) },
      { path: "warehouses/:warehouseId/activity", element: sellerProtectedElement(<WarehouseActivityPage />) },
      { path: "modules", element: lazyElement(<ModuleSlotsPage />) },
      { path: "status", element: lazyElement(<StatusPage />) },
      { path: "403", element: lazyElement(<ForbiddenPage />) },
      { path: "500", element: lazyElement(<ServerErrorPage />) },
      { path: "*", element: lazyElement(<NotFoundPage />) }
    ]
  }
]);
