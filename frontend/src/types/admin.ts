export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";
export type UserRole = "ADMIN" | "SELLER" | "CUSTOMER";

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type DashboardSummaryResponse = {
  total_users: number;
  total_customers: number;
  total_sellers: number;
  total_products: number;
  total_orders: number;
  pending_seller_requests: number;
  revenue: string | number;
  generated_at: string;
  active_users?: number;
};

export type RevenuePoint = {
  month: string;
  revenue: number;
};

export type OrdersPoint = {
  label: string;
  orders: number;
};

export type CategoryPerformance = {
  name: string;
  value: number;
};

export type RecentActivity = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  tone: "success" | "warning" | "info";
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
  createdAt: string;
};

export type RecentOrder = {
  id: string;
  customer: string;
  seller: string;
  amount: number;
  status: "Paid" | "Processing" | "Review";
};

export type SystemStatusItem = {
  label: string;
  value: string;
  state: "healthy" | "degraded" | "attention";
};

export type QuickAction = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export type DashboardSummary = {
  dataSource: "api" | "mock";
  totalUsers: number;
  totalCustomers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  pendingSellerRequests: number;
  revenue: number;
  generatedAt: string;
  monthlyRevenue: RevenuePoint[];
  ordersOverview: OrdersPoint[];
  topCategories: CategoryPerformance[];
  recentActivity: RecentActivity[];
  latestNotifications: NotificationItem[];
  recentOrders: RecentOrder[];
  quickActions: QuickAction[];
  systemStatus: SystemStatusItem[];
};

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
};

export type AdminUserResponse = {
  id: string | number;
  full_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
};

export type UpdateUserStatusRequest = {
  status: UserStatus;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
};

export type CategoryResponse = {
  id: string | number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type CreateCategoryRequest = {
  name: string;
  description?: string | null;
};

export type UpdateCategoryRequest = {
  name?: string | null;
  description?: string | null;
  is_active?: boolean | null;
};

export type AnalyticsData = {
  revenueSeries: Array<{ label: string; value: string; score: number }>;
  topCategories: Array<{ name: string; share: number }>;
  topProducts: Array<{ name: string; orders: number }>;
};

export type AnalyticsResponse = {
  monthly_revenue: string | number;
  monthly_orders: number;
  total_customers: number;
  total_sellers: number;
  top_categories: string[];
  top_products: string[];
};
