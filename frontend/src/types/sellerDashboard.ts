import type { ApiResponse } from "@/types/common";

export type DashboardDatePreset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "this_month"
  | "previous_month"
  | "quarter"
  | "year"
  | "custom";

export interface DashboardDateParams {
  preset?: DashboardDatePreset;
  start_date?: string;
  end_date?: string;
}

export interface DashboardDateWindow {
  preset: DashboardDatePreset;
  start_at: string;
  end_at: string;
}

export interface SellerSummary {
  seller_id: string;
  user_id: string;
  store_name: string;
  seller_status: string;
  store_rating: string | number;
  store_health_score: number;
  account_verification_status: boolean;
  business_email: string;
  business_phone: string;
  logo_url: string | null;
}

export interface DashboardAlert {
  id: string;
  type: string;
  severity: "info" | "warning" | "critical" | string;
  title: string;
  message: string;
  entity_id: string | null;
  entity_type: string | null;
  created_at: string;
}

export interface DashboardChartPoint {
  label: string;
  value: number | string;
  metadata: Record<string, string | number>;
}

export interface DashboardTrendPoint {
  period: string;
  value: number | string;
}

export interface DashboardRankedItem {
  id: string;
  label: string;
  value: number | string;
  metadata: Record<string, string | number>;
}

export interface ProductMetrics {
  total_products: number;
  active_products: number;
  draft_products: number;
  disabled_products: number;
  out_of_stock_products: number;
  low_stock_products: number;
  best_selling_products: DashboardRankedItem[];
  newly_added_products: DashboardRankedItem[];
}

export interface InventoryMetrics {
  total_inventory: number;
  reserved_inventory: number;
  available_inventory: number;
  damaged_inventory: number;
  inventory_value: string | number;
  stock_alerts: DashboardAlert[];
}

export interface WarehouseMetrics {
  total_warehouses: number;
  active_warehouses: number;
  disabled_warehouses: number;
  capacity_utilization: string | number;
  inventory_distribution: DashboardChartPoint[];
  warehouse_performance: DashboardRankedItem[];
}

export interface OrderMetrics {
  total_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  packed_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  returned_orders: number;
}

export interface RevenueMetrics {
  today_revenue: string | number;
  weekly_revenue: string | number;
  monthly_revenue: string | number;
  yearly_revenue: string | number;
  total_revenue: string | number;
  average_order_value: string | number;
  revenue_growth_percentage: string | number;
}

export interface CustomerMetrics {
  total_customers: number;
  returning_customers: number;
  new_customers: number;
  customer_retention_rate: string | number;
  customer_satisfaction_score: string | number;
}

export interface DashboardCharts {
  sales_trend: DashboardTrendPoint[];
  revenue_trend: DashboardTrendPoint[];
  inventory_trend: DashboardTrendPoint[];
  order_trend: DashboardTrendPoint[];
  top_products: DashboardRankedItem[];
  category_sales: DashboardChartPoint[];
  warehouse_capacity: DashboardChartPoint[];
  customer_growth: DashboardTrendPoint[];
  revenue_by_month: DashboardTrendPoint[];
  orders_by_status: DashboardChartPoint[];
  top_selling_categories: DashboardRankedItem[];
  top_selling_products: DashboardRankedItem[];
}

export interface DashboardActivity {
  id: string;
  type: string;
  label: string;
  description: string;
  entity_id: string | null;
  entity_type: string | null;
  created_at: string;
}

export interface DashboardSearchResult {
  id: string;
  type: string;
  label: string;
  description: string | null;
  status: string | null;
  created_at: string;
}

export interface DashboardSearchPayload {
  items: DashboardSearchResult[];
  meta: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface SellerDashboardOverview {
  date_window: DashboardDateWindow;
  seller: SellerSummary;
  products: ProductMetrics;
  inventory: InventoryMetrics;
  warehouses: WarehouseMetrics;
  orders: OrderMetrics;
  revenue: RevenueMetrics;
  customers: CustomerMetrics;
  alerts: DashboardAlert[];
  charts: DashboardCharts;
  recent_activities: DashboardActivity[];
}

export type SellerDashboardOverviewResponse = ApiResponse<SellerDashboardOverview>;
export type SellerDashboardChartsResponse = ApiResponse<DashboardCharts>;
export type SellerDashboardAlertsResponse = ApiResponse<DashboardAlert[]>;
export type SellerDashboardActivitiesResponse = ApiResponse<DashboardActivity[]>;
export type SellerDashboardSearchResponse = ApiResponse<DashboardSearchPayload>;
