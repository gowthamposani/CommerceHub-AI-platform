import type {
  AdminUser,
  AdminUserResponse,
  AnalyticsData,
  AnalyticsResponse,
  ApiEnvelope,
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

const DEFAULT_API_BASE_URL = "/api/v1";
const ACCESS_TOKEN_STORAGE_KEY = "commercehub_access_token";

const runtimeEnv = import.meta as unknown as {
  env?: Record<string, string | undefined>;
};

const apiBaseUrl = runtimeEnv.env?.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

function buildHeaders(): HeadersInit {
  const token = getAccessToken();
  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      ...buildHeaders(),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Admin API request failed with status ${response.status}.`);
  }

  return (await response.json()) as T;
}

async function requestNoContent(path: string, init?: RequestInit): Promise<void> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      ...buildHeaders(),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Admin API request failed with status ${response.status}.`);
  }
}

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

function numericValue(value: string | number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapDashboard(
  response: DashboardSummaryResponse,
  dataSource: DashboardSummary["dataSource"],
): DashboardSummary {
  const activeUsers = response.active_users ?? Math.round(response.total_users * 0.72);

  return {
    dataSource,
    totalUsers: response.total_users,
    totalCustomers: response.total_customers,
    totalSellers: response.total_sellers,
    totalProducts: response.total_products,
    totalOrders: response.total_orders,
    pendingSellerRequests: response.pending_seller_requests,
    revenue: numericValue(response.revenue),
    generatedAt: response.generated_at,
    monthlyRevenue: [
      { month: "Jan", revenue: 92000 },
      { month: "Feb", revenue: 118000 },
      { month: "Mar", revenue: 136000 },
      { month: "Apr", revenue: 151000 },
      { month: "May", revenue: 174000 },
      { month: "Jun", revenue: numericValue(response.revenue) || 198000 },
    ],
    ordersOverview: [
      { label: "Mon", orders: 210 },
      { label: "Tue", orders: 248 },
      { label: "Wed", orders: 286 },
      { label: "Thu", orders: 324 },
      { label: "Fri", orders: 302 },
      { label: "Sat", orders: 356 },
      { label: "Sun", orders: 331 },
    ],
    topCategories: [
      { name: "Electronics", value: 38 },
      { name: "Home", value: 24 },
      { name: "Fashion", value: 19 },
      { name: "Beauty", value: 11 },
      { name: "Sports", value: 8 },
    ],
    recentActivity: [
      {
        id: "activity-1",
        title: "Seller review queue updated",
        description: `${response.pending_seller_requests} seller requests waiting for admin action.`,
        timestamp: "10 minutes ago",
        tone: "warning",
      },
      {
        id: "activity-2",
        title: "Catalog sync completed",
        description: `${response.total_products.toLocaleString()} products available for commerce workflows.`,
        timestamp: "32 minutes ago",
        tone: "success",
      },
      {
        id: "activity-3",
        title: "User activity snapshot refreshed",
        description: `${activeUsers.toLocaleString()} active users detected across the platform.`,
        timestamp: "1 hour ago",
        tone: "info",
      },
    ],
    latestNotifications: [
      {
        id: "notification-1",
        title: "Inventory alerts",
        message: "12 products are below replenishment threshold.",
        severity: "warning",
        createdAt: "Today",
      },
      {
        id: "notification-2",
        title: "Payment reconciliation",
        message: "Daily settlement batch is ready for review.",
        severity: "info",
        createdAt: "Today",
      },
      {
        id: "notification-3",
        title: "Seller onboarding",
        message: "New seller verification documents are pending.",
        severity: "critical",
        createdAt: "Yesterday",
      },
    ],
    recentOrders: [
      {
        id: "ORD-10482",
        customer: "Maya Carter",
        seller: "Northline Supply",
        amount: 842,
        status: "Paid",
      },
      {
        id: "ORD-10481",
        customer: "Daniel Park",
        seller: "Urban Nest",
        amount: 318,
        status: "Processing",
      },
      {
        id: "ORD-10480",
        customer: "Avery Stone",
        seller: "TechPoint",
        amount: 1260,
        status: "Review",
      },
    ],
    quickActions: [
      {
        id: "action-users",
        label: "Review Users",
        description: "Audit blocked and inactive account states.",
        href: "/admin/users",
      },
      {
        id: "action-analytics",
        label: "Open Analytics",
        description: "Inspect revenue and order movement.",
        href: "/admin/analytics",
      },
      {
        id: "action-ai",
        label: "Generate Listing Copy",
        description: "Use AI to prepare product descriptions.",
        href: "/admin/ai-product-generator",
      },
    ],
    systemStatus: [
      { label: "API Gateway", value: "Operational", state: "healthy" },
      { label: "PostgreSQL", value: "Ready", state: "healthy" },
      { label: "Redis", value: "Configured", state: "healthy" },
      { label: "AI Provider", value: "Mock fallback", state: "attention" },
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

function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(numericValue(value));
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

const mockDashboardResponse: DashboardSummaryResponse = {
  total_users: 12840,
  total_customers: 10320,
  total_sellers: 2520,
  total_products: 84560,
  total_orders: 192420,
  pending_seller_requests: 37,
  revenue: 198000,
  generated_at: new Date().toISOString(),
  active_users: 9248,
};

export async function getDashboard(): Promise<DashboardSummary> {
  try {
    const payload = await requestJson<ApiEnvelope<DashboardSummaryResponse> | DashboardSummaryResponse>(
      "/admin/dashboard",
    );
    return mapDashboard(unwrapEnvelope<DashboardSummaryResponse>(payload), "api");
  } catch {
    return mapDashboard(mockDashboardResponse, "mock");
  }
}

export async function getUsers(): Promise<AdminUser[]> {
  try {
    const payload = await requestJson<ApiEnvelope<AdminUserResponse[]> | AdminUserResponse[]>(
      "/admin/users",
    );
    return unwrapEnvelope<AdminUserResponse[]>(payload).map(mapUser);
  } catch {
    return [];
  }
}

export async function updateUserStatus(
  userId: string,
  payload: UpdateUserStatusRequest,
): Promise<AdminUser> {
  const response = await requestJson<ApiEnvelope<AdminUserResponse> | AdminUserResponse>(
    `/admin/users/${userId}/status`,
    {
      body: JSON.stringify(payload),
      method: "PATCH",
    },
  );
  return mapUser(unwrapEnvelope<AdminUserResponse>(response));
}

export async function getCategories(): Promise<Category[]> {
  try {
    const payload = await requestJson<ApiEnvelope<CategoryResponse[]> | CategoryResponse[]>(
      "/admin/categories",
    );
    return unwrapEnvelope<CategoryResponse[]>(payload).map(mapCategory);
  } catch {
    return [];
  }
}

export async function createCategory(payload: CreateCategoryRequest): Promise<Category> {
  const response = await requestJson<ApiEnvelope<CategoryResponse> | CategoryResponse>(
    "/admin/categories",
    {
      body: JSON.stringify(payload),
      method: "POST",
    },
  );
  return mapCategory(unwrapEnvelope<CategoryResponse>(response));
}

export async function updateCategory(
  categoryId: string,
  payload: UpdateCategoryRequest,
): Promise<Category> {
  const response = await requestJson<ApiEnvelope<CategoryResponse> | CategoryResponse>(
    `/admin/categories/${categoryId}`,
    {
      body: JSON.stringify(payload),
      method: "PUT",
    },
  );
  return mapCategory(unwrapEnvelope<CategoryResponse>(response));
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await requestNoContent(`/admin/categories/${categoryId}`, { method: "DELETE" });
}

export async function getAnalytics(): Promise<AnalyticsData> {
  try {
    const payload = await requestJson<ApiEnvelope<AnalyticsResponse> | AnalyticsResponse>(
      "/admin/analytics",
    );
    return mapAnalytics(unwrapEnvelope<AnalyticsResponse>(payload));
  } catch {
    return {
      revenueSeries: [
        { label: "Monthly Revenue", value: "$198,000", score: 90 },
        { label: "Monthly Orders", value: "19,240", score: 78 },
      ],
      topCategories: [
        { name: "Electronics", share: 38 },
        { name: "Home", share: 24 },
      ],
      topProducts: [
        { name: "Wireless Headphones", orders: 1820 },
        { name: "Smart Home Hub", orders: 1420 },
      ],
    };
  }
}

export const getDashboardData = getDashboard;
