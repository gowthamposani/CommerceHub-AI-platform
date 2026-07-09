import { apiClient } from "../lib/api";
import type {
  AdminUser,
  AdminUserResponse,
  AnalyticsData,
  AnalyticsResponse,
  ApiEnvelope,
  Category,
  CategoryPerformance,
  CategoryResponse,
  CreateCategoryRequest,
  DashboardSummary,
  DashboardSummaryResponse,
  NotificationHistoryItem,
  NotificationTemplate,
  SendNotificationRequest,
  UpdateCategoryRequest,
  UpdateUserStatusRequest,
} from "../types/admin";

type NotificationTemplateResponse = NotificationTemplate & {
  template_id?: string | number;
  template_name?: string;
};

type NotificationHistoryResponse = NotificationHistoryItem & {
  created_at?: string;
};

export type {
  AdminUser,
  AnalyticsData,
  Category,
  CreateCategoryRequest,
  DashboardSummary,
  NotificationHistoryItem,
  NotificationTemplate,
  SendNotificationRequest,
  UpdateCategoryRequest,
  UpdateUserStatusRequest,
  UserStatus,
} from "../types/admin";

function unwrapEnvelope<T>(payload: T | ApiEnvelope<T>): T {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "success" in payload &&
    "data" in payload
  ) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}

function numericValue(value: string | number | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number | undefined): string {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function formatCurrency(value: string | number | undefined): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(numericValue(value));
}

function normalizeCategories(
  categories: AnalyticsResponse["top_categories"],
): CategoryPerformance[] {
  if (!categories) {
    return [];
  }

  return categories
    .map((category) =>
      typeof category === "string"
        ? null
        : {
            name: category.name,
            value: category.value,
          },
    )
    .filter((category): category is CategoryPerformance => category !== null);
}

function mapDashboard(response: DashboardSummaryResponse): DashboardSummary {
  return {
    totalUsers: response.total_users,
    totalCustomers: response.total_customers,
    totalSellers: response.total_sellers,
    totalProducts: response.total_products,
    totalOrders: response.total_orders,
    pendingSellerRequests: response.pending_seller_requests,
    revenue: numericValue(response.revenue),
    generatedAt: response.generated_at,
    monthlyRevenue: response.monthly_revenue ?? [],
    ordersOverview: response.orders_overview ?? [],
    topCategories: response.top_categories ?? [],
    recentActivity: response.recent_activity ?? [],
    latestNotifications: response.latest_notifications ?? [],
    recentOrders: response.recent_orders ?? [],
    quickActions: response.quick_actions ?? [],
    systemStatus: response.system_status ?? [],
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
  const totalRevenue = response.total_revenue ?? response.monthly_revenue;
  const activeCustomers = response.active_customers ?? response.total_customers;
  const activeSellers = response.active_sellers ?? response.total_sellers;
  const topCategories = response.category_performance ?? normalizeCategories(response.top_categories);

  return {
    generatedAt: response.generated_at,
    metrics: [
      { label: "Revenue", value: formatCurrency(totalRevenue) },
      { label: "Today Orders", value: formatNumber(response.today_orders) },
      { label: "Monthly Orders", value: formatNumber(response.monthly_orders) },
      { label: "Active Customers", value: formatNumber(activeCustomers) },
      { label: "Active Sellers", value: formatNumber(activeSellers) },
      { label: "Best Category", value: response.best_selling_category ?? "No data available" },
      { label: "Low Stock Products", value: formatNumber(response.low_stock_products) },
    ],
    revenueSeries: response.revenue_series ?? [],
    ordersOverview: response.orders_overview ?? [],
    topCategories,
  };
}

function mapNotificationTemplate(response: NotificationTemplateResponse): NotificationTemplate {
  return {
    id: String(response.id ?? response.template_id ?? response.name),
    name: response.name ?? response.template_name ?? "No data available",
    channel: response.channel ?? "No data available",
  };
}

function mapNotificationHistory(response: NotificationHistoryResponse): NotificationHistoryItem {
  return {
    id: String(response.id),
    title: response.title,
    channel: response.channel,
    status: response.status,
    createdAt: response.createdAt ?? response.created_at ?? "",
  };
}

export async function getDashboard(): Promise<DashboardSummary> {
  const response = await apiClient.get<ApiEnvelope<DashboardSummaryResponse> | DashboardSummaryResponse>(
    "/admin/dashboard",
  );
  return mapDashboard(unwrapEnvelope<DashboardSummaryResponse>(response.data));
}

export async function getUsers(): Promise<AdminUser[]> {
  const response = await apiClient.get<ApiEnvelope<AdminUserResponse[]> | AdminUserResponse[]>(
    "/admin/users",
  );
  return unwrapEnvelope<AdminUserResponse[]>(response.data).map(mapUser);
}

export async function updateUserStatus(
  userId: string,
  payload: UpdateUserStatusRequest,
): Promise<AdminUser> {
  const response = await apiClient.patch<ApiEnvelope<AdminUserResponse> | AdminUserResponse>(
    `/admin/users/${userId}/status`,
    payload,
  );
  return mapUser(unwrapEnvelope<AdminUserResponse>(response.data));
}

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<ApiEnvelope<CategoryResponse[]> | CategoryResponse[]>(
    "/admin/categories",
  );
  return unwrapEnvelope<CategoryResponse[]>(response.data).map(mapCategory);
}

export async function createCategory(payload: CreateCategoryRequest): Promise<Category> {
  const response = await apiClient.post<ApiEnvelope<CategoryResponse> | CategoryResponse>(
    "/admin/categories",
    payload,
  );
  return mapCategory(unwrapEnvelope<CategoryResponse>(response.data));
}

export async function updateCategory(
  categoryId: string,
  payload: UpdateCategoryRequest,
): Promise<Category> {
  const response = await apiClient.put<ApiEnvelope<CategoryResponse> | CategoryResponse>(
    `/admin/categories/${categoryId}`,
    payload,
  );
  return mapCategory(unwrapEnvelope<CategoryResponse>(response.data));
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await apiClient.delete(`/admin/categories/${categoryId}`);
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const response = await apiClient.get<ApiEnvelope<AnalyticsResponse> | AnalyticsResponse>(
    "/admin/analytics",
  );
  return mapAnalytics(unwrapEnvelope<AnalyticsResponse>(response.data));
}

export async function getNotificationTemplates(): Promise<NotificationTemplate[]> {
  const response = await apiClient.get<
    ApiEnvelope<NotificationTemplateResponse[]> | NotificationTemplateResponse[]
  >("/notifications/templates");
  return unwrapEnvelope<NotificationTemplateResponse[]>(response.data).map(mapNotificationTemplate);
}

export async function getNotificationHistory(): Promise<NotificationHistoryItem[]> {
  const response = await apiClient.get<
    ApiEnvelope<NotificationHistoryResponse[]> | NotificationHistoryResponse[]
  >("/notifications/history");
  return unwrapEnvelope<NotificationHistoryResponse[]>(response.data).map(mapNotificationHistory);
}

export async function sendNotification(payload: SendNotificationRequest): Promise<void> {
  await apiClient.post("/notifications/send", payload);
}

export const getDashboardData = getDashboard;
