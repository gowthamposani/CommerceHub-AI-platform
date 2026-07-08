export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";
export type UserRole = "ADMIN" | "SELLER" | "CUSTOMER";

export type DashboardSummary = {
  totalUsers: number;
  totalCustomers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  pendingSellerRequests: number;
  activeUsers: number;
  revenue: string;
  queue: Array<{ label: string; count: number }>;
};

export type DashboardSummaryResponse = {
  total_users: number;
  total_customers: number;
  total_sellers: number;
  total_products: number;
  total_orders: number;
  pending_seller_requests: number;
  active_users: number;
  revenue: string | number;
  generated_at: string;
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
