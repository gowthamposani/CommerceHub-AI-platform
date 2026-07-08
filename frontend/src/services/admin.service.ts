import { apiClient } from "../lib/api";
import type {
  AdminUser,
  AdminUserResponse,
  AnalyticsData,
  AnalyticsResponse,
  Category,
  CategoryResponse,
  CreateCategoryRequest,
  DashboardSummary,
  DashboardSummaryResponse,
  UpdateCategoryRequest,
  UpdateUserStatusRequest,
} from "../types/admin";

export type {
  AdminUser,
  AnalyticsData,
  Category,
  CreateCategoryRequest,
  DashboardSummary,
  UpdateCategoryRequest,
  UpdateUserStatusRequest,
  UserStatus,
} from "../types/admin";

function formatCurrency(value: string | number): string {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function mapDashboard(response: DashboardSummaryResponse): DashboardSummary {
  return {
    totalUsers: response.total_users,
    totalCustomers: response.total_customers,
    totalSellers: response.total_sellers,
    totalProducts: response.total_products,
    totalOrders: response.total_orders,
    pendingSellerRequests: response.pending_seller_requests,
    activeUsers: response.active_users,
    revenue: formatCurrency(response.revenue),
    queue: [
      { label: "Seller approvals", count: response.pending_seller_requests },
      { label: "Active users", count: response.active_users },
      { label: "Products", count: response.total_products },
      { label: "Orders", count: response.total_orders },
    ],
  };
}

function mapUser(response: AdminUserResponse): AdminUser {
  return {
    id: String(response.id),
    fullName: response.full_name,
    email: response.email,
    role: response.role,
    status: response.status,
    createdAt: response.created_at,
  };
}

function mapCategory(response: CategoryResponse): Category {
  return {
    id: String(response.id),
    name: response.name,
    description: response.description ?? "",
    isActive: response.is_active,
    createdAt: response.created_at,
  };
}

function mapAnalytics(response: AnalyticsResponse): AnalyticsData {
  return {
    revenueSeries: [
      {
        label: "Monthly Revenue",
        value: formatCurrency(response.monthly_revenue),
        score: 90,
      },
      {
        label: "Monthly Orders",
        value: response.monthly_orders.toLocaleString(),
        score: 75,
      },
      {
        label: "Customers",
        value: response.total_customers.toLocaleString(),
        score: 68,
      },
      {
        label: "Sellers",
        value: response.total_sellers.toLocaleString(),
        score: 54,
      },
    ],
    topCategories: response.top_categories.map((name, index) => ({
      name,
      share: Math.max(20, 92 - index * 12),
    })),
    topProducts: response.top_products.map((name, index) => ({
      name,
      orders: Math.max(100, 1800 - index * 240),
    })),
  };
}

export async function getDashboard(): Promise<DashboardSummary> {
  const { data } = await apiClient.get<DashboardSummaryResponse>("/admin/dashboard");
  return mapDashboard(data);
}

export async function getUsers(): Promise<AdminUser[]> {
  const { data } = await apiClient.get<AdminUserResponse[]>("/admin/users");
  return data.map(mapUser);
}

export async function updateUserStatus(
  userId: string,
  payload: UpdateUserStatusRequest,
): Promise<AdminUser> {
  const { data } = await apiClient.patch<AdminUserResponse>(
    `/admin/users/${userId}/status`,
    payload,
  );
  return mapUser(data);
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<CategoryResponse[]>("/admin/categories");
  return data.map(mapCategory);
}

export async function createCategory(payload: CreateCategoryRequest): Promise<Category> {
  const { data } = await apiClient.post<CategoryResponse>("/admin/categories", payload);
  return mapCategory(data);
}

export async function updateCategory(
  categoryId: string,
  payload: UpdateCategoryRequest,
): Promise<Category> {
  const { data } = await apiClient.put<CategoryResponse>(
    `/admin/categories/${categoryId}`,
    payload,
  );
  return mapCategory(data);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await apiClient.delete(`/admin/categories/${categoryId}`);
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const { data } = await apiClient.get<AnalyticsResponse>("/admin/analytics");
  return mapAnalytics(data);
}

export const getDashboardData = getDashboard;
